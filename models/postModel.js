const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A post must belong to a user']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    postTitle: {
      type: String,
      required: [true, 'A post must have a title'],
      trim: true,
      minlength: [1, 'A posts title must be atleast 1 character'],
      maxlength: [300, 'A posts title can have at most 300 characters']
    },
    postContent: {
      type: String,
      trim: true,
      maxlength: [
        3000,
        'The content of a post must not be longer than 3000 characters'
      ]
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    likePercentage: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
postSchema.index({ createdAt: -1 });
postSchema.index({ createdAt: 1 });
postSchema.index({ likePercentage: -1, likes: -1 });
postSchema.index({ likes: -1, dislikes: 1 });

// virtual populate (solves the issue of parent referencing
// where the parent has no access to the childs referencing it, post is parent, like is child)
postSchema.virtual('voteList', {
  ref: 'PostVote',
  foreignField: 'post',
  localField: '_id'
});

// maybe comment out as it is inefficient for some calls. If users need populating,  it can be done via the second
// parameter of handlerFactory getAll / GetOne, or alternatively you can add premiddleware to the Route.
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: '-__v -email'
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
