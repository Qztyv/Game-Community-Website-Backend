const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // To round up not down we do that calc
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      // custom validator can be made if inbuilt do not suffice
      validate: {
        validator: function(val) {
          // Caveat - 'this' only works on create, but on update "this" does not work
          return val < this.price;
        },
        // {VALUE} is internal to mongoose
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      // Can permanently hide properties internally at schema level,
      // better security for stuff like passwords and other sensitive data
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    // startLocation is an embedded object
    startLocation: {
      // GeoJSON - used to specify geospacial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    // To embed documents, we need the field to be an array of objects.
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // will use populating to populate queries of tours with the user info via the ref below
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  }, // Allow virtual properties to be attached to documents of this schema
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// 1 for ascending, 1 for descending.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual properties can be useful in some scenarios
// They cannot be used as part of a query since they are not part of the database
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate (solves the issue of parent referencing
// where the parent has no access to the childs referencing it, tour is parent, review is child)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCOCUMENT MIDDLEWARE - runs before .save() and .create().
// Does not get triggered by insertMany etc..
// 'this' points to the current document
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE - runs before and after .find
// This could be useful for secret tours etc.. some functionality
// for only a certain group of people
//'this' points to the current query
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// .populate() will look at the schema for the ref, and use the id to get data from
// the other collection (user)
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // eslint-disable-next-line no-console
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  next();
});

// AGGREGATION MIDDLEWARE - allows to run middleware before or after
// could add if statement to check if geoNear was first, and if so dont do etc.
//171 - geospacial aggregation calculating distances
// tourSchema.pre('aggregate', function(next) {
//   // Can add another stage at the beginning of aggregate pipeline
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
