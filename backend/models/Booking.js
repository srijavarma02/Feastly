const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // ── Contact details ──────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s\-]{7,20}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },

    // ── Event details ────────────────────────────────────
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ['Wedding', 'Corporate', 'Private Dining', 'Social Gala', 'Other'],
        message: '{VALUE} is not a valid event type'
      }
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required']
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1'],
      max: [10000, 'Guest count cannot exceed 10,000']
    },
    venue: {
      type: String,
      required: [true, 'Venue / location is required'],
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters']
    },

    // ── Services requested ───────────────────────────────
    // Array of strings so multiple services can be selected
    services: {
      type: [String],
      enum: {
        values: ['Full Catering', 'Food Only', 'Service Staff Only', 'Equipment Setup', 'Consultation'],
        message: '{VALUE} is not a valid service'
      },
      default: []
    },

    // ── Additional message ───────────────────────────────
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1,000 characters'],
      default: ''
    },

    // ── Admin / status fields ────────────────────────────
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Confirmed', 'Cancelled'],
      default: 'Pending'
    },

    // ── Placeholder for future menu selection ────────────
    // menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
  },
  {
    timestamps: true   // adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
