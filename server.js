const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = '/data';
const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD;

app.use(express.json({ limit: '20mb' }));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.post('/api/login', (req, res) => {
    console.log('POST /api/login');
    const { password } = req.body || {};

    if (password !== EDITOR_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        return res.json({ ok: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Unexpected error, login failed' });
    }
});

app.post('/api/save-points', (req, res) => {
  console.log('POST /api/save-points', req.body?.map);
  const { map, points } = req.body || {};

  if (!map || !Array.isArray(points)) {
    return res.status(400).json({ error: 'Invalid body' });
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/u.test(map)) {
    return res.status(400).json({ error: 'Invalid map name' });
  }

  const filePath = path.join(DATA_DIR, `${map}-points.json`);
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ map, points }, null, 2),
      'utf8'
    );
    return res.json({ ok: true, path: `/data/${map}-points.json` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Write failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dataDir: DATA_DIR });
});

app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
  console.log(`data: ${DATA_DIR}`);
});