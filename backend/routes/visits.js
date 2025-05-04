const express = require("express");
const router = express.Router();
const Visit = require("../models/visit");

router.get("/", async (req, res) => {
    const visits = await Visit.find().populate("patientId");
    res.json(visits);
});

router.post("/", async (req, res) => {
    const visit = new Visit(req.body);
    await visit.save();
    res.status(201).json({ visit });
});

router.put("/:id", async (req, res) => {
    const updated = await Visit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ visit: updated });
});

router.delete("/:id", async (req, res) => {
    await Visit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;