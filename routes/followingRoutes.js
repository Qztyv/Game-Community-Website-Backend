const express = require('express');
const followingController = require('./../controllers/followingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/addFollowing/:userId')
  .patch(authController.protect, followingController.addUserToFollowing);

router
  .route('/removeFollowing/:userId')
  .delete(authController.protect, followingController.removeUserFromFollowing);

router
  .route('/')
  .get(followingController.getAllFollowings)
  .post(
    authController.protect,
    followingController.setUserId, // If the user is coming from a cookie / bearer token rather than in body.
    followingController.createFollowing
  );

router
  .route('/:id')
  .get(followingController.getFollowing)
  .patch(authController.protect, followingController.updateFollowing)
  .delete(authController.protect, followingController.deleteFollowing);

module.exports = router;
