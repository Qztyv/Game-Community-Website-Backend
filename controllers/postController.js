const Post = require('./../models/postModel');
const Following = require('./../models/followingModel');
const factory = require('./handlerFactory');
const amazonS3 = require('./../utils/amazonS3');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// used in postrouter before post create middleware
exports.uploadPostImage = amazonS3.upload.single('image');

exports.insertPostImageLink = (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.location;
  }

  next();
};

// set the user.id in the req.body so it stores the user appropriately - used in postrouter middleware before create post
exports.setUserId = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

// checks whether the current user who sent the request has already voted on the post, this is placed in a property called voteList on the object.
exports.populateVoteOfCurrentUser = (req, res, next) => {
  if (req.userId) {
    req.populateOptions = {
      path: 'voteList',
      match: { user: { $eq: req.userId } }
    };
  }
  next();
};

// validating the post checks whether it exists, and whether the current user making the requests has the permissions to access.
exports.validatePost = factory.validateDocument(Post);

// we can add a filter and use it in the postRoutes before executing the getAllPosts.
// this filter will try find the collection owned by the currently logged in user making the request
// (this is set in authcontroller.protect), and then make a mongodb query object.
// This object is slotted into the handlerFactory getAll.
exports.filterPostsByCurrentlyFollowing = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user) {
    const doc = await Following.findOne({ user: req.user.id });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    filter = { user: { $in: doc.following } };
  }
  req.filter = filter;
  next();
});

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
