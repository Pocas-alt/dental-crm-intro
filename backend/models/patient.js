const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: String,
    email: String
});

module.exports = mongoose.model("Patient", patientSchema);