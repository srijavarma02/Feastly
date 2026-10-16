/**
 * seedContent.js
 * Populates MongoDB with default CMS content.
 * Run: node backend/scripts/seedContent.js
 * Safe to re-run — only inserts keys that don't already exist.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content  = require('../models/Content');

const defaults = [
  {
    key:   'heroTagline',
    type:  'text',
    value: 'BeSpoke Catering Services'
  },
  {
    key:   'heroDesc',
    type:  'text',
    value: 'Exceptional catering rooted in the rich culinary heritage of Hyderabad, presented with the precision and sophistication of modern hospitality.'
  },
  {
    key:   'aboutBody1',
    type:  'text',
    value: 'At KateringKing.com, we believe that exceptional catering goes beyond just great food — it requires precision, formal expertise, and an unwavering commitment to service.'
  },
  {
    key:   'aboutBody2',
    type:  'text',
    value: 'Backed by formal hotel management education and decades of industry experience, we bring a refined, structured approach to every wedding, corporate gala, and private event we undertake.'
  },
  {
    key:  'testimonials',
    type: 'array',
    value: [
      {
        name:    'Mohammed Farooq',
        event:   'Wedding Reception · Hyderabad',
        quote:   'KateringKing turned our daughter\'s wedding into an absolute dream. Every dish was a masterpiece — the Dum Ki Biryani was unlike anything our 400 guests had ever tasted.',
        rating:  5
      },
      {
        name:    'Priya Reddington',
        event:   'Corporate Gala · 250 Guests',
        quote:   'We hired KateringKing for our annual corporate gala and the feedback was unanimous — best catered event in our company\'s history. The Kareli Roast was spectacular.',
        rating:  5
      },
      {
        name:    'Aarav & Kavitha Sharma',
        event:   'Bespoke Private Dining · Anniversary',
        quote:   'The private dining experience KateringKing curated for our anniversary was beyond words. Authentic Hyderabadi cuisine elevated to fine dining heights.',
        rating:  5
      }
    ]
  },
  {
    key:  'pricing',
    type: 'array',
    value: [
      {
        tier:     'Essentials',
        tagline:  'The perfect foundation',
        price:    '₹850',
        per:      'per person',
        features: ['Welcome starters (2 items)', 'Main course — 2 non-veg, 2 veg', 'Hyderabadi Biryani', 'One dessert', 'Service staff included', 'Basic table setup']
      },
      {
        tier:     'Signature',
        tagline:  'Our flagship experience',
        price:    '₹1,400',
        per:      'per person',
        featured: true,
        features: ['Welcome starters (4 items)', 'Main course — 4 non-veg, 3 veg', 'Signature Biryani (Dum Ki)', 'Two desserts + Sheer Khurma', 'Full service staff & captain', 'Premium table dressing', 'Dedicated event coordinator']
      },
      {
        tier:     'Royal',
        tagline:  'The ultimate statement',
        price:    '₹2,200',
        per:      'per person',
        features: ['Dastarkhwan welcome spread', 'Full multi-course experience', 'Kareli Roast & Murgh Mussallam showpieces', 'Live biryani dum station', 'Full dessert buffet', 'White-glove butler service', 'Custom floral & décor package', 'Personal chef attendance']
      }
    ]
  },
  {
    key:  'menuItems',
    type: 'array',
    value: [
      { name: 'Kareli Roast', category: 'Royal Roasts', description: 'Tender lamb shanks deeply marinated and slow-roasted until the meat falls from the bone.' },
      { name: 'Murgh Mussallam', category: 'Centerpieces', description: 'A whole chicken marinated in rich spices and slow-cooked in the royal Mughal tradition.' },
      { name: 'Dum Ki Biryani', category: 'Biryani', description: 'The hallmark of any grand Hyderabadi feast — sealed dum cooked rice and meat perfection.' },
      { name: 'Haleem', category: 'Heritage', description: 'Slow-cooked wheat and meat — a Hyderabadi icon.' }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SeedContent] Connected to MongoDB');

  let inserted = 0;
  for (const item of defaults) {
    const existing = await Content.findOne({ key: item.key });
    if (!existing) {
      await Content.create(item);
      console.log(`[SeedContent] Inserted: ${item.key}`);
      inserted++;
    } else {
      console.log(`[SeedContent] Skipped (already exists): ${item.key}`);
    }
  }

  console.log(`[SeedContent] Done — ${inserted} new items inserted.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('[SeedContent] Error:', err.message);
  process.exit(1);
});
