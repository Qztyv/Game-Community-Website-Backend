const CommentVote = require('../models/commentVoteModel');
const factory = require('./handlerFactory');

exports.allowNestedRequests = (req, res, next) => {
  let filter = {};
  if (req.params.commentId) {
    filter = { comment: req.params.commentId };
  }
  req.filter = filter;
  next();
};

exports.setCommentAndUserIds = (req, res, next) => {
  // We need to allow nested routes
  if (!req.body.comment) {
    req.body.comment = req.params.commentId; // requests like api/v1/posts/28324611/votes will be redirected from postRoutes to voteRoutes with postId
  }
  if (!req.body.user) {
    req.body.user = req.user.id; // taken from bearer token or cookie instead of through body (req.user is set in authcontroller.protect)
  }

  next();
};

exports.validateVote = factory.validateDocument(CommentVote);

exports.getAllVotes = factory.getAll(CommentVote);

exports.getVote = factory.getOne(CommentVote);

exports.createVote = factory.createOne(CommentVote);

exports.updateVote = factory.updateOne(CommentVote);

exports.deleteVote = factory.deleteOne(CommentVote);
