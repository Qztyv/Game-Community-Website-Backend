const mongoose = require('mongoose');
const Post = require('./postModel');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must belong to a user']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A comment must belong to a post']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      trim: true,
      required: [true, 'A comment must have some content'],
      minlength: [1, 'A comment must be atleast 1 character'],
      maxlength: [3000, 'A comment can have at most 3000 characters']
    }
    // likes: {
    //   type: Number,
    //   default: 0
    // },
    // dislikes: {
    //   type: Number,
    //   default: 0
    // },
    // comments: {
    //   type: Number,
    //   default: 0
    // }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

commentSchema.index({ post: 1, user: 1 }, { unique: false });

// Query middleware
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

// we use static method as we want to store aggregate method on the model not document
commentSchema.statics.incrementCommentCount = async function(postId) {
  const commentStats = await this.aggregate([
    {
      $match: { post: postId }
    },
    {
      $group: {
        _id: '$post',
        totalComments: { $sum: 1 }
      }
    }
  ]);

  if (commentStats.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      comments: commentStats[0].totalComments
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      comments: 0
    });
  }
};

commentSchema.post('save', function() {
  // this is a workaround to target the model for the static method
  this.constructor.incrementCommentCount(this.post);
});

commentSchema.pre(/^findOneAnd/, async function(next) {
  // turn 'this' from targetting a query, into a variable that targets the document
  this.comment = await this.findOne(); // created a property on 'this' variable,
  next();
});
// we essentially attach a property onto 'this' to pass data from query pre / query post middleware
commentSchema.post(/^findOneAnd/, async function() {
  await this.comment.constructor.incrementCommentCount(this.comment.post); // grabbing property that we set a few lines above this.
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
