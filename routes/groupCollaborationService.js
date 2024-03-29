const express = require("express");
const Group = require("../models/group");
const User = require("../models/user");
const Budget = require("../models/budget");
const Expense = require("../models/expense");

const router = express.Router();

// GET all groups a user is a member of
router.get("/user", async (req, res, next) => {
  try {
    const groups = await Group.find(
      { members: req.user._id },
      "_id groupName members"
    );
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
});

// POST a new group
router.post("/", async (req, res, next) => {
  const { groupName } = req.body;
  if (!groupName) {
    return res.status(400).send("Group name is required.");
  }

  try {
    const existingGroup = await Group.findOne({ groupName: groupName });

    if (existingGroup) {
      return res.status(400).json({ message: "Group already exists" });
    }

    const newGroup = new Group({
      groupName,
      members: [req.user._id],
      budgets: [],
    });

    await newGroup.save();
    res.status(201).json({
      message: "Group created successfully",
      data: {
        _id: newGroup._id,
        groupName: newGroup.groupName,
        members: newGroup.members,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET a single group by its ID
router.get("/:groupId", async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = await User.find({ _id: { $in: group.members } });

    res.status(200).json({
      _id: group._id,
      groupName: group.groupName,
      members: members.map((member) => ({
        _id: member._id,
        username: member.username,
        email: member.email,
      })),
      memberIds: group.members,
    });
  } catch (error) {
    next(error);
  }
});

// PUT (update) a group by its ID
router.put("/:groupId", async (req, res, next) => {
  const { groupId } = req.params;
  const { groupName, members } = req.body;

  if (!groupName || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({
      message: "groupName and members array are required.",
    });
  }

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { groupName, members },
      { new: true }
    );
    if (!updatedGroup) {
      return res.status(404).send({ message: "Group not found" });
    }
    res.status(200).json({
      message: "Group updated successfully",
      data: {
        _id: updatedGroup._id,
        groupName: updatedGroup.groupName,
        members: updatedGroup.members,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST a new member to a group
router.post("/:groupId/members", async (req, res, next) => {
  const { groupId } = req.params;
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).send({ message: "Member ID is required." });
  }

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: memberId } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).send({ message: "Group not found" });
    }

    res.status(200).send({
      message: "Member added successfully",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE a member from a group
router.delete("/:groupId/members/:memberId", async (req, res, next) => {
  const { groupId, memberId } = req.params;

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).send({ message: "Group not found" });
    }

    res.status(200).send({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
});

// Delete a group by its ID
router.delete("/:groupId", async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Group.findByIdAndDelete(groupId);
    await Budget.deleteMany({ groupId: groupId });
    await Expense.deleteMany({ groupId: groupId });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET all groups (regardless of membership)
router.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find({}, "_id groupName members");
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
