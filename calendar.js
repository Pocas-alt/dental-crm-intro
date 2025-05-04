let modalMode = "create";
let selectedEvent = null;

function openModal({ name = "", email = "", room = "room1", dateStr = "", endStr = "", _id = null } = {}) {
    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("modal-name").value = name;
    document.getElementById("modal-email").value = email;
    document.getElementById("modal-room").value = room;
    if (dateStr) {
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        document.getElementById("modal-appointment").value = `${hours}:${minutes}`;
        document.getElementById("modal").dataset.date = dateStr; // store original date
    }
    // Set the end time: use endStr if provided, otherwise auto-calculate 30 min after dateStr if possible
    if (endStr) {
        const end = new Date(endStr);
        const endHours = String(end.getHours()).padStart(2, '0');
        const endMinutes = String(end.getMinutes()).padStart(2, '0');
        document.getElementById("modal-end").value = `${endHours}:${endMinutes}`;
    } else if (dateStr) {
        const defaultEndDate = new Date(new Date(dateStr).getTime() + 30 * 60000);
        const endHours = String(defaultEndDate.getHours()).padStart(2, '0');
        const endMinutes = String(defaultEndDate.getMinutes()).padStart(2, '0');
        document.getElementById("modal-end").value = `${endHours}:${endMinutes}`;
    }
    document.getElementById("modal-id").value = _id || "";
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modal-form").reset();
    document.getElementById("modal-error").style.display = "none";
    modalMode = "create";
    selectedEvent = null;
}

document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = "http://localhost:3000/visits";
    const calendarEl = document.getElementById("calendar");

    const res = await fetch("http://localhost:3000/visits");
    const visits = await res.json();

    const resources = [
        { id: 'room1', title: 'Room 1' },
        { id: 'room2', title: 'Room 2' },
        { id: 'room3', title: 'Room 3' }
    ];

    const events = visits.map((v) => ({
        title: v.patientId?.name || "Unknown",
        start: v.appointment,
        end: v.end,
        resourceId: v.room || "room1",
        extendedProps: {
            _id: v._id,
            patientId: v.patientId?._id,
            email: v.patientId?.email || ""
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
        // Support selecting a time range by dragging
        select: function (info) {
            modalMode = "create";
            openModal({
                dateStr: info.startStr,
                endStr: info.endStr,
                room: info.resource?.id || "room1"
            });
        },
        eventClick: function (info) {
            modalMode = "edit";
            selectedEvent = info.event;
            openModal({
                name: info.event.title,
                email: info.event.extendedProps.email,
                room: info.event.getResources()[0]?.id || "room1",
                dateStr: info.event.start.toISOString().slice(0, 16),
                endStr: info.event.end?.toISOString().slice(0, 16),
                _id: info.event.extendedProps._id
            });
        },
        eventDrop: async function (info) {
            const patientId = info.event.extendedProps._id;

            const updated = {
                name: info.event.title,
                email: info.event.extendedProps.email,
                appointment: info.event.start.toISOString(),
                end: info.event.end?.toISOString(),
                room: info.event._def.resourceIds[0] || 'room1'
            };

            await fetch(`${API_URL}/${patientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
        }
    });

    // Move patient fetch and autocomplete setup here
    const patientRes = await fetch("http://localhost:3000/patients");
    const patients = await patientRes.json();

    const datalist = document.getElementById("modal-name-list");
    const emailMap = {};

    patients.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.name;
        datalist.appendChild(option);
        emailMap[p.name] = p.email;
    });

    document.getElementById("modal-name").addEventListener("input", function () {
        const selectedName = this.value;
        if (emailMap[selectedName]) {
            document.getElementById("modal-email").value = emailMap[selectedName];
        }
    });

    calendar.render();

    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") closeModal();
    });

    document.getElementById("modal-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("modal-name").value.trim();
        const email = document.getElementById("modal-email").value.trim();
        const room = document.getElementById("modal-room").value;
        const selectedTime = document.getElementById("modal-appointment").value;
        const baseDate = document.getElementById("modal").dataset.date;
        const fullStart = new Date(baseDate);
        const [h, m] = selectedTime.split(":");
        fullStart.setHours(+h, +m, 0, 0);
        const appointment = fullStart.toISOString();
        const end = document.getElementById("modal-end").value;
        const id = document.getElementById("modal-id").value;

        if (new Date(end) <= new Date(appointment)) {
            const errorBox = document.getElementById("modal-error");
            errorBox.textContent = "";
            errorBox.style.display = "block";
            errorBox.innerText = "End time must be after start time.";
            return;
        }

        let patientId = null;
        try {
            const searchRes = await fetch(`http://localhost:3000/patients/search?name=${encodeURIComponent(name)}`);
            if (searchRes.ok) {
                const found = await searchRes.json();
                patientId = found._id;
            } else {
                const createRes = await fetch("http://localhost:3000/patients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email })
                });
                const created = await createRes.json();
                patientId = created.patient._id;
            }
        } catch (err) {
            console.error("Patient resolution error:", err);
            return;
        }

        const visit = { patientId, appointment, end, room };

        if (modalMode === "create") {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visit)
            });
            const result = await res.json();
            calendar.addEvent({
                title: name,
                start: appointment,
                end,
                resourceId: room,
                extendedProps: {
                    _id: result.visit._id,
                    patientId,
                    email
                }
            });
        } else if (modalMode === "edit" && selectedEvent) {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visit)
            });

            selectedEvent.setProp("title", name);
            selectedEvent.setExtendedProp("email", email);
            selectedEvent.setStart(appointment);
            selectedEvent.setEnd(end);
            selectedEvent.setExtendedProp("room", room);
            selectedEvent.setProp("resourceId", room);
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