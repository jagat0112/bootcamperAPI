const express = require("express");
const {
  deleteUser,
  showAllUsers,
  getUser,
  updateUser,
} = require("../controller/users");

const router = express.Router();

const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

const { protect, authorize, adminAuth } = require("../middleware/auth");

router.route("/getusers").get(
  advancedResults(User, {
    path: "bootcamp",
    select: "name description",
  }),
  showAllUsers
);
router.route("/deleteuser/:id").delete(protect, adminAuth, deleteUser);
router.route("/updateuser/:id").put(protect, adminAuth, updateUser);
router.route("/getuser/:id").get(protect, adminAuth, getUser);

module.exports = router;
