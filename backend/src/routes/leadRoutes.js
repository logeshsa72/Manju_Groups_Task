const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  uploadAttachment,
  importLeadsFromExcel,
} = require("../controllers/leadController");

router.use(protect);

router.get("/", getLeads);
router.post("/", createLead);
router.post("/import", upload.single("file"), importLeadsFromExcel);

router.get("/:id", getLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

router.post("/:id/notes", addNote);
router.post("/:id/attachments", upload.single("file"), uploadAttachment);

module.exports = router;
