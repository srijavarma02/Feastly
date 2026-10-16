const express  = require('express');
const router   = express.Router();
const Content  = require('../models/Content');
const { requireAuth, requireManager } = require('../middleware/auth');

/* ═══════════════════════════════════════════════════════════
   GET /api/content
   Public — returns all content as a flat object
   { heroTagline: '...', testimonials: [...], pricing: [...] }
════════════════════════════════════════════════════════════ */
router.get('/', async (req, res) => {
  try {
    const items   = await Content.find({});
    const flat    = {};
    items.forEach(item => { flat[item.key] = item.value; });
    res.json({ success: true, data: flat });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/content/:key
   Manager only — upserts a content key with new value
   Body: { value: <any>, type?: 'text'|'image'|'array' }
════════════════════════════════════════════════════════════ */
router.put('/:key', requireAuth, requireManager, async (req, res) => {
  try {
    const { key }         = req.params;
    const { value, type } = req.body;

    if (value === undefined) {
      return res.status(400).json({ success: false, error: 'value is required in the request body.' });
    }

    const update = { value };
    if (type) update.type = type;

    const item = await Content.findOneAndUpdate(
      { key },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: `Content key "${key}" updated.`, data: item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
