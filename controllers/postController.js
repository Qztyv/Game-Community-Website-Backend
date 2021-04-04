const Post = require('./../models/postModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.setUserId = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.restrictToOriginalOwner = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (post.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not own this post', 401));
  }

  next();
});

exports.populateVoteOfCurrentUser = (req, res, next) => {
  if (req.userId) {
    req.populateOptions = {
      path: 'voteList',
      match: { user: { $eq: req.userId } }
    };
  }
  next();
};
exports.getAllPosts = factory.getAll(Post);

exports.getPost = factory.getOne(Post);

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
