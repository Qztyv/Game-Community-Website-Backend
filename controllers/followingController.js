const Following = require('./../models/followingModel');
const Followers = require('./../models/followersModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.addUserToFollowing = catchAsync(async (req, res, next) => {
  if (req.user.id === req.params.userId) {
    return next(new AppError('You cannot follow yourself', 401));
  }
  let updatedFollowing;
  try {
    updatedFollowing = await Following.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { following: req.params.userId } }, // addToSet ensures we dont add the same user multiple times
      {
        // create document if it doesnt already exist
        upsert: true,
        new: true,
        runValidators: true
      }
    );
  } catch (err) {
    // If the following document does not exist yet, upsert creates it. However, we get an error as the middleware
    // in the route was unable to execute correctly due to the document being null at the time. If this is the error
    // we get, we want to re-execute the query just to increment the like on the user & ensure everything is in sync
    if (err.message === "Cannot read property 'constructor' of null") {
      updatedFollowing = await Following.findOneAndUpdate(
        { user: req.user.id },
        { $addToSet: { following: req.params.userId } }, // addToSet ensures we dont add the same user multiple times
        {
          // create document if it doesnt already exist
          upsert: true,
          new: true,
          runValidators: true
        }
      );
    } else {
      throw err;
    }
  }
  // TODO: INCREMENT FOLLOWERS WITH AGGREGATE LIKE IN FOLLOWING.
  // keep followers in sync with following
  await Followers.findOneAndUpdate(
    { user: req.params.userId },
    { $addToSet: { followers: req.user.id } }, // addToSet ensures we dont add the same user multiple times
    {
      // create document if it doesnt already exist
      upsert: true,
      // return the new document variable
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedFollowing
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
    { $pull: { followers: req.user.id } } // addToSet ensures we dont add the same user multiple times
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
