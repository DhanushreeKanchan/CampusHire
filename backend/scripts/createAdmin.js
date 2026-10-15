require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || "Placement Admin";

    if (!email || !password) {
      console.error("Usage: node scripts/createAdmin.js admin@example.com StrongPassword");
      process.exit(1);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error("A user with that email already exists.");
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      role: "Admin"
    });

    console.log("Admin created successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
