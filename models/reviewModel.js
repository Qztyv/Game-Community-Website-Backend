const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware
reviewSchema.pre(/^find/, function(next) {
  // below created inefficient chain of populates. commented out for reference
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });

  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// we use static method as we want to store aggregate method on the model not document
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // 'this' points to the current review
  // 'this.constructor' points to what created the document, so the model.
  // this is a workaround for Review.calc as it is not yet defined
  this.constructor.calcAverageRatings(this.tour);
});

// We need a workaround for recalculating averages on update / delete of a review
// this is because there is no document middleware available for findByIdAndUpdate/Delete
// There is only query middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // turn 'this' from targetting a query, into a variable that targets the document
  this.review = await this.findOne(); // created a property on 'this' variable,
  next();
});
// we essentially attach a property onto 'this' to pass data from query pre / query post middleware
reviewSchema.post(/^findOneAnd/, async function() {
  await this.review.constructor.calcAverageRatings(this.review.tour); // grabbing property that we set a few lines above this.
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
