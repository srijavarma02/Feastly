/**
 * seedManager.js
 * Creates the manager account from .env vars.
 * Run: node backend/scripts/seedManager.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

async function seed() {
  const { MONGODB_URI, MANAGER_EMAIL, MANAGER_PASSWORD } = process.env;

  if (!MONGODB_URI) {
    console.error('[Seed] MONGODB_URI not set in .env');
    process.exit(1);
  }
  if (!MANAGER_EMAIL || !MANAGER_PASSWORD) {
    console.error('[Seed] MANAGER_EMAIL and MANAGER_PASSWORD must be set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected to MongoDB');

  const existing = await User.findOne({ email: MANAGER_EMAIL.toLowerCase() });
  if (existing) {
    console.log('[Seed] Manager account already exists:', MANAGER_EMAIL);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(MANAGER_PASSWORD, 12);
  await User.create({
    email:        MANAGER_EMAIL.toLowerCase(),
    passwordHash,
    role:         'manager'
  });

  console.log('[Seed] Manager account created:', MANAGER_EMAIL);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
