const asyncHandler = require("../middleware/asyncHandler");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const advancedResults = require("../middleware/advancedResults");

// @desc Register a user
// route POST /api/v1/auth/register
// Access Public
exports.register = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  getTokenResponse(newUser, 200, res);
});

// @desc Logging in a user
// route POST /api/v1/auth/login
// Access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please enter email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 400));
  }

  const isMatched = await user.matchPassword(password);
  if (!isMatched) {
    return next(new ErrorResponse("Invalid Credentials", 400));
  }

  getTokenResponse(user, 200, res);
});

// @desc Forget a password
// route DELETE /api/v1/auth/forgotpassword
// Access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("User not found with this email.", 401));
  }
  user.save({ validateBeforeSave: false });
  const resetToken = await user.sendResetPasswordToken();
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const options = {
    name: user.name,
    email: user.email,
    subject: "Reset Password",
    message: `Please click the link below to reset your password.${resetUrl}`,
  };

  try {
    sendEmail(options);
    res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorResponse("Something went wrong", 500));
  }
});

// @desc Log out
// route GET /api/v1/auth/logout
// Access Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc Reset password
// route PUT /api/v1/auth/resetpassword/:resettoken
// Access Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) {
    return next(new ErrorResponse("please enter a password", 401));
  }
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("User not Found", 401));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.save({ validateBeforeSave: false });
  getTokenResponse(user, 200, res);
});

// @desc About me
// route GET /api/v1/auth/getme
// Access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc Update a password
// route PUT /api/v1/auth/changeinfo
// Access Private

exports.changeInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// @desc Change a password
// route POST /api/v1/auth/changepassword
// Access Public
exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isMatched = await user.matchPassword(req.body.oldpassword);

  if (!isMatched) {
    return next(new ErrorResponse("Invalid old password", 401));
  }
  user.password = req.body.newpassword;

  await user.save();
  getTokenResponse(user, 200, res);
});

const getTokenResponse = (user, statusCode, res) => {
  const token = user.getToken();
  const option = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, option)
    .json({ success: true, token });
};
