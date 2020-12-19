const Reviews = require("../models/Reviews");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// @desc Get reviews
// route GET /api/v1/reviews
// route GET /api/v1/bootcamps/:bootcampId/reviews
// Access Public

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Reviews.find({
      bootcamp: req.params.bootcampId,
    }).populate({
      path: "bootcamp",
      select: "name",
    });

    if (!reviews) {
      return next(
        new ErrorResponse(
          `Review not found with bootcamp id ${req.params.bootcampId}`,
          401
        )
      );
    }
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    const reviews = await Reviews.find().populate({
      path: "bootcamp",
      select: "name",
    });
    res.status(200).json(res.advancedResults);
  }
});

// @desc Get a single review
// route GET /api/v1/reviews/:id
// Access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("Review Not Found", 401));
  }

  res.status(200).json({ success: true, review });
});

// @desc Add a  review
// route POST /api/v1/bootcamps/:bootcampID/reviews
// Access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp Not found", 401));
  }

  const review = await Reviews.create(req.body);

  res.status(201).json({ success: true, review });
});

// @desc Update a single review
// route PUT /api/v1/reviews/:id
// Access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Reviews.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  // Make sure review belongs to user or user is admin
  if (review.user.toString() != req.user.id) {
    console.log(review.user.toString(), req.user.id);
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

// @desc Delete a  review
// route DELETE /api/v1/reviews/:id
// Access Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("Review Not Found", 401));
  }
  if (review.user.toString() != req.user.id) {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }
  review.delete();
  res.status(200).json({ success: true, data: {} });
});
