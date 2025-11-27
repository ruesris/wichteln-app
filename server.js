const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, "data.json");
const ADMIN_PASSWORD = "wichtel123";

// 🔹 Daten laden
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], pairs: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

// 🔹 Daten speichern
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 🔹 Teilnehmer registrieren
app.post("/api/register", (req, res) => {
    const data = loadData();
    const id = Date.now().toString();

    data.users.push({
        id,
        name: req.body.name,
        address: req.body.address
    });

    saveData(data);

    res.json({ ok: true, id });
});

// 🔹 Ergebnis für einen User abrufen
app.get("/api/result", (req, res) => {
    const id = req.query.id;
    const data = loadData();

    if (!data.pairs[id]) {
        return res.json({ message: "Der Admin hat die Ziehung noch nicht gestartet." });
    }

    const targetId = data.pairs[id];
    const target = data.users.find(u => u.id === targetId);

    res.json({
        ok: true,
        name: target.name,
        address: target.address
    });
});

// 🔹 ADMIN: Alle Paare erzeugen
app.get("/api/admin/drawall", (req, res) => {
    const pw = req.query.pw;
    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false, message: "Falsches Passwort" });

    const data = loadData();
    const users = [...data.users];

    if (users.length < 2) {
        return res.json({ ok: false, message: "Zu wenige Teilnehmer" });
    }

    // Fisher-Yates Shuffle
    for (let i = users.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
    }

    // Jeder bekommt den nächsten, letzter bekommt den ersten
    let pairs = {};
    for (let i = 0; i < users.length; i++) {
        let giver = users[i].id;
        let receiver = users[(i + 1) % users.length].id;
        pairs[giver] = receiver;
    }

    data.pairs = pairs;
    saveData(data);

    res.json({ ok: true, message: "Alle Paarungen erfolgreich erstellt!", pairs });
});

// 🔹 ADMIN: Teilnehmerliste anzeigen
app.get("/api/admin", (req, res) => {
    const pw = req.query.pw;
    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false });

    const data = loadData();
    res.json({ ok: true, users: data.users, pairs: data.pairs });
});

// 🔹 ADMIN: Benutzer löschen
app.delete("/api/admin/delete", (req, res) => {
    const pw = req.query.pw;
    const id = req.query.id;

    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false });

    const data = loadData();
    data.users = data.users.filter(u => u.id !== id);

    saveData(data);
    res.json({ ok: true });
});

// Server starten
app.listen(3000, () => console.log("Server läuft auf Port 3000"));
