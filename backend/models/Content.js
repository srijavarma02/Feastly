const mongoose = require('mongoose');

/**
 * Content — flexible key-value CMS store.
 * key:   unique identifier, e.g. 'heroTagline', 'testimonials', 'pricing'
 * type:  'text' | 'image' | 'array'
 * value: Mixed — string for text/image, array of objects for array type
 */
const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'array'],
      default: 'text'
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Value is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
