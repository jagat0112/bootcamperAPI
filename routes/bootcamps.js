const {
  showBootcamp,
  showBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadPhoto,
  getBootcampByRadius,
} = require("../controller/bootcamps");

const { protect, authorize } = require("../middleware/auth");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const express = require("express");

const router = express.Router();

router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);
router.route("/:zipcode/:distance").get(getBootcampByRadius);
router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), uploadPhoto);
router
  .route("/")
  .get(advancedResults(Bootcamp), showBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);
router
  .route("/:id")
  .get(showBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);

module.exports = router;
