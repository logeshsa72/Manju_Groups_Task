const prisma = require("../config/prisma");

exports.getBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      unit: { include: { building: { include: { project: true } } } },
      bookedBy: { select: { id: true, name: true } },
    },
    orderBy: { bookingDate: "desc" },
  });
  res.json(bookings);
};

// Creating a booking is the one place where two sales people could race to
// book the same unit. We wrap the "check availability" + "create booking" +
// "flip unit status" sequence in a single Prisma transaction so it is atomic:
// once the transaction starts, MySQL locks the row being read, and the
// unit's status is checked again right before the write, so a second request
// for the same unit will always see it as no longer AVAILABLE.
exports.createBooking = async (req, res) => {
  try {
    const { leadId, unitId, amount } = req.body;
    if (!leadId || !unitId) {
      return res.status(400).json({ message: "leadId and unitId are required." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({ where: { id: Number(unitId) } });
      if (!unit) {
        throw { status: 404, message: "Unit not found." };
      }
      if (unit.status !== "AVAILABLE") {
        throw { status: 409, message: `This unit is already ${unit.status.toLowerCase()} and cannot be booked again.` };
      }

      const booking = await tx.booking.create({
        data: {
          leadId: Number(leadId),
          unitId: Number(unitId),
          bookedById: req.user.id,
          amount: amount ? Number(amount) : unit.price,
        },
      });

      await tx.unit.update({ where: { id: unit.id }, data: { status: "BOOKED" } });
      await tx.lead.update({ where: { id: Number(leadId) }, data: { stage: "BOOKED" } });

      return booking;
    });

    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Could not create booking.", error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) throw { status: 404, message: "Booking not found." };

      const updated = await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
      await tx.unit.update({ where: { id: booking.unitId }, data: { status: "AVAILABLE" } });

      return updated;
    });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Could not cancel booking.", error: err.message });
  }
};
