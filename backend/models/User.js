const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // don't return password in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    preferredGames: [
      {
        type: String,
        enum: [
          'chess',
          'carrom',
          'cards',
          'badminton',
          'table-tennis',
          'cricket',
          'football',
          'volleyball',
          'kabaddi',
          'other',
        ],
      },
    ],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    availability: {
      days: [
        {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
      ],
      timeSlots: [
        {
          type: String,
          enum: ['morning', 'afternoon', 'evening', 'night'],
        },
      ],
    },
    preferredVenues: [
      {
        type: String,
        enum: ['home', 'society-clubhouse', 'local-ground', 'sports-complex'],
      },
    ],
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user',
    },
    playHistory: [
      {
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        game: String,
        date: { type: Date, default: Date.now },
        venue: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
