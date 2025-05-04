const API_URL = "http://localhost:3000/patients";
let editPatientId = null;

document.addEventListener("DOMContentLoaded", async function () {
  const res = await fetch(API_URL);
  const patients = await res.json();
  patients.forEach(displayPatient);

  // Modal autocomplete logic (if exists)
  // ... (unchanged)

  // Restore patient list autocomplete functionality
  const listDatalist = document.getElementById("patientNames");
  const listEmailMap = {};

  patients.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.name;
    listDatalist.appendChild(option);
    listEmailMap[p.name] = p.email;
  });

  document.getElementById("name").addEventListener("input", function () {
    const selectedName = this.value;
    if (listEmailMap[selectedName]) {
      document.getElementById("email").value = listEmailMap[selectedName];
    }
  });
});

document.getElementById("patientForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const appointment = document.getElementById("appointment").value;
  // const room = document.getElementById("room").value;

  const patient = { name, email, appointment };

  if (editPatientId) {
    await fetch(`${API_URL}/${editPatientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient)
    });
    location.reload();
  } else {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient)
    });
    const result = await res.json();
    displayPatient(result.patient);
  }

  document.getElementById("patientForm").reset();
  editPatientId = null;
});

function displayPatient(patient) {
  const patientList = document.getElementById("patientList");
  const newItem = document.createElement("li");

  newItem.innerHTML = `
    ${patient.name} – ${patient.email} – ${new Date(patient.appointment).toLocaleString()} (${patient.room})
    <button onclick="editPatient('${patient._id}')">✏️ Edit</button>
    <button onclick="deletePatient('${patient._id}', this)">🗑️ Delete</button>
  `;

  patientList.appendChild(newItem);
}

async function deletePatient(id, buttonElement) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  buttonElement.parentElement.remove();
}

function editPatient(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(patient => {
      document.getElementById("name").value = patient.name;
      document.getElementById("email").value = patient.email;
      document.getElementById("appointment").value = new Date(patient.appointment).toISOString().slice(0, 16);
      //document.getElementById("room").value = patient.room;// Uncomment if you want to use additional patient data
      editPatientId = patient._id;
    });
}