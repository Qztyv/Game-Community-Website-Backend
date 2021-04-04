const Like = require('./../models/likeModel');
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
    req.body.post = req.params.postId; // requests like api/v1/posts/28324611/likes will be redirected from postRoutes to likeRoutes with postId
  }
  if (!req.body.user) {
    req.body.user = req.user.id; // taken from bearer token or cookie instead of through body (req.user is set in authcontroller.protect)
  }

  next();
};

exports.getAllLikes = factory.getAll(Like);

exports.getLike = factory.getOne(Like);

exports.createLike = factory.createOne(Like);

exports.updateLike = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined as you cannot update a like'
  });
};

exports.deleteLike = factory.deleteOne(Like);
