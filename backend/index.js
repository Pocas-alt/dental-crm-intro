// index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let patients = []; // temporary in-memory store

// Route to get all patients
app.get("/patients", (req, res) => {
    res.json(patients);
});

// Route to add a patient
app.post("/patients", (req, res) => {
    const patient = req.body;
    patients.push(patient);
    res.status(201).json({ message: "Patient added", patient });
});

// Start the server
app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});