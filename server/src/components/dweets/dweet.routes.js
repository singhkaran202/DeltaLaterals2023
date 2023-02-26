const router = require('express').Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const dweetController = require('./dweet.controller');
const dweetValidation = require('./dweet.validation');

router.route('/feed').get(auth(), validate(dweetValidation.getFeedsDweets), dweetController.getFeedsDweets);

router
  .route('/like/:dweetId')
  .post(auth(), validate(dweetValidation.getDweet), dweetController.likeDweet)
  .delete(auth(), validate(dweetValidation.getDweet), dweetController.unlikeDweet);

router
  .route('/redweet/:dweetId')
  .post(auth(), validate(dweetValidation.getDweet), dweetController.redweet)
  .delete(auth(), validate(dweetValidation.getDweet), dweetController.unRedweet);

router
  .route('/')
  .get(validate(dweetValidation.getDweets), dweetController.getDweets)
  .post(auth(), validate(dweetValidation.createDweet), dweetController.createDweet);

router
  .route('/:dweetId')
  .get(validate(dweetValidation.getDweet), dweetController.getDweet)
  .patch(auth(), validate(dweetValidation.updateDweet), dweetController.updateDweet)
  .delete(auth(), validate(dweetValidation.deleteDweet), dweetController.deleteDweet);

module.exports = router;
