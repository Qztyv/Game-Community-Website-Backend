const Post = require('./../models/postModel');
const factory = require('./handlerFactory');

exports.setUserId = (req, res, next) => {
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

exports.validatePost = factory.validateDocument(Post);

exports.getAllPosts = factory.getAll(Post, {
  path: 'user',
  select: '-__v -email'
});

exports.getPost = factory.getOne(Post, {
  path: 'user',
  select: '-__v -email'
});

// second parameter of create one and update one is optional. It allows us to filter for just the
// inputs we want, stopping users from settings likes to 10000, or if it was a different model, it would
// prevent the user from setting their role to admin for example.
exports.createPost = factory.createOne(
  Post,
  'postTitle',
  'postContent',
  'user'
);

exports.updatePost = factory.updateOne(
  Post,
  'postTitle',
  'postContent',
  'user'
);

exports.deletePost = factory.deleteOne(Post);
