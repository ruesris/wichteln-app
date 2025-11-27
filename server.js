const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let users = [];
let alreadyDrawn = []; // <--- speichert, wer schon gezogen wurde!

const ADMIN_PASSWORD = "wichtel123";

// ----------------------------------------------------
// ➤ Teilnehmer registrieren
// ----------------------------------------------------
app.post("/api/register", (req, res) => {
    const { name, address } = req.body;
    const id = Date.now().toString();

    users.push({ id, name, address, hasDrawn: false });
    res.json({ ok: true, id });
});

// ----------------------------------------------------
// ➤ Zufällige Person ziehen, ohne doppelte Ziehungen
// ----------------------------------------------------
app.get("/api/draw", (req, res) => {
    const id = req.query.id;

    const me = users.find(u => u.id === id);
    if (!me) return res.json({ message: "Fehler: Dich gibt es nicht." });

    if (me.hasDrawn)
        return res.json({ message: "Du hast schon jemanden gezogen!" });

    // Liste der ziehbaren Personen (ohne mich + ohne schon gezogene)
    const candidates = users.filter(u =>
        u.id !== id && !alreadyDrawn.includes(u.id)
    );

    if (candidates.length === 0)
        return res.json({ message: "Leider gibt es niemanden mehr der gezogen werden kann." });

    // Zufällig wählen
    const random = candidates[Math.floor(Math.random() * candidates.length)];

    // markieren
    me.hasDrawn = true;
    alreadyDrawn.push(random.id);

    res.json({
        message: `Du hast gezogen: ${random.name} – Adresse: ${random.address}`
    });
});

// ----------------------------------------------------
// ➤ Adminbereich
// ----------------------------------------------------
app.get("/api/admin", (req, res) => {
    const pw = req.query.pw;
    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false });

    res.json({
        ok: true,
        users,
        alreadyDrawn
    });
});

// ----------------------------------------------------
app.listen(3000, () => console.log("Server läuft auf Port 3000"));
