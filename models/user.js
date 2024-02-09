const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  budgets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Budget" }],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
