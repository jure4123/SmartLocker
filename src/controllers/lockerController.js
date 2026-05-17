const Locker = require("../models/Locker");
const Reservation = require("../models/Reservation");
const AccessLog = require("../models/AccessLog");

async function getLockers(req, res) {
  try {
    const lockers = await Locker.find().populate("owner", "name email role");
    return res.json(lockers);
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri branju paketnikov", error: error.message });
  }
}

async function getLockerById(req, res) {
  try {
    const locker = await Locker.findById(req.params.id).populate("owner", "name email role");

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    return res.json(locker);
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri branju paketnika", error: error.message });
  }
}

async function createLocker(req, res) {
  try {
    if (req.user.role !== "host") {
      return res.status(403).json({ message: "Samo host lahko doda paketnik" });
    }

    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Naziv in lokacija sta obvezna" });
    }

    const locker = await Locker.create({
      name,
      location,
      description,
      owner: req.user.id
    });

    return res.status(201).json({
      message: "Paketnik ustvarjen",
      locker
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri ustvarjanju paketnika", error: error.message });
  }
}

async function updateLocker(req, res) {
  try {
    const locker = await Locker.findById(req.params.id);

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    if (locker.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Lahko urejaš samo svoje paketnike" });
    }

    const { name, location, description, status } = req.body;

    if (name !== undefined) locker.name = name;
    if (location !== undefined) locker.location = location;
    if (description !== undefined) locker.description = description;
    if (status !== undefined) locker.status = status;

    await locker.save();

    return res.json({
      message: "Paketnik posodobljen",
      locker
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri posodabljanju paketnika", error: error.message });
  }
}

async function deleteLocker(req, res) {
  try {
    const locker = await Locker.findById(req.params.id);

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    if (locker.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Lahko izbrišeš samo svoje paketnike" });
    }

    await Locker.findByIdAndDelete(req.params.id);

    return res.json({ message: "Paketnik izbrisan" });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri brisanju paketnika", error: error.message });
  }
}

async function unlockLocker(req, res) {
  try {
    const lockerId = req.params.id;
    const { accessCode } = req.body;

    const locker = await Locker.findById(lockerId);

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    if (locker.status === "inactive") {
      await AccessLog.create({
        locker: locker._id,
        user: req.user ? req.user.id : null,
        action: "unlock",
        result: "denied",
        message: "Paketnik je neaktiven"
      });

      return res.status(403).json({ message: "Paketnik je neaktiven" });
    }

    const now = new Date();

    let reservationQuery = {
      locker: locker._id,
      status: "active",
      startAt: { $lte: now },
      endAt: { $gte: now }
    };

    if (accessCode) {
      reservationQuery.accessCode = accessCode;
    } else if (req.user && req.user.role === "guest") {
      reservationQuery.guest = req.user.id;
    } else if (req.user && req.user.role === "host" && locker.owner.toString() === req.user.id) {
      locker.status = "unlocked";
      await locker.save();

      await AccessLog.create({
        locker: locker._id,
        user: req.user.id,
        action: "unlock",
        result: "success",
        message: "Host je odklenil svoj paketnik"
      });

      return res.json({
        message: "Paketnik odklenjen kot host",
        locker
      });
    } else {
      await AccessLog.create({
        locker: locker._id,
        user: req.user ? req.user.id : null,
        action: "unlock",
        result: "denied",
        message: "Manjka dostopna koda ali veljaven uporabnik"
      });

      return res.status(403).json({ message: "Manjka dostopna koda ali veljaven uporabnik" });
    }

    const reservation = await Reservation.findOne(reservationQuery);

    if (!reservation) {
      await AccessLog.create({
        locker: locker._id,
        user: req.user ? req.user.id : null,
        action: "unlock",
        result: "denied",
        message: "Ni aktivne rezervacije ali je koda napačna"
      });

      return res.status(403).json({ message: "Dostop zavrnjen. Rezervacija ni aktivna ali je koda napačna." });
    }

    locker.status = "unlocked";
    await locker.save();

    await AccessLog.create({
      locker: locker._id,
      user: req.user ? req.user.id : reservation.guest,
      reservation: reservation._id,
      action: "unlock",
      result: "success",
      message: "Paketnik uspešno odklenjen"
    });

    return res.json({
      message: "Paketnik odklenjen",
      locker,
      reservation
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri odklepanju", error: error.message });
  }
}

async function lockLocker(req, res) {
  try {
    const locker = await Locker.findById(req.params.id);

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    if (!req.user || locker.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Zaklene lahko samo lastnik paketnika" });
    }

    locker.status = "locked";
    await locker.save();

    await AccessLog.create({
      locker: locker._id,
      user: req.user.id,
      action: "lock",
      result: "success",
      message: "Host je zaklenil paketnik"
    });

    return res.json({
      message: "Paketnik zaklenjen",
      locker
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri zaklepanju", error: error.message });
  }
}

module.exports = {
  getLockers,
  getLockerById,
  createLocker,
  updateLocker,
  deleteLocker,
  unlockLocker,
  lockLocker
};
