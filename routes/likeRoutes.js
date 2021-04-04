const express = require('express');
const likeController = require('./../controllers/likeController');
const authController = require('./../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(likeController.allowNestedRequests, likeController.getAllLikes)
  .post(likeController.setPostAndUserIds, likeController.createLike);

router
  .route('/:id')
  .get(likeController.getLike)
  .patch(likeController.updateLike)
  .delete(likeController.deleteLike);

module.exports = router;
