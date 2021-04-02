const mongoose = require('mongoose');

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
    commentContent: {
      type: String
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

commentSchema.index({ post: 1, user: 1 }, { unique: true });
