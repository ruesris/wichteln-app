const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.json());

// Statische Dateien aus /public ausliefern
app.use(express.static(path.join(__dirname, "public")));

// Pfad der JSON-Datei
const dataPath = path.join(__dirname, "data.json");

// Falls Datei existiert → laden, sonst neue Struktur
let data = {
    users: []
};

if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

// Admin Passwort
const ADMIN_PASSWORD = "wichtel123";

// 🔹 Teilnehmer registrieren
app.post("/api/register", (req, res) => {
    const { name, address } = req.body;

    const id = Date.now().toString();
    data.users.push({ id, name, address, hasDrawn: false });

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    res.json({ ok: true, id });
});

// 🔹 zufällige Person ziehen
app.get("/api/draw", (req, res) => {
    const id = req.query.id;
    const me = data.users.find(u => u.id === id);

    if (!me)
        return res.json({ message: "Fehler: Dich gibt es nicht." });

    const others = data.users.filter(u => u.id !== id);

    if (others.length === 0)
        return res.json({ message: "Du bist der erste! Es gibt noch niemanden zum Ziehen." });

    if (me.hasDrawn)
        return res.json({ message: "Du hast schon jemanden gezogen!" });

    const random = others[Math.floor(Math.random() * others.length)];
    me.hasDrawn = true;

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    res.json({
        message: `Du hast gezogen: ${random.name} – Adresse: ${random.address}`
    });
});

// 🔹 Adminbereich
app.get("/api/admin", (req, res) => {
    const pw = req.query.pw;

    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false });

    res.json({ ok: true, users: data.users });
});

// Server starten
app.listen(3000, () => console.log("Server läuft auf Port 3000"));

