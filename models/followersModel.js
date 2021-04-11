const mongoose = require('mongoose');
const User = require('./userModel');

const followersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Followers must belong to a user'],
      unique: true
    },
    followers: [
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

followersSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'followers',
    select: '-__v -email'
  });
  //.populate({ path: 'user', select: '-__v -email' });
  next();
});

followersSchema.statics.adjustFollowerCount = async function(userId) {
  const followerCount = await this.aggregate([
    {
      $match: { user: userId }
    },
    {
      $project: { count: { $size: '$followers' } }
    }
  ]);

  if (followerCount.length > 0) {
    await User.findByIdAndUpdate(userId, {
      followers: followerCount[0].count
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      followers: 0
    });
  }
};

followersSchema.post('save', function() {
  // 'this' points to the current vote
  // 'this.constructor' points to what created the document, so the model.
  this.constructor.adjustFollowerCount(this.user);
});

followersSchema.pre(/^findOneAnd/, async function(next) {
  this.followers = await this.findOne();
  next();
});

followersSchema.post(/^findOneAnd/, async function() {
  // access the document object stored from the pre middleware above
  await this.followers.constructor.adjustFollowerCount(this.followers.user);
});
const Followers = mongoose.model('Followers', followersSchema);

module.exports = Followers;
