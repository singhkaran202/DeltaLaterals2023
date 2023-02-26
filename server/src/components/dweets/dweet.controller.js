const { pick } = require('lodash');
const Dweet = require('./dweet.model');
const { ErrorHandler } = require('../../utils/error');
const User = require('../users/user.model');
const Profile = require('../profiles/profile.model');

const getFeedsDweets = async (req, res) => {
  const options = pick(req.query, ['limit', 'page']);
  const { _id: userId } = req.user;
  options.populate = {
    path: 'author',
    select: ['name', 'username', 'avatar'],
  };
  options.sortBy = 'createdAt:desc';

  const profile = await Profile.findOne({ user: userId });

  const dweets = await Dweet.paginate(
    {
      $and: [
        { replyTo: null },
        {
          $or: [
            { author: userId },
            {
              author: {
                $in: profile.following,
              },
            },
          ],
        },
      ],
    },
    options
  );

  res.json(dweets);
};

const getDweets = async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filters = pick(req.query, ['author', 'likes', 'redweets', 'replyTo']);

  // By default, do not include dweets replies
  if (!filters.replyTo) {
    filters.replyTo = null;
  }

  if (filters.author && !(await User.exists({ _id: filters.author }))) {
    throw new ErrorHandler(404, 'User does not exists');
  }

  if (filters.likes && !(await User.exists({ _id: filters.likes }))) {
    throw new ErrorHandler(404, 'User does not exists');
  }

  if (filters.redweets && !(await User.exists({ _id: filters.redweets }))) {
    throw new ErrorHandler(404, 'User does not exists');
  }

  if (filters.replyTo && !(await Dweet.exists({ _id: filters.replyTo }))) {
    throw new ErrorHandler(404, 'Dweet does not exists');
  }

  options.populate = {
    path: 'author',
    select: ['name', 'username', 'avatar'],
  };
  options.sortBy = options.sortBy || 'createdAt:desc';

  const dweets = await Dweet.paginate(filters, options);

  res.json(dweets);
};

const getDweet = async (req, res) => {
  const { dweetId } = req.params;

  const dweet = await Dweet.findById(dweetId).populate('author', ['name', 'username', 'avatar']);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  res.json({ dweet });
};

const createDweet = async (req, res) => {
  const { _id: authUserId } = req.user;
  const values = pick(req.body, ['text', 'replyTo']);
  values.author = authUserId;

  if (values.replyTo && !(await Dweet.exists({ _id: values.replyTo }))) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  const dweet = await Dweet.create(values);

  res.status(201).json({ dweet });

  if (values.replyTo) {
    const originalDweet = await Dweet.findById(values.replyTo);
    await originalDweet.updateRepliesCount();
  }
};

const updateDweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: authUserId } = req.user;
  const newValues = pick(req.body, ['text']);
  newValues.edited = true;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  if (!dweet.author.equals(authUserId) && req.user.role !== 'admin') {
    throw new ErrorHandler(403, "You cannot update someone's dweet");
  }

  Object.assign(dweet, newValues);

  await dweet.save();

  res.json({ dweet });
};

const deleteDweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: authUserId } = req.user;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  if (!dweet.author.equals(authUserId) && req.user.role !== 'admin') {
    throw new ErrorHandler(403, "You cannot delete someone's dweet");
  }

  await dweet.remove();

  res.json({ dweet });

  if (dweet.replyTo) {
    const originalDweet = await Dweet.findById(dweet.replyTo);
    if (originalDweet) {
      await originalDweet.updateRepliesCount();
    }
  }
};

const likeDweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: userId } = req.user;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  const profile = await Profile.findOne({ user: userId });

  if (profile.likesIt(dweetId)) {
    throw new ErrorHandler(400, 'User already likes a dweet');
  }

  await Promise.all([profile.like(dweetId), dweet.like(userId)]);

  res.json({ dweet });
};

const unlikeDweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: userId } = req.user;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  const profile = await Profile.findOne({ user: userId });

  if (!profile.likesIt(dweetId)) {
    throw new ErrorHandler(400, 'User did not liked the dweet yet');
  }

  await Promise.all([profile.unlike(dweetId), dweet.unlike(userId)]);

  res.json({ dweet });
};

const redweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: userId } = req.user;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  const profile = await Profile.findOne({ user: userId });

  if (profile.redweeted(dweetId)) {
    throw new ErrorHandler(400, 'User already redweeted a dweet');
  }

  await Promise.all([profile.redweet(dweetId), dweet.redweet(userId)]);

  res.json({ dweet });
};

const unRedweet = async (req, res) => {
  const { dweetId } = req.params;
  const { _id: userId } = req.user;

  const dweet = await Dweet.findById(dweetId);

  if (!dweet) {
    throw new ErrorHandler(404, 'Dweet not found');
  }

  const profile = await Profile.findOne({ user: userId });

  if (!profile.redweeted(dweetId)) {
    throw new ErrorHandler(400, 'User did not redweeted a dweet yet');
  }

  await Promise.all([profile.unRedweet(dweetId), dweet.unRedweet(userId)]);

  res.json({ dweet });
};

module.exports = {
  getFeedsDweets,
  getDweets,
  getDweet,
  createDweet,
  updateDweet,
  deleteDweet,
  likeDweet,
  unlikeDweet,
  redweet,
  unRedweet,
};
