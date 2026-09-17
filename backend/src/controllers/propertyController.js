const prisma = require("../config/prisma");

// ---------- Projects ----------
exports.getProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { buildings: { include: { _count: { select: { units: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(projects);
};

exports.createProject = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required." });
    const project = await prisma.project.create({ data: { name, location } });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Could not create project.", error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, location } = req.body;
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { ...(name !== undefined && { name }), ...(location !== undefined && { location }) },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Could not update project.", error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Project deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete project.", error: err.message });
  }
};

// ---------- Buildings ----------
exports.createBuilding = async (req, res) => {
  try {
    const { name, projectId } = req.body;
    if (!name || !projectId) return res.status(400).json({ message: "Name and projectId are required." });
    const building = await prisma.building.create({ data: { name, projectId: Number(projectId) } });
    res.status(201).json(building);
  } catch (err) {
    res.status(500).json({ message: "Could not create building.", error: err.message });
  }
};

exports.deleteBuilding = async (req, res) => {
  try {
    await prisma.building.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Building deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete building.", error: err.message });
  }
};

// ---------- Units ----------
exports.getUnits = async (req, res) => {
  const { status, type, buildingId, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (buildingId) where.buildingId = Number(buildingId);
  if (search) where.unitNo = { contains: search };

  const units = await prisma.unit.findMany({
    where,
    include: { building: { include: { project: true } } },
    orderBy: { id: "desc" },
  });
  res.json(units);
};

exports.createUnit = async (req, res) => {
  try {
    const { unitNo, type, price, buildingId, status } = req.body;
    if (!unitNo || !type || !price || !buildingId) {
      return res.status(400).json({ message: "unitNo, type, price and buildingId are required." });
    }
    const unit = await prisma.unit.create({
      data: {
        unitNo,
        type,
        price: Number(price),
        buildingId: Number(buildingId),
        status: status || "AVAILABLE",
      },
    });
    res.status(201).json(unit);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "A unit with this number already exists in that building." });
    }
    res.status(500).json({ message: "Could not create unit.", error: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { unitNo, type, price, status, buildingId } = req.body;
    const unit = await prisma.unit.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(unitNo !== undefined && { unitNo }),
        ...(type !== undefined && { type }),
        ...(price !== undefined && { price: Number(price) }),
        ...(status !== undefined && { status }),
        ...(buildingId !== undefined && { buildingId: Number(buildingId) }),
      },
    });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: "Could not update unit.", error: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    await prisma.unit.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Unit deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete unit.", error: err.message });
  }
};
