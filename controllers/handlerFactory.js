const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures.js');
const AppError = require('./../utils/appError');
const { filterObjTakesArray } = require('../utils/filterObj');

// ensure user has permissions for the document. bases validation off bearer token / cookie, not req.body.user
exports.validateDocument = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    // had to destrcture out the variables due to javascript object equality issues in conditional
    if (req.user.role !== 'admin' && !document.user) {
      return next(
        new AppError(
          'The user associated with this document does not exist, and you do not have permission to modify it',
          401
        )
      );
    }

    // let admins through if the user of the document does not exist and if it does exist.
    if (req.user.role !== 'admin' && req.user.id !== document.user.id) {
      return next(new AppError('You do not own this document', 401));
    }
    next();
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = (Model, ...allowedFields) =>
  catchAsync(async (req, res, next) => {
    let filteredBody = { ...req.body };
    if (allowedFields.length !== 0) {
      filteredBody = filterObjTakesArray(req.body, allowedFields);
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = (Model, ...allowedFields) =>
  catchAsync(async (req, res, next) => {
    // allowedFields is set in the controllers, such as in postController. This is to prevent
    // users from setting the likes or other fields we do not wish to allow them to enter.
    // req.body is all the data sent from the user, as well as data we may have set in middleware
    // before this middleware is ran (can be seen in the router if this is the case)
    let filteredBody = { ...req.body };
    if (allowedFields.length !== 0) {
      filteredBody = filterObjTakesArray(req.body, allowedFields);
    }

    const doc = await Model.create(filteredBody);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      //this populate option is sent from the controller - it is ok for simple populates, but it does not have
      // access to the req parameter
      query = query.populate(populateOptions);
    }
    if (req.populateOptions) {
      // this branch has more flexibility since it can use req object.
      // It is set in the middleware before this (can be seen in router, method called "populateVoteOfCurrentUser")
      query = query.populate(req.populateOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // req.filter is set in nested controllers, such as GETALL: posts/232321345w/likes. So rather than getting all likes,
    // we get all likes from a specific post.
    const features = new APIFeatures(Model.find(req.filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (populateOptions) {
      features.query = features.query.populate(populateOptions);
    }
    if (req.populateOptions) {
      features.query = features.query.populate(req.populateOptions);
    }
    //const doc = await features.query.explain();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
