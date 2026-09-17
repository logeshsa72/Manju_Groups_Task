const prisma = require("../config/prisma");

exports.getSummary = async (req, res) => {
  try {
    const [totalLeads, stageGroups, totalUnits, unitStatusGroups, totalBookings, revenueAgg, upcomingFollowUps, recentLeads] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.groupBy({ by: ["stage"], _count: { stage: true } }),
        prisma.unit.count(),
        prisma.unit.groupBy({ by: ["status"], _count: { status: true } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { amount: true } }),
        prisma.lead.findMany({
          where: { followUpDate: { gte: new Date() } },
          orderBy: { followUpDate: "asc" },
          take: 5,
          select: { id: true, name: true, phone: true, followUpDate: true, stage: true },
        }),
        prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, stage: true, createdAt: true },
        }),
      ]);

    const stageCounts = {};
    stageGroups.forEach((g) => (stageCounts[g.stage] = g._count.stage));

    const unitStatusCounts = {};
    unitStatusGroups.forEach((g) => (unitStatusCounts[g.status] = g._count.status));

    res.json({
      totalLeads,
      stageCounts,
      totalUnits,
      unitStatusCounts,
      totalBookings,
      totalRevenue: revenueAgg._sum.amount || 0,
      upcomingFollowUps,
      recentLeads,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load dashboard summary.", error: err.message });
  }
};
