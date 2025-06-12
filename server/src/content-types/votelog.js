/**
 * Votes Collection Type
 */
module.exports = {
  kind: 'collectionType',
  collectionName: 'plugin-voting-votelogs',
  info: {
    singularName: 'votelog',
    pluralName: 'votelogs',
    displayName: 'Voting logs',
    description: 'Voting logs content type',
  },
  options: {
    draftAndPublish: true,
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
      configurable: true
    },
    iphash: {
      type: 'string',
      configurable: true
    },
    related: {
      type: 'string',
      configurable: true
    },
    voteId: {
      type: 'string',
      configurable: true
    },
    votedAt: {
      type: 'datetime',
      configurable: true
    },
    expiresAt: {
      type: 'datetime',
      configurable: true
    },
    user: {
      type: 'relation',
      target: 'plugin::voting.vote',
      relation: 'manyToOne'
    }
  },
};
