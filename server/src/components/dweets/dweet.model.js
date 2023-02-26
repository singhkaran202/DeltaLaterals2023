const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { paginatePlugin } = require('../../utils/mongo');

const DweetSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Dweet',
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    redweets: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // redweetedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
    // likedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
  },
  { timestamps: true }
);

// Add paginate plugin
DweetSchema.plugin(paginatePlugin);

DweetSchema.methods.updateRepliesCount = async function () {
  this.repliesCount = await mongoose.model('Dweet').countDocuments({ replyTo: this._id });
  return this.save();
};

DweetSchema.methods.like = function (userId) {
  if (!this.likes.some((id) => id.equals(userId))) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

DweetSchema.methods.unlike = function (userId) {
  if (this.likes.some((id) => id.equals(userId))) {
    this.likes.remove(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

DweetSchema.methods.redweet = function (userId) {
  if (!this.redweets.some((id) => id.equals(userId))) {
    this.redweets.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

DweetSchema.methods.unRedweet = function (userId) {
  if (this.redweets.some((id) => id.equals(userId))) {
    this.redweets.remove(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

const Dweet = mongoose.model('Dweet', DweetSchema);

module.exports = Dweet;
