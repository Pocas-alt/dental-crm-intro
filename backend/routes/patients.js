const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

router.get("/", async (req, res) => {
    const patients = await Patient.find();
    res.json(patients);
});

router.post("/", async (req, res) => {
    const { name, surname, phone } = req.body;
    const patient = new Patient({ name, surname, phone });
    await patient.save();
    res.status(201).json({ patient });
});

// 🔍 Search patient by phone and/or surname
router.get("/search", async (req, res) => {
    const { phone, surname } = req.query;

    if (!phone && !surname) {
        return res.status(400).json({ error: "Phone or surname is required" });
    }

    const query = {};
    if (phone) query.phone = phone;
    if (surname) query.surname = surname;

    try {
        const patient = await Patient.findOne(query);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: "Failed to search patient" });
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