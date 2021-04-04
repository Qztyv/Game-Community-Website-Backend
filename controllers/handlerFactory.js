const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures.js');
const AppError = require('./../utils/appError');
const { filterObjTakesArray } = require('../utils/filterObj');

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
      query = query.populate(populateOptions);
    }
    if (req.populateOptions) {
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
