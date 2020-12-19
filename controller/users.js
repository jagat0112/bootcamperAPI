const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);
  res.status(200).json({ success: true, msg: "Deleted Successfully" });
});

exports.showAllUsers = asyncHandler(async (req, res, next) => {
  await advancedResults(User);
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ success: true, user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, user });
});
