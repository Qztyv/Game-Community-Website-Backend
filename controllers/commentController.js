const Comment = require('../models/commentModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.restrictToOriginalOwner = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new AppError('No document found with that ID', 404));
  }

  // had to destrcture out the variables due to javascript object equality issues in conditional
  console.log(comment);
  const users = {
    currentUser: req.user.id,
    userWhoMadeComment: comment.user._id.toString()
  };

  if (users.currentUser !== users.userWhoMadeComment) {
    return next(new AppError('You do not own this comment', 401));
  }
  next();
});

exports.allowNestedRequests = (req, res, next) => {
  let filter = {};
  if (req.params.postId) {
    filter = { post: req.params.postId };
  }
  req.filter = filter;
  next();
};

exports.setPostAndUserIds = (req, res, next) => {
  // We need to allow nested routes
  if (!req.body.post) {
    req.body.post = req.params.postId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.getAllComments = factory.getAll(Comment);

exports.getComment = factory.getOne(Comment);

exports.createComment = factory.createOne(Comment);

exports.updateComment = factory.updateOne(Comment);

exports.deleteComment = factory.deleteOne(Comment);
