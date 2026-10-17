require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content  = require('../models/Content');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const correctPricing = [
    {
      tier:     'Essentials',
      tagline:  'The perfect foundation',
      price:    '₹850',
      per:      'per person',
      featured: false,
      features: [
        'Welcome starters (2 items)',
        'Main course — 2 non-veg, 2 veg',
        'Hyderabadi Biryani',
        'One dessert',
        'Service staff included',
        'Basic table setup'
      ]
    },
    {
      tier:     'Signature',
      tagline:  'Our flagship experience',
      price:    '₹1,400',
      per:      'per person',
      featured: true,
      features: [
        'Welcome starters (4 items)',
        'Main course — 4 non-veg, 3 veg',
        'Signature Biryani (Dum Ki)',
        'Two desserts + Sheer Khurma',
        'Full service staff & captain',
        'Premium table dressing',
        'Dedicated event coordinator'
      ]
    },
    {
      tier:     'Royal',
      tagline:  'The ultimate statement',
      price:    '₹2,200',
      per:      'per person',
      featured: false,
      features: [
        'Dastarkhwan welcome spread',
        'Full multi-course experience',
        'Kareli Roast & Murgh Mussallam showpieces',
        'Live biryani dum station',
        'Full dessert buffet',
        'White-glove butler service',
        'Custom floral & décor package',
        'Personal chef attendance'
      ]
    }
  ];

  const correctTestimonials = [
    {
      name:   'Mohammed Farooq',
      event:  'Wedding Reception · Hyderabad',
      quote:  'KateringKing turned our daughter\'s wedding into an absolute dream. Every dish was a masterpiece — the Dum Ki Biryani was unlike anything our 400 guests had ever tasted. The service was impeccable, every detail perfectly executed.',
      rating: 5
    },
    {
      name:   'Priya Reddington',
      event:  'Corporate Gala · 250 Guests',
      quote:  'We hired KateringKing for our annual corporate gala and the feedback was unanimous — best catered event in our company\'s history. The Kareli Roast and Murgh Mussallam were spectacular showstoppers. Truly world-class professionalism.',
      rating: 5
    },
    {
      name:   'Aarav & Kavitha Sharma',
      event:  'Bespoke Private Dining · Anniversary',
      quote:  'The private dining experience KateringKing curated for our anniversary was beyond words. Authentic Hyderabadi cuisine elevated to fine dining heights — every course told a story. Srija and her team are true artists of hospitality.',
      rating: 5
    }
  ];

  await Content.findOneAndUpdate(
    { key: 'pricing' },
    { $set: { value: correctPricing, type: 'array' } },
    { new: true }
  );
  console.log('✓ Pricing fixed');

  await Content.findOneAndUpdate(
    { key: 'testimonials' },
    { $set: { value: correctTestimonials, type: 'array' } },
    { new: true }
  );
  console.log('✓ Testimonials fixed');

  await mongoose.disconnect();
  console.log('Done.');
}

fix().catch(err => { console.error(err.message); process.exit(1); });
