const Following = require('./../models/followingModel');
const Followers = require('./../models/followersModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const AddElementToFollowingArray = async req => {
  const updatedFollowing = await Following.findOneAndUpdate(
    { user: req.user.id },
    { $addToSet: { following: req.params.userId } }, // addToSet ensures we dont add the same user multiple times
    {
      // create document if it doesnt already exist
      upsert: true,
      new: true,
      runValidators: true
    }
  );
  return updatedFollowing;
};

const AddElementToFollowersArray = async req => {
  const updatedFollowers = await Followers.findOneAndUpdate(
    { user: req.params.userId },
    { $addToSet: { followers: req.user.id } }, // addToSet ensures we dont add the same user multiple times
    {
      // create document if it doesnt already exist
      upsert: true,
      // return the new document variable
      new: true,
      runValidators: true
    }
  );
  return updatedFollowers;
};

exports.addUserToFollowing = catchAsync(async (req, res, next) => {
  if (req.user.id === req.params.userId) {
    return next(new AppError('You cannot follow yourself', 401));
  }
  const updatedFollowing = await AddElementToFollowingArray(req);
  // keep followers in sync with following
  const updatedFollowers = await AddElementToFollowersArray(req);

  res.status(200).json({
    status: 'success',
    data: {
      // the new user object in the following array is populated before the increment to follower. So the response will not show the updated number - front-end should not rely on the number
      // but instead rely on the fact that the user is now in the array.
      followingCollection: updatedFollowing,
      followersCollection: updatedFollowers
    }
  });
});

exports.removeUserFromFollowing = catchAsync(async (req, res, next) => {
  await Following.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { following: req.params.userId }
    }
  );
  // keep followers in sync with following
  await Followers.findOneAndUpdate(
    { user: req.params.userId },
    { $pull: { followers: req.user.id } }
  );
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.setUserId = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.getAllFollowings = factory.getAll(Following);

exports.getFollowing = factory.getOne(Following);

exports.createFollowing = factory.createOne(Following);

exports.updateFollowing = factory.updateOne(Following);

exports.deleteFollowing = factory.deleteOne(Following);
