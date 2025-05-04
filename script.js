document.getElementById("patientForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const appointment = document.getElementById("appointment").value;

  const patientList = document.getElementById("patientList");

  const newItem = document.createElement("li");
  newItem.innerText = `${name} – ${email} – ${new Date(appointment).toLocaleString()}`;

  patientList.appendChild(newItem);

  // Clear form
  document.getElementById("patientForm").reset();
});