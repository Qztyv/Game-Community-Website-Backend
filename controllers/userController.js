const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { filterObjTakesElements } = require('./../utils/filterObj');
const amazonS3 = require('./../utils/amazonS3');
const regexUtils = require('./../utils/regexUtils');

exports.uploadUserPhoto = amazonS3.upload.single('photo');

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
  // if multer detected a formdata post and it had a file, add the file location to our filteredBody so it can be added to the document
  if (req.file) {
    filteredBody.photo = req.file.location;
  }

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

exports.filterUsersBySearchTermOnName = catchAsync(async (req, res, next) => {
  const filter = {
    name: {
      $regex: regexUtils.escapeRegExp(req.params.nameSearchTerm),
      $options: 'i'
    }
  };
  req.filter = filter;
  next();
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// do not update user passwords with this.
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.banUser = catchAsync(async (req, res, next) => {
  const bannedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      banned: true,
      banReason: req.body.banReason
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: bannedUser
    }
  });
});

exports.unbanUser = catchAsync(async (req, res, next) => {
  const unbannedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      banned: false,
      banReason: ''
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: unbannedUser
    }
  });
});

exports.allowNestedRequests = (req, res, next) => {
  let filter = {};
  // if the user entered users/:id/comments for example, we want to get the comments for that user.
  // we do this by applying a filter in middleware before the get all comments
  if (req.params.id) {
    filter = { user: req.params.id };
  }
  req.filter = filter;
  next();
};
