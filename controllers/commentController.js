const Comment = require('../models/commentModel');
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
    req.body.post = req.params.postId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.populateVoteOfCurrentUser = (req, res, next) => {
  if (req.userId) {
    req.populateOptions = {
      path: 'voteList',
      match: { user: { $eq: req.userId } }
    };
  }
  next();
};

// Dont want to populate posts for every comment EVERY time we do getAllComments, so
// we add it as a pre-middleware and put it in the router that requires it
exports.populatePostOfComment = (req, res, next) => {
  if (req.params.id) {
    req.populateOptions = {
      path: 'post',
      select: 'id postTitle'
    };
  }
  next();
};

exports.validateComment = factory.validateDocument(Comment);

exports.getAllComments = factory.getAll(Comment);

exports.getComment = factory.getOne(Comment);

exports.createComment = factory.createOne(Comment, 'user', 'post', 'content');

exports.updateComment = factory.updateOne(Comment, 'user', 'post', 'content');

exports.deleteComment = factory.deleteOne(Comment);
