const express = require("express");
const jwt = require("jsonwebtoken");
const Group = require("../models/group");

const router = express.Router();

router.get("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).send("Access Denied / Unauthorized request");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const groups = await Group.find({ members: decoded.userId });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.post("", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  const { groupName } = req.body;

  if (!token) {
    return res.status(401).send("Access Denied / Unauthorized request");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newGroup = new Group({
      groupName: groupName,
      members: [decoded.userId],
      budgets: [],
    });

    await newGroup.save();
    res.status(201).send("Group created successfully");
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).send("Group not found");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.post("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (group) {
      group.members.push(userId);
      await group.save();
      res.status(200).send("Member added successfully");
    } else {
      res.status(404).send("Group not found");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

router.delete("/:groupId/members/:userId", async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (group) {
      group.members = group.members.filter((member) => member != userId);
      await group.save();
      res.status(200).send("Member removed successfully");
    } else {
      res.status(404).send("Group not found");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
