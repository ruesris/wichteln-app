const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

let users = [];
const ADMIN_PASSWORD = "wichtel123";

// 🔹 Teilnehmer registrieren
app.post("/api/register", (req, res) => {
    const { name, address } = req.body;

    const id = Date.now().toString();
    users.push({ id, name, address, hasDrawn: false });

    res.json({ ok: true, id });
});

// 🔹 Zufällige Person ziehen
app.get("/api/draw", (req, res) => {
    const id = req.query.id;
    const me = users.find(u => u.id === id);

    if (!me) return res.json({ message: "Fehler: Dich gibt es nicht." });

    const others = users.filter(u => u.id !== id);

    if (others.length === 0)
        return res.json({ message: "Du bist der erste! Es gibt noch niemanden zum Ziehen." });

    if (me.hasDrawn)
        return res.json({ message: "Du hast schon jemanden gezogen!" });

    const random = others[Math.floor(Math.random() * others.length)];

    me.hasDrawn = true;

    res.json({ message: `Du hast gezogen: ${random.name} – Adresse: ${random.address}` });
});

// 🔹 Adminbereich
app.get("/api/admin", (req, res)=>{
    const pw = req.query.pw;

    if (pw !== ADMIN_PASSWORD)
        return res.json({ ok: false });

    res.json({ ok: true, users });
});

// Server starten
app.listen(3000, ()=> console.log("Server läuft auf Port 3000"));
