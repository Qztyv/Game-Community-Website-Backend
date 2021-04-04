const Vote = require('./../models/voteModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.restrictToOriginalOwner = catchAsync(async (req, res, next) => {
  const vote = await Vote.findById(req.params.id);

  if (!vote) {
    return next(new AppError('No document found with that ID', 404));
  }

  // had to destrcture out the variables due to javascript object equality issues in conditional
  const users = {
    currentUser: req.user.id,
    userWhoMadeVote: vote.user.toString()
  };

  if (users.currentUser !== users.userWhoMadeVote) {
    return next(new AppError('You do not own this vote', 401));
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
    req.body.post = req.params.postId; // requests like api/v1/posts/28324611/votes will be redirected from postRoutes to voteRoutes with postId
  }
  if (!req.body.user) {
    req.body.user = req.user.id; // taken from bearer token or cookie instead of through body (req.user is set in authcontroller.protect)
  }

  next();
};

exports.getAllVotes = factory.getAll(Vote);

exports.getVote = factory.getOne(Vote);

exports.createVote = factory.createOne(Vote);

exports.updateVote = factory.updateOne(Vote);

exports.deleteVote = factory.deleteOne(Vote);
