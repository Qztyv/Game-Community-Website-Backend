const Followers = require('../models/followersModel');
const factory = require('./handlerFactory');

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
