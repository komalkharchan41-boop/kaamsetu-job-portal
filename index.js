const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'jobs.json');

app.use(cors());
app.use(express.json()); // parse JSON bodies

// Ensure DB file exists
function ensureDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ jobs: [] }, null, 2));
  }
}

// Read DB
function readDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

// Write DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Simple unique id generator
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/*
Job object structure:
{
  id: string,
  title: string,          // e.g., "Electrician needed"
  description: string,
  category: string,       // e.g., "electrician", "maid", "plumber"
  location: string,       // city or area
  contact: string,        // phone/email
  price: string,          // optional expected price or Wage
  createdAt: ISOString,
  extra: {}               // optional
}
*/

// List jobs (with optional query ?category=&location=&q=)
app.get('/jobs', (req, res) => {
  try {
    const db = readDB();
    let jobs = db.jobs || [];

    // filters
    const { category, location, q } = req.query;
    if (category) {
      jobs = jobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
    }
    if (location) {
      jobs = jobs.filter(j => j.location && j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (q) {
      const ql = q.toLowerCase();
      jobs = jobs.filter(j =>
        (j.title || '').toLowerCase().includes(ql) ||
        (j.description || '').toLowerCase().includes(ql) ||
        (j.category || '').toLowerCase().includes(ql)
      );
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single job
app.get('/jobs/:id', (req, res) => {
  try {
    const db = readDB();
    const job = (db.jobs || []).find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create job
app.post('/jobs', (req, res) => {
  try {
    const { title, description, category, location, contact, price, extra } = req.body;

    // Basic validation
    if (!title || !description || !category || !contact) {
      return res.status(400).json({ success: false, message: 'title, description, category and contact are required' });
    }

    const db = readDB();
    const newJob = {
      id: makeId(),
      title: String(title),
      description: String(description),
      category: String(category),
      location: location ? String(location) : '',
      contact: String(contact),
      price: price ? String(price) : '',
      extra: extra || {},
      createdAt: new Date().toISOString()
    };

    db.jobs = db.jobs || [];
    db.jobs.unshift(newJob); // newest first
    writeDB(db);

    res.status(201).json({ success: true, job: newJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update job
app.put('/jobs/:id', (req, res) => {
  try {
    const db = readDB();
    const idx = (db.jobs || []).findIndex(j => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Job not found' });

    const job = db.jobs[idx];
    const allowed = ['title', 'description', 'category', 'location', 'contact', 'price', 'extra'];
    allowed.forEach(k => {
      if (req.body[k] !== undefined) job[k] = req.body[k];
    });
    job.updatedAt = new Date().toISOString();
    db.jobs[idx] = job;
    writeDB(db);
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete job
app.delete('/jobs/:id', (req, res) => {
  try {
    const db = readDB();
    const jobs = db.jobs || [];
    const idx = jobs.findIndex(j => j.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Job not found' });

    const removed = jobs.splice(idx, 1)[0];
    db.jobs = jobs;
    writeDB(db);
    res.json({ success: true, removed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Simple health check
app.get('/', (req, res) => {
  res.send('Local Jobs Backend is running. Use /jobs endpoints.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
