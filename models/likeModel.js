const mongoose = require('mongoose');
const Post = require('./postModel');

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A like must belong to a user']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A like must belong to a post']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

likeSchema.index({ user: 1, post: 1 }, { unique: true });

likeSchema.statics.incrementLikeCount = async function(postId) {
  const likeRating = await this.aggregate([
    {
      $match: { post: postId }
    },
    {
      $group: {
        _id: '$post',
        totalLikes: { $sum: 1 }
      }
    }
  ]);

  // if the post has any likes
  if (likeRating.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      likes: likeRating[0].totalLikes
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      likes: 0
    });
  }
};

// Query middleware - not needed for now, unnecessary overhead
// likeSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'name photo'
//   });
//   next();
// });

likeSchema.post('save', function() {
  // 'this' points to the current like
  // 'this.constructor' points to what created the document, so the model.
  // this is a workaround for Like.incrementLikeCount as it is not yet defined
  this.constructor.incrementLikeCount(this.post);
});

// We need a workaround for recalculating total likes on creation / deletion of a like
// this is because there is no document middleware available for findByIdAndUpdate/Delete
// There is only query middleware. We can get around this by running a query to get the document
likeSchema.pre(/^findOneAnd/, async function(next) {
  // turn 'this' from targetting a query, into a variable that targets the document
  this.like = await this.findOne(); // created a property on 'this' variable,
  next();
});

likeSchema.post(/^findOneAnd/, async function() {
  // access the document object stored from the pre middleware above
  await this.like.constructor.incrementLikeCount(this.like.post);
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
