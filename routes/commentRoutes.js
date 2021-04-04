const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');

// merge params is an option to make decoupled nested routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(commentController.allowNestedRequests, commentController.getAllComments)
  .post(commentController.setPostAndUserIds, commentController.createComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(
    commentController.restrictToOriginalOwner,
    commentController.updateComment
  )
  .delete(
    commentController.restrictToOriginalOwner,
    commentController.deleteComment
  );

module.exports = router;
