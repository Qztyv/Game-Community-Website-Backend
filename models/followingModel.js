const mongoose = require('mongoose');

const followingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A following must belong to a user'],
      unique: true
    },
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

followingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'following',
    select: '-__v -email'
  });
  next();
});

const Following = mongoose.model('Following', followingSchema);

module.exports = Following;
