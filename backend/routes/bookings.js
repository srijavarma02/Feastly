const express            = require('express');
const router             = express.Router();
const Booking            = require('../models/Booking');
const { sendBookingEmails } = require('../utils/mailer');

/* ═══════════════════════════════════════════════════════════
   POST /api/bookings
   Create a new booking enquiry
════════════════════════════════════════════════════════════ */
router.post('/', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    // Send emails (non-blocking — won't fail the response if email errors)
    sendBookingEmails(booking).catch(err =>
      console.error('[Mailer] Unexpected error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Booking enquiry received. We will get back to you shortly.',
      data: booking
    });
  } catch (err) {
    // Mongoose validation errors come back as 400
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   GET /api/bookings
   List all bookings (admin use) — sorted newest first
   Optional query: ?status=Pending
════════════════════════════════════════════════════════════ */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   GET /api/bookings/:id
   Get a single booking by ID
════════════════════════════════════════════════════════════ */
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    // Invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid booking ID.' });
    }
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   PATCH /api/bookings/:id/status
   Update only the status field (admin use)
   Body: { "status": "Confirmed" }
════════════════════════════════════════════════════════════ */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Reviewed', 'Confirmed', 'Cancelled'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${allowed.join(', ')}`
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    res.json({ success: true, message: `Status updated to "${status}".`, data: booking });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid booking ID.' });
    }
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   DELETE /api/bookings/:id
   Delete a booking (admin use)
════════════════════════════════════════════════════════════ */
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid booking ID.' });
    }
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
