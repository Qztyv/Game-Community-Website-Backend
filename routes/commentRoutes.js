const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');
const commentVoteRouter = require('./../routes/commentVoteRoutes');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use('/:commentId/commentVotes', commentVoteRouter);

router
  .route('/')
  .get(
    commentController.allowNestedRequests,
    authController.getUserId,
    // to find out on the front end whether the logged in user has  already previously liked the post, we will populate the voteList
    // with the match condition of the user id, so the array will be either empty (never created collection), or contain 1 element (created a vote)
    commentController.populateVoteOfCurrentUser,
    commentController.getAllComments
  )
  .post(
    authController.protect,
    commentController.setPostAndUserIds,
    commentController.createComment
  );

router
  .route('/:id')
  .get(
    authController.getUserId,
    commentController.populateVoteOfCurrentUser,
    commentController.getComment
  )
  .patch(
    authController.protect,
    commentController.validateComment,
    commentController.updateComment
  )
  .delete(
    authController.protect,
    commentController.validateComment,
    commentController.deleteComment
  );

module.exports = router;
