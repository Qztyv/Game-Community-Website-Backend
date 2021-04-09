const Post = require('./../models/postModel');
const factory = require('./handlerFactory');
const amazonS3 = require('./../utils/amazonS3');

exports.uploadPostImage = amazonS3.upload.single('image');

exports.insertPostImageLink = (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.location;
  }

  next();
};

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

exports.getAllPosts = factory.getAll(Post);

exports.getPost = factory.getOne(Post);

// second parameter of create one and update one is optional. It allows us to filter for just the
// inputs we want, stopping users from settings likes to 10000, or if it was a different model, it would
// prevent the user from setting their role to admin for example.
exports.createPost = factory.createOne(
  Post,
  'postTitle',
  'postContent',
  'image',
  'user'
);

exports.updatePost = factory.updateOne(
  Post,
  'postTitle',
  'postContent',
  'image',
  'user'
);

exports.deletePost = factory.deleteOne(Post);
