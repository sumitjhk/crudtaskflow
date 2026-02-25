// ============================================================
//  models/User.js — User Schema
//  Defines the structure of a User document in MongoDB
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Name is required'],
      trim     : true,
    },

    email: {
      type      : String,
      required  : [true, 'Email is required'],
      unique    : true,
      lowercase : true,
      trim      : true,
      match     : [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type      : String,
      required  : [true, 'Password is required'],
      minlength : [6, 'Password must be at least 6 characters'],
      select    : false, // never returned in queries by default
    },

    role: {
      type    : String,
      enum    : ['user', 'admin'],
      default : 'user',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Compare Password Method ──────────────────────────────────
// Called in authController login to compare entered password with hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);