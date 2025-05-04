document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = "http://localhost:3000/patients";
    const calendarEl = document.getElementById("calendar");

    const res = await fetch(API_URL);
    const patients = await res.json();

    const resources = [
        { id: 'monika', title: 'Dr. Monika' },
        { id: 'tomas', title: 'Dr. Tomas' },
        { id: 'inga', title: 'Dr. Inga' }
    ];

    const events = patients.map((p) => ({
        title: p.name,
        start: p.appointment,
        resourceId: p.doctor || 'monika'
    }));

    const calendar = new FullCalendar.Calendar(calendarEl, {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        initialView: 'resourceTimeGridDay',
        height: 'auto',
        slotMinTime: "07:00:00",
        slotMaxTime: "20:00:00",
        resources: resources,
        events: events,
        selectable: true,
        dateClick: async function (info) {
            const name = prompt("Patient Name:");
            if (!name) return;

            const email = prompt("Patient Email:");
            if (!email) return;

            const doctor = prompt("Doctor ID (monika, tomas, inga):", "monika");
            if (!doctor) return;

            const appointment = info.dateStr;

            const patient = { name, email, appointment, doctor };

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patient)
            });

            const result = await res.json();

            calendar.addEvent({
                title: result.patient.name,
                start: result.patient.appointment,
                resourceId: result.patient.doctor
            });
        }
    });

    calendar.render();
});