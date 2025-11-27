const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// >>> HIER ein eigenes starkes Passwort eintragen <<<
const ADMIN_PASSWORD = 'admin22passwort';
const DATA_FILE = path.join(__dirname, 'data.json');

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Daten laden / speichern
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { addresses: {}, pairs: {} };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 1) Teilnehmer trägt seine Adresse ein
app.post('/api/registerAddress', (req, res) => {
  const { name, address } = req.body || {};

  if (!name || !address) {
    return res.status(400).json({ error: 'Name und Adresse sind Pflichtfelder.' });
  }

  const data = loadData();
  const key = name.trim().toLowerCase();

  data.addresses[key] = {
    name: name.trim(),
    address: address.trim()
  };

  saveData(data);
  res.json({ ok: true, message: 'Adresse gespeichert.' });
});

// 2) Admin trägt ein, wer wen gezogen hat
app.post('/api/setPair', (req, res) => {
  const { adminPassword, drawer, target } = req.body || {};

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Falsches Admin-Passwort.' });
  }

  if (!drawer || !target) {
    return res.status(400).json({ error: 'Ziehende Person und beschenkte Person sind Pflichtfelder.' });
  }

  const data = loadData();
  const drawerKey = drawer.trim().toLowerCase();
  const targetKey = target.trim().toLowerCase();

  data.pairs[drawerKey] = targetKey;
  saveData(data);

  res.json({ ok: true, message: `${drawer} beschenkt jetzt ${target}.` });
});

// 3) Teilnehmer ruft Adresse der gezogenen Person ab
app.get('/api/getTargetAddress', (req, res) => {
  const drawer = req.query.drawer;

  if (!drawer) {
    return res.status(400).json({ error: 'Bitte gib deinen eigenen Namen an.' });
  }

  const data = loadData();
  const drawerKey = drawer.trim().toLowerCase();

  const targetKey = data.pairs[drawerKey];

  if (!targetKey) {
    return res.status(404).json({ error: 'Für diesen Namen wurde kein Wichtel-Paar gefunden.' });
  }

  const target = data.addresses[targetKey];

  if (!target) {
    return res.status(404).json({
      error: 'Für die gezogene Person wurde noch keine Adresse hinterlegt.'
    });
  }

  res.json({
    ok: true,
    targetName: target.name,
    address: target.address
  });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wichtel-Seite läuft auf http://localhost:${PORT}`);
});
