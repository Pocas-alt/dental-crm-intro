const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

router.get("/", async (req, res) => {
    const patients = await Patient.find();
    res.json(patients);
});

router.post("/", async (req, res) => {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ patient });
});

// 🔍 Search patient by full name
router.get("/search", async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing name query" });

    try {
        const patient = await Patient.findOne({
            name: { $regex: new RegExp(name, 'i') }
        });
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Error searching for patient" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch patient" });
    }
});

module.exports = router;