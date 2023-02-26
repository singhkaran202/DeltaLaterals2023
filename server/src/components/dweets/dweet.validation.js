const Joi = require('joi');
const { objectId } = require('../../utils/customValidation');

const getFeedsDweets = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDweets = {
  query: Joi.object().keys({
    author: Joi.string().custom(objectId),
    likes: Joi.string().custom(objectId),
    redweets: Joi.string().custom(objectId),
    replyTo: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDweet = {
  params: Joi.object().keys({
    dweetId: Joi.string().required().custom(objectId),
  }),
};

const createDweet = {
  body: Joi.object().keys({
    text: Joi.string().required().min(1).max(280),
    replyTo: Joi.string().custom(objectId),
  }),
};

const updateDweet = {
  params: getDweet.params,
  body: Joi.object().keys({
    text: Joi.string().required().min(1).max(280),
  }),
};

const deleteDweet = {
  params: getDweet.params,
};

module.exports = {
  getFeedsDweets,
  getDweets,
  getDweet,
  createDweet,
  updateDweet,
  deleteDweet,
};
