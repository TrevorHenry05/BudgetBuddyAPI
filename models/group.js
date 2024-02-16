const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, unique: true, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    budgets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Budget" }],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
