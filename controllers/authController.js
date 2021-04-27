const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // cookie cannot be accessed or modified in any way by the browser, preventing xss
    httpOnly: true,
    // cookie should only sent on encrypted protocols, so https
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'None' // need protection against csrf due to this property
  });

  // We want to remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  // set the url of the button (such as a link to the part of the website
  // which allows you to set a photo, or maybe to make your first post)
  const url = `${req.get('origin')}/settings`;
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.banned === true) {
    return next(new AppError(`You are banned. Reason: ${user.banReason}`, 403));
  }
  // If everything is ok, send token to client
  createAndSendToken(user, 200, req, res);
});

// This endpoint is for cookie based authentication.
// Users of cookie-based authentication cannot delete the cookie due to httpOnly option.
// End-users that utilize token-based authentication can just delete the cookie from localstorage instead.
exports.logout = (req, res) => {
  res.cookie('jwt', 'logoutUser', {
    expires: new Date(Date.now() + 1),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'None' // need protection against csrf due to this property
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if it exists. Accepts either authorization header or cookie
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verify token. Could stop after this step. But it is still not fully secure
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // Check if user changed password after the token was issued (changed
  // by the user to prevent hackers etc...)
  if (currentUser.changedPasswordAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  if (currentUser.banned === true) {
    return next(
      new AppError(`You are banned. Reason: ${currentUser.banReason}`, 403)
    );
  }
  // Allow access to the protected route
  req.user = currentUser; // We use this for authorization (restrictToRoles)
  next();
});

exports.getUserId = catchAsync(async (req, res, next) => {
  // Get token and check if it exists. Accepts either authorization header or cookie
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next();
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  req.userId = decoded.id;
  next();
});

// create a wrapper function so we can pass
// an array of roles/arguments into middleware from the route. known as closure?
exports.restrictToRoles = (...roles) => {
  return (req, res, next) => {
    // roles might be ['admin']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate random reset token (not jwt)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send token to users email (make a url for it and send it)
  // For a SPA, the frontend will be sending to our server endpoint url to trigger
  // our endpoint. We want to attach the reset token to their origin url
  // If there is no origin url, it came through an api call like postman
  let resetURL;
  if (req.get('origin')) {
    resetURL = `${req.get('origin')}/reset-password/${resetToken}`;
  } else {
    resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
  }
  // We need to do more than simply send an error down to the client if the promise is rejected here
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    // We do not want these to be set if the email send failed.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // If correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log the user in, sending JWT.
  createAndSendToken(user, 200, req, res);
});
