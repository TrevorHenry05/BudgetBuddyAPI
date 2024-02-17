const express = require("express");
const Group = require("../models/group");

const router = express.Router();

// GET all groups a user is a member of
router.get("/user", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// POST a new group
router.post("/", async (req, res) => {
  const { groupName } = req.body;
  if (!groupName) {
    return res.status(400).send("Group name is required.");
  }

  try {
    const newGroup = new Group({
      groupName: groupName,
      members: [req.user._id], // Automatically add the creator as a member
      budgets: [],
    });

    await newGroup.save();
    res
      .status(201)
      .json({ message: "Group created successfully", data: newGroup });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// GET a single group by its ID
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).send("Group not found");
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// PUT (update) a group by its ID
router.put("/:groupId", async (req, res) => {
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
      return res.status(404).send("Group not found");
    }
    res.status(200).json({
      message: "Group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// POST a new member to a group
router.post("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).send("Member ID is required.");
  }

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: memberId } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).send("Group not found");
    }

    res.status(200).json({
      message: "Member added successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// DELETE a member from a group
router.delete("/:groupId/members/:memberId", async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).send("Group not found");
    }

    res.status(200).json({
      message: "Member removed successfully",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// GET all groups (regardless of membership)
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({});
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
