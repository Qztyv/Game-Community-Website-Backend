const mongoose = require('mongoose');
const Post = require('./postModel');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A vote must belong to a user']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A vote must belong to a post']
    },
    direction: {
      type: Number,
      required: [
        true,
        'A vote must have a direction (1 for like, 0 for unvoting, and -1 for dislike'
      ],
      min: -1,
      max: 1,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

voteSchema.index({ user: 1, post: 1 }, { unique: true });

voteSchema.statics.incrementVoteCount = async function(postId) {
  const voteRating = await this.aggregate([
    {
      $match: { post: postId }
    },
    {
      $project: {
        likes: { $cond: [{ $eq: ['$direction', 1] }, '$direction', 0] },
        dislikes: { $cond: [{ $eq: ['$direction', -1] }, '$direction', 0] }
      }
    },
    {
      $group: {
        _id: '$post',
        sumOfTotalLikes: { $sum: '$likes' },
        sumOfTotalDislikes: { $sum: '$dislikes' }
      }
    }
  ]);

  // if the post has any votes
  if (voteRating.length > 0) {
    const likes = voteRating[0].sumOfTotalLikes;
    const dislikes = Math.abs(voteRating[0].sumOfTotalDislikes);
    const totalVotes = likes + dislikes;
    const likePercentage = (likes / totalVotes) * 100 || 0;

    await Post.findByIdAndUpdate(postId, {
      likes,
      dislikes,
      totalVotes,
      likePercentage
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      likes: 0,
      dislikes: 0,
      totalVotes: 0,
      likePercentage: 0
    });
  }
};

voteSchema.post('save', function() {
  // 'this' points to the current vote
  // 'this.constructor' points to what created the document, so the model.
  // this is a workaround for vote.incrementVoteCount as it is not yet defined
  this.constructor.incrementVoteCount(this.post);
});

// We need a workaround for recalculating total votes on creation / deletion of a vote
// this is because there is no document middleware available for findByIdAndUpdate/Delete
// There is only query middleware. We can get around this by running a query to get the document
voteSchema.pre(/^findOneAnd/, async function(next) {
  // turn 'this' from targetting a query, into a variable that targets the document
  this.vote = await this.findOne(); // created a property on 'this' variable,
  next();
});

voteSchema.post(/^findOneAnd/, async function() {
  // access the document object stored from the pre middleware above
  await this.vote.constructor.incrementVoteCount(this.vote.post);
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
