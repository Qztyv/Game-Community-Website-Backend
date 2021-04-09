const Post = require('./../models/postModel');
const factory = require('./handlerFactory');
const amazonS3 = require('./../utils/amazonS3');

// We only allow 1 image upload for now on a post. Code is designed for array of images though
exports.uploadPostImages = amazonS3.upload.array('images', 1);

exports.insertPostImagesLinks = (req, res, next) => {
  if (!req.files) {
    return next();
  }
  const images = [];
  req.files.map(file => images.push(file.location));
  req.body.images = images;

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
  'user'
);

exports.updatePost = factory.updateOne(
  Post,
  'postTitle',
  'postContent',
  'user'
);

exports.deletePost = factory.deleteOne(Post);
