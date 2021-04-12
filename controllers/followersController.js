const Followers = require('../models/followersModel');
const Following = require('../models/followingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// the logged in user may want to remove a follower from their own collection
exports.removeUserFromFollowers = catchAsync(async (req, res, next) => {
  await Followers.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { followers: req.params.userId }
    }
  );
  // keep following in sync with followers
  await Following.findOneAndUpdate(
    { user: req.params.userId },
    { $pull: { following: req.user.id } }
  );
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllFollowers = factory.getAll(Followers);

exports.getFollowers = factory.getOne(Followers);

exports.createFollowers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not defined as you cannot create a follower' +
      ' - they are created when a user starts following another user. Please use /following/addFollowing instead'
  });
};

exports.updateFollowers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not defined as you updated create a follower' +
      ' - they are updated when a user starts following / unfollows another user.' +
      'Please use /following/addFollowing or /following/removeFollowing instead'
  });
};

exports.deleteFollowers = factory.deleteOne(Followers);
