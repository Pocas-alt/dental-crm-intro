let modalMode = "create";
let selectedEvent = null;

function openModal({ name = "", email = "", doctor = "monika", dateStr = "", _id = null } = {}) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modal-name").value = name;
    document.getElementById("modal-email").value = email;
    document.getElementById("modal-doctor").value = doctor;
    document.getElementById("modal-appointment").value = dateStr;
    document.getElementById("modal-id").value = _id || "";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("modal-form").reset();
    modalMode = "create";
    selectedEvent = null;
}

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
        resourceId: p.doctor || 'monika',
        extendedProps: {
            _id: p._id,
            email: p.email
        }
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
        editable: true,
        eventDurationEditable: true,
        eventStartEditable: true,
        dateClick: function (info) {
            modalMode = "create";
            openModal({ dateStr: info.dateStr });
        },
        eventClick: function (info) {
            modalMode = "edit";
            selectedEvent = info.event;
            openModal({
                name: info.event.title,
                email: info.event.extendedProps.email,
                doctor: info.event.getResources()[0]?.id || "monika",
                dateStr: info.event.start.toISOString().slice(0, 16),
                _id: info.event.extendedProps._id
            });
        },
        eventDrop: async function (info) {
            const patientId = info.event.extendedProps._id;

            const updated = {
                name: info.event.title,
                email: info.event.extendedProps.email,
                appointment: info.event.start.toISOString(),
                doctor: info.event.getResources()[0]?.id || 'monika'
            };

            await fetch(`${API_URL}/${patientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
        }
    });

    calendar.render();

    document.getElementById("modal-form").addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("modal-name").value;
        const email = document.getElementById("modal-email").value;
        const doctor = document.getElementById("modal-doctor").value;
        const appointment = document.getElementById("modal-appointment").value;
        const id = document.getElementById("modal-id").value;

        const patient = { name, email, appointment, doctor };

        if (modalMode === "create") {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patient)
            });
            const result = await res.json();
            calendar.addEvent({
                title: result.patient.name,
                start: result.patient.appointment,
                resourceId: result.patient.doctor,
                extendedProps: {
                    _id: result.patient._id,
                    email: result.patient.email
                }
            });
        } else if (modalMode === "edit" && selectedEvent) {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patient)
            });

            selectedEvent.setProp("title", name);
            selectedEvent.setExtendedProp("email", email);
            selectedEvent.setStart(appointment);
            selectedEvent.setResources([{ id: doctor }]);
        }

        closeModal();
    });

    document.getElementById("modal-delete-button").addEventListener("click", async function () {
        if (!selectedEvent) return;
        const confirmDelete = confirm("Are you sure you want to delete this appointment?");
        if (!confirmDelete) return;

        const id = document.getElementById("modal-id").value;

        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        selectedEvent.remove();
        closeModal();
    });
});