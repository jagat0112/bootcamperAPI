const express = require("express");

const router = express.Router({ mergeParams: true });

const Reviews = require("../models/Reviews");
const advancedResults = require("../middleware/advancedResults");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controller/reviews");

const { protect, authorize, adminAuth } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Reviews, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
