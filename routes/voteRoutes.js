const express = require('express');
const voteController = require('../controllers/voteController');
const authController = require('../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(voteController.allowNestedRequests, voteController.getAllVotes)
  .post(voteController.setPostAndUserIds, voteController.createVote);

router
  .route('/:id')
  .get(voteController.getVote)
  .patch(voteController.restrictToOriginalOwner, voteController.updateVote)
  .delete(voteController.restrictToOriginalOwner, voteController.deleteVote);

module.exports = router;
