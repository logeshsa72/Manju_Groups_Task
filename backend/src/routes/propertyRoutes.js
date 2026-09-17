const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  createBuilding,
  deleteBuilding,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} = require("../controllers/propertyController");

router.use(protect);

router.get("/projects", getProjects);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

router.post("/buildings", createBuilding);
router.delete("/buildings/:id", deleteBuilding);

router.get("/units", getUnits);
router.post("/units", createUnit);
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

module.exports = router;
