function registerUser() {
    const name = document.getElementById("nameInput").value;
    const address = document.getElementById("addressInput").value;
    const msg = document.getElementById("registerMsg");

    fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) msg.textContent = "❌ " + data.error;
        else msg.textContent = "✅ Adresse gespeichert!";
    });
}

function drawPerson() {
    const name = document.getElementById("drawNameInput").value;
    const msg = document.getElementById("drawMsg");

    fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            msg.textContent = "❌ " + data.error;
        } else {
            msg.textContent =
                `🎉 Du hast gezogen: ${data.targetName}\n📬 Adresse: ${data.address}`;
        }
    });
}

function adminLoad() {
    const pw = document.getElementById("adminPwInput").value;
    const out = document.getElementById("adminOutput");

    fetch("/api/admin/list?password=" + encodeURIComponent(pw))
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            out.textContent = "❌ " + data.error;
        } else {
            out.textContent = JSON.stringify(data, null, 2);
        }
    });
}
