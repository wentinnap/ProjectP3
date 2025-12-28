const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticate, isAdmin } = require("../middleware/auth");

// ================= PUBLIC =================
router.get("/", eventController.getAllEvents);

// ================= ADMIN =================
router.get(
  "/admin/all",
  authenticate,
  isAdmin,
  eventController.getAllEventsAdmin
);

router.post(
  "/",
  authenticate,
  isAdmin,
  eventController.createEvent
);

router.put(
  "/:id",
  authenticate,
  isAdmin,
  eventController.updateEvent
);

router.patch(
  "/:id/toggle-visibility",
  authenticate,
  isAdmin,
  eventController.toggleEventVisibility
);

router.delete(
  "/:id",
  authenticate,
  isAdmin,
  eventController.deleteEvent
);

module.exports = router;
