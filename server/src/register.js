'use strict';
const middlewares = require('./middlewares');

module.exports = ({ strapi }) => {
  // Register middlewares
  strapi.server.use(middlewares.fingerprint);
};
