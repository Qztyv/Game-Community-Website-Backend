const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.allowNestedGETReviewsOnTour = (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  req.filter = filter;
  next();
};

exports.setTourAndUserIds = (req, res, next) => {
  // We need to allow nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
