const nodemailer = require('nodemailer');

/* ── Transporter (Gmail) ────────────────────────────────────
   Uses a Gmail account with an App Password.
   Never use your real Gmail password here — use an App Password:
   Google Account → Security → 2-Step Verification → App Passwords
──────────────────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS    // your Gmail App Password (16-char)
  }
});

/* ── Helper: format date nicely ─────────────────────────────── */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ══════════════════════════════════════════════════════════════
   1. OWNER NOTIFICATION EMAIL
   Sent to: process.env.OWNER_EMAIL
   Triggered every time a new booking is submitted
══════════════════════════════════════════════════════════════ */
async function sendOwnerNotification(booking) {
  const servicesList = booking.services.length
    ? booking.services.join(', ')
    : 'Not specified';

  const html = `
    <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; color: #1a1a1a;">

      <div style="background: #1a1a1a; padding: 28px 32px; text-align: center;">
        <h1 style="color: #c9a96e; font-size: 22px; margin: 0; letter-spacing: 2px;">
          KateringKing.com
        </h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 6px 0 0; letter-spacing: 1px; text-transform: uppercase;">
          New Booking Enquiry
        </p>
      </div>

      <div style="background: #fff; padding: 32px;">
        <p style="font-size: 15px; color: #444; margin-top: 0;">
          You have received a new event booking enquiry. Details below:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <tr style="background: #f9f5ef;">
            <td style="padding: 10px 14px; font-weight: bold; width: 38%; color: #7a5c2e;">Full Name</td>
            <td style="padding: 10px 14px;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Phone</td>
            <td style="padding: 10px 14px;">${booking.phone}</td>
          </tr>
          <tr style="background: #f9f5ef;">
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Email</td>
            <td style="padding: 10px 14px;">${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Event Type</td>
            <td style="padding: 10px 14px;">${booking.eventType}</td>
          </tr>
          <tr style="background: #f9f5ef;">
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Event Date</td>
            <td style="padding: 10px 14px;">${formatDate(booking.eventDate)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Guest Count</td>
            <td style="padding: 10px 14px;">${booking.guestCount}</td>
          </tr>
          <tr style="background: #f9f5ef;">
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Venue / Location</td>
            <td style="padding: 10px 14px;">${booking.venue}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Services Requested</td>
            <td style="padding: 10px 14px;">${servicesList}</td>
          </tr>
          ${booking.message ? `
          <tr style="background: #f9f5ef;">
            <td style="padding: 10px 14px; font-weight: bold; color: #7a5c2e;">Message</td>
            <td style="padding: 10px 14px;">${booking.message}</td>
          </tr>` : ''}
        </table>

        <div style="margin-top: 28px; padding: 16px; background: #fff8ee; border-left: 3px solid #c9a96e;">
          <p style="margin: 0; font-size: 13px; color: #666;">
            This enquiry has been saved to your database with status <strong>Pending</strong>.<br/>
            Booking ID: <code style="font-size: 12px;">${booking._id}</code>
          </p>
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 16px 32px; text-align: center;">
        <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0;">
          KateringKing.com &nbsp;·&nbsp; Crafted for Taste. Engineered for Elegance.
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from: `"KateringKing Bookings" <${process.env.EMAIL_USER}>`,
    to:   process.env.OWNER_EMAIL,
    subject: `New Booking Enquiry — ${booking.eventType} | ${booking.name}`,
    html
  });
}

/* ══════════════════════════════════════════════════════════════
   2. CUSTOMER CONFIRMATION EMAIL
   Sent to: the customer's email address
   Confirms their enquiry was received
══════════════════════════════════════════════════════════════ */
async function sendCustomerConfirmation(booking) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; color: #1a1a1a;">

      <div style="background: #1a1a1a; padding: 28px 32px; text-align: center;">
        <h1 style="color: #c9a96e; font-size: 22px; margin: 0; letter-spacing: 2px;">
          KateringKing.com
        </h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 6px 0 0; letter-spacing: 1px; text-transform: uppercase;">
          Enquiry Received
        </p>
      </div>

      <div style="background: #fff; padding: 32px;">
        <p style="font-size: 16px; color: #1a1a1a; margin-top: 0;">
          Dear ${booking.name},
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.7;">
          Thank you for reaching out to <strong>KateringKing.com</strong>. We have received your
          enquiry for your <strong>${booking.eventType}</strong> on
          <strong>${formatDate(booking.eventDate)}</strong>.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.7;">
          Our team will review the details and get back to you within
          <strong>24 hours</strong> to discuss your requirements.
        </p>

        <div style="margin: 28px 0; padding: 20px 24px; background: #f9f5ef; border-left: 3px solid #c9a96e;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Your Enquiry Summary</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Event:</strong> ${booking.eventType}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${formatDate(booking.eventDate)}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Guests:</strong> ${booking.guestCount}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Venue:</strong> ${booking.venue}</p>
        </div>

        <p style="font-size: 14px; color: #444;">
          In the meantime, feel free to call or WhatsApp us directly:<br/>
          <a href="tel:+919963220052" style="color: #c9a96e; text-decoration: none; font-size: 16px; font-weight: bold;">
            +91 99632 20052
          </a>
        </p>

        <p style="font-size: 15px; color: #444; margin-bottom: 0;">
          Warm regards,<br/>
          <strong>Mohammed Azhar Mohiuddin</strong><br/>
          <span style="color: #888; font-size: 13px;">Founder, KateringKing.com</span>
        </p>
      </div>

      <div style="background: #1a1a1a; padding: 16px 32px; text-align: center;">
        <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0;">
          KateringKing.com &nbsp;·&nbsp; Hyderabad &nbsp;·&nbsp; Crafted for Taste. Engineered for Elegance.
        </p>
      </div>

    </div>
  `;

  await transporter.sendMail({
    from: `"KateringKing.com" <${process.env.EMAIL_USER}>`,
    to:   booking.email,
    subject: `We've received your enquiry — KateringKing.com`,
    html
  });
}

/* ── Main export: send both emails, non-blocking ────────────── */
async function sendBookingEmails(booking) {
  // Run both in parallel; log errors but don't crash the request
  const results = await Promise.allSettled([
    sendOwnerNotification(booking),
    sendCustomerConfirmation(booking)
  ]);

  results.forEach((result, i) => {
    const label = i === 0 ? 'Owner notification' : 'Customer confirmation';
    if (result.status === 'rejected') {
      console.error(`[Mailer] ${label} failed:`, result.reason.message);
    } else {
      console.log(`[Mailer] ${label} sent.`);
    }
  });
}

module.exports = { sendBookingEmails };
