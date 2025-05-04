const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: String,
    surname: String,
    address: String,
    city: String,
    email: String,
    birthDate: Date,
    phone: String,
    personalId: String,
    gender: String,
    notes: String
});

module.exports = mongoose.model("Patient", patientSchema);