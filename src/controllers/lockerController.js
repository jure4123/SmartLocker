const Locker = require("../models/Locker");

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

module.exports = {
  getLockers,
  getLockerById,
  createLocker,
  updateLocker,
  deleteLocker
};
