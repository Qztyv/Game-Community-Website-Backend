const express = require('express');
const postVoteController = require('../controllers/postVoteController');
const authController = require('../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(postVoteController.allowNestedRequests, postVoteController.getAllVotes)
  .post(postVoteController.setPostAndUserIds, postVoteController.createVote);

router
  .route('/:id')
  .get(postVoteController.getVote)
  .patch(postVoteController.validateVote, postVoteController.updateVote)
  .delete(postVoteController.validateVote, postVoteController.deleteVote);

module.exports = router;
