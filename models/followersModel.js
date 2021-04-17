const mongoose = require('mongoose');

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
  next();
});

const Followers = mongoose.model('Followers', followersSchema);

module.exports = Followers;
