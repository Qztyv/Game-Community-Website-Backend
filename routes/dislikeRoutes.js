const express = require('express');
const dislikeController = require('../controllers/dislikeController');
const authController = require('../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(dislikeController.allowNestedRequests, dislikeController.getAllDislikes)
  .post(dislikeController.setPostAndUserIds, dislikeController.createDislike);

router
  .route('/:id')
  .get(dislikeController.getDislike)
  .patch(dislikeController.updateDislike)
  .delete(dislikeController.deleteDislike);

module.exports = router;
