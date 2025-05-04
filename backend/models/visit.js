const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: String,
    end: String,
    room: String
});

module.exports = mongoose.model("Visit", visitSchema);