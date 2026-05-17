const Reservation = require("../models/Reservation");
const Locker = require("../models/Locker");

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getReservations(req, res) {
  try {
    let filter = {};

    if (req.user.role === "host") {
      filter.host = req.user.id;
    }

    if (req.user.role === "guest") {
      filter.guest = req.user.id;
    }

    const reservations = await Reservation.find(filter)
      .populate("locker", "name location status")
      .populate("host", "name email")
      .populate("guest", "name email");

    return res.json(reservations);
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri branju rezervacij", error: error.message });
  }
}

async function getReservationById(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("locker", "name location status")
      .populate("host", "name email")
      .populate("guest", "name email");

    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija ne obstaja" });
    }

    return res.json(reservation);
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri branju rezervacije", error: error.message });
  }
}

async function createReservation(req, res) {
  try {
    if (req.user.role !== "host") {
      return res.status(403).json({ message: "Samo host lahko ustvari rezervacijo" });
    }

    const { lockerId, guestId, startAt, endAt } = req.body;

    if (!lockerId || !guestId || !startAt || !endAt) {
      return res.status(400).json({ message: "lockerId, guestId, startAt in endAt so obvezni" });
    }

    const locker = await Locker.findById(lockerId);

    if (!locker) {
      return res.status(404).json({ message: "Paketnik ne obstaja" });
    }

    if (locker.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Rezervacijo lahko narediš samo za svoj paketnik" });
    }

    const reservation = await Reservation.create({
      locker: lockerId,
      host: req.user.id,
      guest: guestId,
      startAt,
      endAt,
      accessCode: generateAccessCode()
    });

    return res.status(201).json({
      message: "Rezervacija ustvarjena",
      reservation
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri ustvarjanju rezervacije", error: error.message });
  }
}

async function updateReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija ne obstaja" });
    }

    if (reservation.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ureja lahko samo host rezervacije" });
    }

    const { startAt, endAt, status } = req.body;

    if (startAt !== undefined) reservation.startAt = startAt;
    if (endAt !== undefined) reservation.endAt = endAt;
    if (status !== undefined) reservation.status = status;

    await reservation.save();

    return res.json({
      message: "Rezervacija posodobljena",
      reservation
    });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri posodabljanju rezervacije", error: error.message });
  }
}

async function deleteReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija ne obstaja" });
    }

    if (reservation.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "Izbriše lahko samo host rezervacije" });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return res.json({ message: "Rezervacija izbrisana" });
  } catch (error) {
    return res.status(500).json({ message: "Napaka pri brisanju rezervacije", error: error.message });
  }
}

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
