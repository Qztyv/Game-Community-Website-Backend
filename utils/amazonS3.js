const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const AppError = require('./../utils/appError');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const multerStorage = multerS3({
  s3: s3,
  bucket: 'game-community-website-s3-bucket',
  acl: 'public-read',
  key: (req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const ext = file.mimetype.split('/')[1];
    // will be storing the images in a folder named the users id
    cb(null, `${req.user._id}/${name}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'File uploaded is not an image. Please upload an image.',
        400
      )
    );
  }
};

exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
