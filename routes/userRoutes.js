const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const postController = require('./../controllers/postController');
const commentController = require('./../controllers/commentController');

const router = express.Router();

// In special cases, we can implement routes that do not follow the REST philosophy
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout); // end-user does not send data, they "get" an empty jwt cookie
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.route('/:id/posts').get(
  userController.allowNestedRequests,
  authController.getUserId,
  // to find out on the front end whether the logged in user has  already previously liked the post, we will populate the likeList
  // with the match condition of the user id, so the array will be either empty (not liked), or contain 1 element (liked)
  postController.populateVoteOfCurrentUser,
  postController.getAllPosts
);

router
  .route('/:id/comments')
  .get(
    userController.allowNestedRequests,
    commentController.populatePostOfComment,
    commentController.getAllComments
  );

// Authentication required for all below
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// Authorization required for all below, except getUser (for profile)
//router.use(authController.restrictToRoles('admin'));

router
  .route('/')
  .get(authController.restrictToRoles('admin'), userController.getAllUsers)
  .post(authController.restrictToRoles('admin'), userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.restrictToRoles('admin'), userController.updateUser)
  .delete(authController.restrictToRoles('admin'), userController.deleteUser);

module.exports = router;
