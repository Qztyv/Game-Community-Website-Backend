const express = require('express');
const commentVoteController = require('../controllers/commentVoteController');
const authController = require('../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(
    commentVoteController.allowNestedRequests,
    commentVoteController.getAllVotes
  )
  .post(
    commentVoteController.setCommentAndUserIds,
    commentVoteController.createVote
  );

router
  .route('/:id')
  .get(commentVoteController.getVote)
  .patch(commentVoteController.validateVote, commentVoteController.updateVote)
  .delete(commentVoteController.validateVote, commentVoteController.deleteVote);

module.exports = router;
