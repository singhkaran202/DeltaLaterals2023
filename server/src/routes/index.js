const express = require('express');
const { auth } = require('../components');
const { users } = require('../components');
const { profiles } = require('../components');
const { dweets } = require('../components');

function getRoutes() {
  const router = express.Router();

  router.use('/auth', auth.authRoutes);
  router.use('/users', users.userRoutes);
  router.use('/profiles', profiles.profileRoutes);
  router.use('/dweets', dweets.dweetRoutes);

  return router;
}

module.exports = { getRoutes };
