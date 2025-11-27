const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// >>> HIER dein Admin-Passwort einsetzen <<<
const ADMIN_PASSWORD = "admin22passwort";

const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------
// Hilfsfunktionen
// -------------------------
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return {
      addresses: {}, // name → {name, address}
      drawn: {},     // name → gezogene Person
    };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// -------------------------
// 1) Adresse eintragen
// -------------------------
app.post('/api/register', (req, res) => {
  const { name, address } = req.body || {};

  if (!name || !address) {
    return res.status(400).json({ error: "Name und Adresse erforderlich." });
  }

  const data = loadData();
  const key = name.trim().toLowerCase();

  data.addresses[key] = {
    name: name.trim(),
    address: address.trim(),
  };

  saveData(data);
  res.json({ ok: true, message: "Adresse gespeichert." });
});

// -------------------------
// 2) Person ziehen
// -------------------------
app.post('/api/draw', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name erforderlich." });

  const drawer = name.trim().toLowerCase();
  const data = loadData();

  const participants = Object.keys(data.addresses);

  // Noch nicht genug Teilnehmer
  if (participants.length < 2) {
    return res.json({
      ok: false,
      error: "Du bist die erste eingetragene Person. Es gibt noch niemanden, den du ziehen kannst!"
    });
  }

  // Prüfen ob Name existiert
  if (!data.addresses[drawer]) {
    return res.status(404).json({ error: "Du bist nicht eingetragen." });
  }

  // Prüfen, ob er schon gezogen hat
  if (data.drawn[drawer]) {
    const targetKey = data.drawn[drawer];
    const t = data.addresses[targetKey];
    return res.json({
      ok: true,
      already: true,
      targetName: t.name,
      address: t.address
    });
  }

  // Mögliche Kandidaten: alle außer sich selbst
  const candidates = participants.filter(p => p !== drawer);

  if (candidates.length === 0) {
    return res.json({
      ok: false,
      error: "Niemand verfügbar zum Ziehen."
    });
  }

  // Zufällig auswählen
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const drawnPersonKey = candidates[randomIndex];

  data.drawn[drawer] = drawnPersonKey;
  saveData(data);

  const target = data.addresses[drawnPersonKey];

  res.json({
    ok: true,
    targetName: target.name,
    address: target.address
  });
});

// -------------------------
// 3) Admin – Liste aller Einträge
// -------------------------
app.get('/api/admin/list', (req, res) => {
  const password = req.query.password;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Falsches Admin-Passwort." });
  }

  const data = loadData();

  res.json({
    ok: true,
    participants: data.addresses,
    drawn: data.drawn
  });
});

// -------------------------
// Server Starten
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wichtel-WebApp läuft auf http://localhost:${PORT}`);
});
