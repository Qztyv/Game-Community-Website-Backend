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

// virtual populate (solves the issue of parent referencing
// where the parent has no access to the childs referencing it, post is parent, like is child)
postSchema.virtual('likeList', {
  ref: 'Like',
  foreignField: 'post',
  localField: '_id'
});

postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires'
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
