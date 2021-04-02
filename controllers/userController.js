const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { filterObjTakesElements } = require('./../utils/filterObj');

exports.getMe = (req, res, next) => {
  // set req.params.id as factory.getOne uses that
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // filter out unwanted field names not yet allowed to be updated / do not exist
  const filteredBody = filterObjTakesElements(req.body, 'name', 'email');

  // update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup instead'
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// do not update user passwords with this.
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
