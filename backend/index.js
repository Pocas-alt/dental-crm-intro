const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string
const MONGO_URI = "mongodb+srv://pocebutas:jwFgrw7yNmcosSMY@crm.wadyitl.mongodb.net/?retryWrites=true&w=majority&appName=crm";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// Patient schema and model
const patientSchema = new mongoose.Schema({
    name: String,
    email: String,
    appointment: String,
});

const Patient = mongoose.model("Patient", patientSchema);

// 🧾 Get all patients
app.get("/patients", async (req, res) => {
    const patients = await Patient.find();
    res.json(patients);
});

// ➕ Add a patient
app.post("/patients", async (req, res) => {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json({ message: "Patient saved to MongoDB", patient });
});

// 🔊 Start server
app.listen(3000, () => {
    console.log("🚀 Backend running on http://localhost:3000");
});