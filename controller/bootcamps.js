const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geoLocation");
const path = require("path");
const advancedResults = require("../middleware/advancedResults");

// @desc Show all bootcamps
// route GET/api/v1/bootcamps
// Access Public

exports.showBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Show a single bootcamp
// route GET/api/v1/bootcamps/:id
// Access Public

exports.showBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id).populate("courses");
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Bootcamp not found at id of ${req.params.id}`, 400)
    );
  }
  res.status(200).json({ success: true, data: bootcamps });
});

// @desc Create a single bootcamp
// route POST /api/v1/bootcamps
// Access Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const btcamp = await Bootcamp.findOne({ user: req.user.id });
  if (btcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You can only create a single bootcamp", 401)
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc Update a  bootcamp
// route PUT /api/v1/bootcamps/:id
// Access Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false, data: null });
  }

  if (req.user.id !== bootcamp.user && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You can only update your owned bootcamp", 403)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc Delete a  bootcamp
// route DELETE /api/v1/bootcamps/:id
// Access Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false, data: null });
  }

  if (req.user.id !== bootcamp.user && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You can only delete your owned bootcamp", 403)
    );
  }

  bootcamp.delete();
  res.status(200).json({ success: true, data: {} });
});

// @desc Get  bootcamp by radius
// route GET /api/v1/bootcamps/radius/:zipcode/:distance
// Access Private

exports.getBootcampByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc Upload an image
// route UPLOAD /api/v1/bootcamps/:bootcampID/photo
// Access Private

exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);
  if (!bootcamps) {
    return res.status(400).json({ success: false, data: null });
  }

  if (req.user.id !== bootcamps.user && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You can only update your owned bootcamp", 403)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`No file selected`, 400));
  }

  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Image should be less than 10MB`, 400));
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 400));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });

    res.status(200).json({ success: true, data: file.name });
  });
});
