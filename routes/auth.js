const express = require("express");
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

const { protect, adminAuth, authorizeAdmin } = require("../middleware/auth");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  changeInfo,
  changePassword,
  logout,
} = require("../controller/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/getme").get(protect, getMe);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/changeinfo").put(protect, changeInfo);
router.route("/changePassword").put(protect, changePassword);
router.route("/forgotpassword").post(forgotPassword);

router.route("/resetpassword/:resettoken").put(resetPassword);

module.exports = router;
