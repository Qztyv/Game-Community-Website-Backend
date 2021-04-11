const express = require('express');
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');
const postVoteRouter = require('./../routes/postVoteRoutes');
const commentRouter = require('./../routes/commentRoutes');

const router = express.Router();

// decoupled nesting
router.use('/:postId/postVotes', postVoteRouter); // for better RESTful interactions, we allow nested requests
router.use('/:postId/comments', commentRouter);

router
  .route('/currentlyFollowing')
  .get(
    authController.protect,
    postController.filterPostsByCurrentlyFollowing,
    postController.getAllPosts
  );

router
  .route('/')
  .get(
    authController.getUserId,
    // to find out on the front end whether the logged in user has  already previously liked the post, we will populate the likeList
    // with the match condition of the user id, so the array will be either empty (not liked), or contain 1 element (liked)
    postController.populateVoteOfCurrentUser,
    postController.getAllPosts
  )
  .post(
    authController.protect,
    postController.uploadPostImage,
    postController.insertPostImageLink,
    postController.setUserId, // Need to re-set id if it came from cookie / bearer token and not req.body. Also, multer resets req.body, so its position matters
    postController.createPost
  );

router
  .route('/:id')
  .get(
    authController.getUserId,
    postController.populateVoteOfCurrentUser,
    postController.getPost
  )
  .patch(
    authController.protect,
    postController.validatePost,
    postController.updatePost
  )
  .delete(
    authController.protect,
    postController.validatePost,
    postController.deletePost
  );

module.exports = router;
