const prisma = require("../config/prisma");
const XLSX = require("xlsx");
const fs = require("fs");

const VALID_STAGES = ["NEW", "CONTACTED", "SITE_VISIT", "INTERESTED", "NEGOTIATION", "BOOKED", "LOST"];

exports.getLeads = async (req, res) => {
  try {
    const { search, stage, assignedToId, page = 1, limit = 10 } = req.query;
    const where = {};

    if (stage && VALID_STAGES.includes(stage)) where.stage = stage;
    if (assignedToId) where.assignedToId = Number(assignedToId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { notes: true, attachments: true, bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / take) });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch leads.", error: err.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        assignedTo: { select: { id: true, name: true } },
        notes: { orderBy: { createdAt: "desc" } },
        attachments: true,
        bookings: { include: { unit: true } },
      },
    });
    if (!lead) return res.status(404).json({ message: "Lead not found." });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch lead.", error: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { name, phone, email, source, stage, assignedToId, followUpDate } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required." });
    }
    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        source: source || null,
        stage: VALID_STAGES.includes(stage) ? stage : "NEW",
        assignedToId: assignedToId ? Number(assignedToId) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: "Could not create lead.", error: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { name, phone, email, source, stage, assignedToId, followUpDate } = req.body;
    const lead = await prisma.lead.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(source !== undefined && { source }),
        ...(stage !== undefined && VALID_STAGES.includes(stage) && { stage }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId ? Number(assignedToId) : null }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      },
    });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Could not update lead.", error: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Lead deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete lead.", error: err.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: "Note text is required." });
    const created = await prisma.leadNote.create({
      data: { leadId: Number(req.params.id), note },
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Could not add note.", error: err.message });
  }
};

// Upload a single PDF attachment (e.g. ID proof, brochure) to a lead
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const attachment = await prisma.attachment.create({
      data: {
        leadId: Number(req.params.id),
        filename: req.file.originalname,
        filepath: req.file.filename,
        filetype: req.file.mimetype,
      },
    });
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ message: "Could not upload attachment.", error: err.message });
  }
};

// Bulk import leads from an uploaded Excel (.xlsx/.xls) file.
// Expected columns (case-insensitive): Name, Phone, Email, Source, Stage
exports.importLeadsFromExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No Excel file uploaded." });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "The uploaded sheet has no rows." });
    }

    const toCreate = [];
    const skipped = [];

    rows.forEach((row, idx) => {
      const get = (key) => {
        const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key);
        return found ? String(row[found]).trim() : "";
      };
      const name = get("name");
      const phone = get("phone");
      if (!name || !phone) {
        skipped.push({ row: idx + 2, reason: "Missing name or phone" });
        return;
      }
      const stageRaw = get("stage").toUpperCase().replace(/\s+/g, "_");
      toCreate.push({
        name,
        phone,
        email: get("email") || null,
        source: get("source") || "Excel Import",
        stage: VALID_STAGES.includes(stageRaw) ? stageRaw : "NEW",
      });
    });

    let created = [];
    if (toCreate.length) {
      await prisma.lead.createMany({ data: toCreate });
      created = toCreate;
    }

    fs.unlink(req.file.path, () => {});

    res.status(201).json({
      message: `Imported ${created.length} lead(s). ${skipped.length} row(s) skipped.`,
      importedCount: created.length,
      skipped,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not import leads.", error: err.message });
  }
};
