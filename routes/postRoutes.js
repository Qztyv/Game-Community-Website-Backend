const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');
const likeRouter = require('./../routes/likeRoutes');
const dislikeRouter = require('./../routes/dislikeRoutes');

const router = express.Router();

// decoupled nesting
router.use('/:postId/likes', likeRouter); // for better RESTful interactions, we allow nested requests
router.use('/:postId/dislikes', dislikeRouter);

router
  .route('/')
  .get(
    authController.getUserId,
    // to find out on the front end whether the logged in user has  already previously liked the post, we will populate the likeList
    // with the match condition of the user id, so the array will be either empty (not liked), or contain 1 element (liked)
    postController.populateLikeByUser,
    postController.getAllPosts
  )
  .post(
    authController.protect,
    postController.setUserId,
    postController.createPost
  );

router
  .route('/:id')
  .get(
    authController.getUserId,
    postController.populateLikeByUser,
    postController.getPost
  )
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
