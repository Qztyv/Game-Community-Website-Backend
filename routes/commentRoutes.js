const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(commentController.allowNestedRequests, commentController.getAllComments)
  .post(
    authController.protect,
    commentController.setPostAndUserIds,
    commentController.createComment
  );

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(
    authController.protect,
    commentController.restrictToOriginalOwner,
    commentController.updateComment
  )
  .delete(
    authController.protect,
    commentController.restrictToOriginalOwner,
    commentController.deleteComment
  );

module.exports = router;
