const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/authMiddleware");

const {
  getLockers,
  getLockerById,
  createLocker,
  updateLocker,
  deleteLocker
} = require("../controllers/lockerController");

router.get("/", auth, getLockers);
router.get("/:id", auth, getLockerById);
router.post("/", auth, createLocker);
router.put("/:id", auth, updateLocker);
router.delete("/:id", auth, deleteLocker);

module.exports = router;
