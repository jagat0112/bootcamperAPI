const {
  getCourses,
  getCourse,
  addCourse,
  removeCourse,
  updateCourse,
} = require("../controller/courses");

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, addCourse);
router
  .route("/:id")
  .get(getCourse)
  .delete(protect, authorize("publisher", "admin"), removeCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse);

module.exports = router;
