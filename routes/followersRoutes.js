const express = require('express');
const followersControllers = require('../controllers/followersController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/removeFollower/:userId')
  .delete(authController.protect, followersControllers.removeUserFromFollowers);

router
  .route('/')
  .get(followersControllers.getAllFollowers)
  .post(authController.protect, followersControllers.createFollowers);

router
  .route('/:id')
  .get(followersControllers.getFollowers)
  .patch(authController.protect, followersControllers.updateFollowers)
  .delete(authController.protect, followersControllers.deleteFollowers);

module.exports = router;
