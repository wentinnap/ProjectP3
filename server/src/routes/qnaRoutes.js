const express = require("express");
const router = express.Router();
const qnaController = require("../controllers/qnaController");
const { authenticate, isAdmin } = require("../middleware/auth");

// public
router.get("/", qnaController.getPublicQnA);
router.post("/", qnaController.createQuestion);

// admin
router.get("/admin/all", authenticate, isAdmin, qnaController.getAllQnAAdmin);
router.put("/:id/answer", authenticate, isAdmin, qnaController.answerQuestion);
router.patch("/:id/toggle-visibility", authenticate, isAdmin, qnaController.toggleVisibility);
router.delete("/:id", authenticate, isAdmin, qnaController.deleteQnA);

module.exports = router;
