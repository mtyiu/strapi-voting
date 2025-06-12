/**
 * Votes Collection Type
 */
module.exports = {
  kind: 'collectionType',
  collectionName: 'plugin-voting-votes',
  info: {
    singularName: 'vote',
    pluralName: 'votes',
    displayName: 'Votes',
    description: 'Voting content type',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: true
    },
    'content-type-builder': {
      visible: true
    }
  },
  attributes: {
    ip: {
      type: 'string',
      configurable: false
    },
    iphash: {
      type: 'string',
      configurable: false
    },
    votes: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::voting.votelog',
      configurable: false
    }
  },
};
