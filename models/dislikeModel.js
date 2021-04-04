const mongoose = require('mongoose');
const Post = require('./postModel');

const dislikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A dislike must belong to a user']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A dislike must belong to a post']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

dislikeSchema.index({ user: 1, post: 1 }, { unique: true });

dislikeSchema.statics.incrementDislikeCount = async function(postId) {
  const dislikeRating = await this.aggregate([
    {
      $match: { post: postId }
    },
    {
      $group: {
        _id: '$post',
        totalDislikes: { $sum: 1 }
      }
    }
  ]);

  // if the post has any dislikes
  if (dislikeRating.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      dislikes: dislikeRating[0].totalDislikes
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      dislikes: 0
    });
  }
};

dislikeSchema.post('save', function() {
  this.constructor.incrementDislikeCount(this.post);
});

dislikeSchema.pre(/^findOneAnd/, async function(next) {
  // turn 'this' from targetting a query, into a variable that targets the document
  this.dislike = await this.findOne(); // created a property on 'this' variable,
  next();
});

dislikeSchema.post(/^findOneAnd/, async function() {
  // access the document object stored from the pre middleware above
  await this.dislike.constructor.incrementDislikeCount(this.dislike.post);
});

const Dislike = mongoose.model('Dislike', dislikeSchema);

module.exports = Dislike;
