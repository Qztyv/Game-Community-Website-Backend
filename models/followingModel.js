const mongoose = require('mongoose');
const User = require('./userModel');

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
  //.populate({ path: 'user', select: '-__v -email' });
  next();
});

followingSchema.statics.adjustFollowingCount = async function(userId) {
  const followingCount = await this.aggregate([
    {
      $match: { user: userId }
    },
    {
      $project: { count: { $size: '$following' } }
    }
  ]);

  if (followingCount.length > 0) {
    await User.findByIdAndUpdate(userId, {
      following: followingCount[0].count
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      following: 0
    });
  }
};

followingSchema.post('save', function() {
  // 'this' points to the current vote
  // 'this.constructor' points to what created the document, so the model.
  this.constructor.adjustFollowingCount(this.user);
});

followingSchema.pre(/^findOneAnd/, async function(next) {
  this.following = await this.findOne();
  next();
});

followingSchema.post(/^findOneAnd/, async function() {
  // access the document object stored from the pre middleware above
  await this.following.constructor.adjustFollowingCount(this.following.user);
});
const Following = mongoose.model('Following', followingSchema);

module.exports = Following;
