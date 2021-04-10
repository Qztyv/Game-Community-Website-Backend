const PostVote = require('../models/postVoteModel');
const factory = require('./handlerFactory');

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

exports.validateVote = factory.validateDocument(PostVote);

exports.getAllVotes = factory.getAll(PostVote);

exports.getVote = factory.getOne(PostVote);

exports.createVote = factory.createOne(PostVote);

exports.updateVote = factory.updateOne(PostVote);

exports.deleteVote = factory.deleteOne(PostVote);
