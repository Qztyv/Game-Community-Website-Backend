const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(
    reviewController.allowNestedGETReviewsOnTour,
    reviewController.getAllReviews
  )
  .post(
    authController.restrictToRoles('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictToRoles('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictToRoles('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
