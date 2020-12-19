const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/Bootcamp");

// @desc Get courses
// route GET /api/v1/courses
// route GET /api/v1/bootcamps/:bootcampId/courses
// Access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let courses;
  if (req.params.bootcampId) {
    courses = await Course.find({ bootcamp: req.params.bootcampId }).populate({
      path: "bootcamp",
      select: "name description",
    });
    console.log(courses);
    if (!courses) return next(new ErrorResponse("Course Not Found", 404));
    res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc Get  a single course
// route GET /api/v1/courses/:id
// Access Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorResponse("Course Not Found", 404));
  res.status(200).json({ success: true, data: course });
});

// @desc Add  a  course
// route POSt /api/v1/courses
// Access Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamps) {
    return next(new ErrorResponse("Bootcamp Not Found", 404));
  }
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user._id;

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
  //   console.log(course);
});

// @desc Update  a  course
// route PUT /api/v1/courses/:id
// Access Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  if (req.user.id != course.user) {
    return next(
      new ErrorResponse("You can only delete the course that you own.", 403)
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json({ success: true, data: updatedCourse });
});

// @desc Delete  a  course
// route DELETE /api/v1/courses/:id
// Access Private

exports.removeCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Cannot found the course.", 401));
  }
  if (req.user.id != course.user) {
    return next(
      new ErrorResponse("You can only delete the course that you own.", 403)
    );
  }

  await Course.findByIdAndRemove(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
