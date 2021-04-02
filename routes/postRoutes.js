const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    postController.setUserId,
    postController.createPost
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    postController.restrictToOriginalOwner,
    postController.updatePost
  )
  .delete(
    authController.protect,
    postController.restrictToOriginalOwner,
    postController.deletePost
  );

module.exports = router;
