const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  deviceInfo: {
    type: mongoose.Schema.Types.ObjectId, ref: "Device", default: null 
  },
  pin:{
    type: String,
    required: false,
    unique: true,
  }
});


//This will generate a pin on create of a user
userSchema.pre("save", async function (next) {
  if (!this.pin) {
    this.pin = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
