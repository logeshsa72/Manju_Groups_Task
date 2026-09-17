const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getBookings, createBooking, cancelBooking } = require("../controllers/bookingController");

router.use(protect);

router.get("/", getBookings);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
