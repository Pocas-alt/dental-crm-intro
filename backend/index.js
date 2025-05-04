const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string
const MONGO_URI = "mongodb+srv://pocebutas:jwFgrw7yNmcosSMY@crm.wadyitl.mongodb.net/?retryWrites=true&w=majority&appName=crm";
mongoose.connect(MONGO_URI);

mongoose.connection.once("open", () => console.log("✅ Connected to MongoDB"));

// Import routes
const patientRoutes = require("./routes/patients");
const visitRoutes = require("./routes/visits");

app.use("/patients", patientRoutes);
app.use("/visits", visitRoutes);

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));