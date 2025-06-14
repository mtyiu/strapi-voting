'use strict';

const { getPluginService } = require('../utils/functions');
const { checkForExistingId } = require('./utils/functions')
const { REGEX } = require('../utils/constants');
const PluginError = require('./../utils/error');
const { verifyRecaptcha } = require('./../utils/verifyRecaptcha');
const crypto = require('crypto');
module.exports = ({ strapi }) => ({
  pluginService(name = 'common') {
    return getPluginService(name)
  },
  fetchContentTypes() {
    const contentTypes = strapi.contentTypes
    const keys = Object.keys(contentTypes);
    let collectionTypes = [];
    let singleTypes = [];

    keys.forEach((name) => {
      if (name.includes('api::')) {
        const object = {
          uid: contentTypes[name].uid,
          kind: contentTypes[name].kind,
          globalId: contentTypes[name].globalId,
          attributes: contentTypes[name].attributes,
        };
        contentTypes[name].kind === 'collectionType'
          ? collectionTypes.push(object)
          : singleTypes.push(object);
      }
    });

    return { collectionTypes, singleTypes } || null;
  },

  // Send email confirmation
  async sendConfirmationEmail(email, collectionName, entryId, projectName = '') {
    // Check if params provided
    if (!email || !collectionName || !entryId) {
      throw new PluginError(400, 'Email, collectionName and entryId are required.');
    };
    // console.log(`[SERVICES]-[sendConfirmationEmail] Sending email confirmation to <${email}> for entry <${entryId}> in collection <${collectionName}>`);
    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    // Update entry with the generated token
    await strapi.documents(collectionName).update({
      documentId: "__TODO__",
      data: { confirmationToken }
    });
    // Prepare confirmation url and project name
    const confirmationUrl = `https://api.lrytas.lt/balsavimai/voting/email-confirmation/${collectionName}/${confirmationToken}`
    // Send confirmation email
    try {
      await strapi
        .plugin('email')
        .service('email')
        .send({
          template_id: 'd-73f06f7ca1af4f348413a922416a77c8',
          personalizations: [
            {
              from: `Lrytas.lt <pagalba@lrytas.lt>`,
              replyTo: 'pagalba@lrytas.lt',
              subject: 'Registracijos patvirtinimas',
              to: [
                {
                  email: email
                }
              ],
              dynamic_template_data: {
                url: confirmationUrl,
                title: projectName
              }
            }
          ],
          to: email,
          from: `Lrytas.lt <pagalba@lrytas.lt>`,
          replyTo: 'pagalba@lrytas.lt',
          subject: 'Registracijos patvirtinimas'
        });
      // console.log(`[SERVICES]-[sendConfirmationEmail] Sending email confirmation to <${email}> for entry <${entryId}> in collection <${collectionName}> was SUCCESSFUL!`);
    } catch (e) {
      console.log(`[SERVICES]-[sendConfirmationEmail] Sending email confirmation to <${email}> for entry <${entryId}> in collection <${collectionName}> FAILED`);
      console.log(e.message)
    }
  },

  async confirmEmail(confirmationToken, collectionName) {
    // Check if params provided
    if (!confirmationToken || !collectionName) {
      throw new PluginError(400, 'Confirmation token and collectionName are required.');
    };
    // console.log(`[SERVICES]-[confirmEmail] Confirming email with token <${confirmationToken}> in collection <${collectionName}>`);
    const entry = await strapi.db.query(collectionName).findOne({
      where: { confirmationToken }
    })
    if (!entry) {
      throw new PluginError(400, 'Failed to confirm, entry not found', entry);
    }
    // console.log(`[SERVICES]-[confirmEmail] Updating confirmed entry ID: <${entry.id}> in collection <${collectionName}>`);
    const updatedEntry = await strapi.documents(collectionName).update({
      documentId: "__TODO__",
      data: { emailConfirmed: true }
    });
    if (!updatedEntry) {
      throw new PluginError(400, 'Failed to confirm, updating entry failed', updatedEntry);
    }
    // console.log(`[SERVICES]-[confirmEmail] Email for entry ID: <${entry.id}> in collection <${collectionName}> confirmed successfuly!`);
    return updatedEntry
  },

  async getCollection(contentType) {
    const entries = await strapi.documents(contentType).findMany({ populate: '*' })
    return entries
  },
  async createVotelog(payload) {
    try {
      let date = new Date()
      date.setDate(date.getDate() + 1);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      const votelog = await strapi.documents('plugin::voting.votelog').create({
        data: {
          ...payload,
          publishedAt: new Date(),
          expiresAt: date
        },
      });
      if (votelog) {
        return votelog
      }
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async removeVotelog(payload) {
    try {
      const tmp = await strapi.documents('plugin::voting.votelog').findFirst({
        filters: payload,
      });
      if (tmp) {
        const votelog = await strapi.documents('plugin::voting.votelog').delete({
          documentId: tmp.documentId,
          locale: '*',
        });
        return votelog;
      }
      return null;
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async findUser(iphash) {
    // console.log('[VOTING] Looking for user with iphash:', iphash)
    try {
      const user = await strapi.documents('plugin::voting.vote').findMany({
        filters: { iphash },
        populate: ['votes']
      });
      if (user) {
        // console.log('[VOTING] User found..', user)
        return user[0]
      }
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async updateUser(votes, documentId) {
    try {
      const finalVote = await strapi.documents('plugin::voting.vote').update({
        documentId,

        data: {
          votes
        }
      });
      if (finalVote) {
        return finalVote
      }
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async createNewUser(ip, iphash) {
    try {
      const newUser = await strapi.documents('plugin::voting.vote').create({
        data: {
          ip: ip,
          iphash: iphash,
          votes: []
        },
      });
      if (newUser) {
        return newUser
      }
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async doVoting(uid, documentId, votes) {
    // console.log('[VOTING] Doing voting for uid:', uid, 'documentId:', documentId, 'votes:', votes)

    try {
      const entryUpdated = await strapi.documents(uid).update({
        documentId,
        status: 'published',
        data: {
          votes
        }
      });
      if (entryUpdated) {
        return entryUpdated;
      }
    } catch (e) {
      throw new PluginError(400, e.message);
    }
  },
  async vote(relation, data, user = null, fingerprint = {}, add = true) {
    const recaptchaConfig = await this.pluginService().getConfig('googleRecaptcha');
    const votingPeriodsConfig = await this.pluginService().getConfig('votingPeriods');
    const [uid, relatedId] = await this.pluginService().parseRelationString(relation);
    // Google Recaptcha
    const recaptchaEnabled = recaptchaConfig[uid] || false;
    const votingPeriods = votingPeriodsConfig[uid] || {};
    // console.log('[VOTING] Voting periods config:', votingPeriods);
    const dataJson = data && typeof data === 'string' ? JSON.parse(data) : typeof data === 'object' ? data : {}
    if (recaptchaEnabled) {
      if (!dataJson.recaptchaToken) {
        throw new PluginError(400, `Google Recaptcha enabled for the collection but no user captcha token present.`);
      }
      const recaptchaResponse = await verifyRecaptcha(dataJson.recaptchaToken)
      if (!recaptchaResponse || !recaptchaResponse.success) {
        throw new PluginError(400, `Google Recaptcha verification failed.`);
      }
    }
    // Check if voting is allowed
    const now = new Date();
    const votingPeriod = votingPeriods && votingPeriods.start && votingPeriods.end ? {
      start: new Date(votingPeriods.start),
      end: new Date(votingPeriods.end)
    } : null;
    if (votingPeriod && (now < votingPeriod.start || now > votingPeriod.end)) {
      throw new PluginError(403, `Voting is not allowed at the moment. Voting period: ${votingPeriod.start.toISOString()} - ${votingPeriod.end.toISOString()}`);
    }
    // Fingerprinting
    const ip = fingerprint.components.geoip.ip;
    const country = fingerprint.components.geoip.country || 'DEV';
    const userAgent = fingerprint.components.useragent.string;
    if (!ip || !country || !userAgent) {
      throw new PluginError(400, `There has been an error parsing userAgent/IP strings. IP: ${ip}, Country: ${country}, userAgent: ${userAgent}`);
    } else {
      // if (country !== 'LT' && country !== 'ADMIN') {
      //   throw new PluginError(400, `Voting is only possible from within Lithuania. IP: ${ip}, Country: ${country}, userAgent: ${userAgent}`);
      // }
      const hash = fingerprint.hash;
      const iphash = ip.split(',')[0] + hash;
      // Check for correct collection relation string in req
      const singleRelationFulfilled = relation && REGEX.relatedUid.test(relation);
      if (!singleRelationFulfilled) {
        throw new PluginError(400, `Field "related" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`);
      }
      // Parse collection relation string
      // const [ uid, relatedId ] = await this.pluginService().parseRelationString(relation);
      // Find related entity by relation string
      const relatedEntity = await strapi.documents(uid).findOne({
        documentId: relatedId,
        fields: ['votes']
      });
      if (!relatedEntity) {
        throw new PluginError(400, `Relation for field "related" does not exist. Check your payload please.`);
      }

      // If relation correct and entity found...
      if (singleRelationFulfilled && relatedEntity) {
        try {
          // Try to find user
          const votingUser = await this.findUser(iphash)
          // console.log('[VOTING] Voting user found:', votingUser)
          if (votingUser) {
            // Check for ids
            const votedBefore = checkForExistingId(votingUser.votes, relation)
            if (votedBefore) {
              if (add) {
                throw new PluginError(403, `Already voted for ${relation}`);
              } else {
                // console.log('[VOTING] User already voted, but removing vote..')
                const payload = {
                  ip: ip,
                  iphash: iphash,
                  related: relation,
                  voteId: String(relatedEntity.id),
                };
                const voteLog = await this.removeVotelog(payload);
                if (voteLog) {
                  const votes = (await relatedEntity.votes) - 1;
                  return await this.doVoting(uid, relatedId, votes);
                } else {
                  console.log('[VOTING] VoteLog creation failed, aborting..');
                }
              }
            } else if (add) {
              const votes = (await relatedEntity.votes) + 1;
              const voted = await this.doVoting(uid, relatedId, votes);
              if (voted) {
                // console.log('[VOTING] Voted successfuly', JSON.stringify(voted))
                const payload = {
                  ip: ip,
                  iphash: iphash,
                  related: relation,
                  country,
                  userAgent,
                  user: votingUser.id,
                  voteId: String(relatedEntity.id),
                  votedAt: new Date()
                };
                const voteLog = await this.createVotelog(payload);
                if (voteLog) {
                  const updatedVotes = votingUser.votes && votingUser.votes.length > 0 ? [...votingUser.votes, voteLog.id] : [voteLog.id];
                  const updatedUser = await this.updateUser(updatedVotes, votingUser.documentId);
                  if (updatedUser && voted) {
                    // console.log('[VOTING] Voting finished successfuly', JSON.stringify(updatedUser))
                    return voted;
                  } else {
                    console.log('[VOTING] Voting did not successfuly finished, error updating user');
                  }
                } else {
                  console.log('[VOTING] VoteLog creation failed, aborting..');
                }
              } else {
                console.log('[VOTING] Voting failed, aborting..');
              }
            }
            return {};
          } else if (add) {
            // console.log('[VOTING] User not found, creating one..')
            const votingUserNew = await this.createNewUser(ip, iphash)
            if (votingUserNew) {
              // console.log('[VOTING] New user created:', votingUserNew)
              const votes = (await relatedEntity.votes) + 1
              const voted = await this.doVoting(uid, relatedId, votes)
              if (voted) {
                // console.log('[VOTING] Voted successfuly', JSON.stringify(voted))
                const payload = {
                  ip: ip,
                  country,
                  userAgent,
                  iphash: iphash,
                  related: relation,
                  user: votingUserNew.id,
                  voteId: String(relatedEntity.id),
                  votedAt: new Date()
                }
                const voteLog = await this.createVotelog(payload)
                if (voteLog) {
                  const updatedVotes = votingUserNew.votes && votingUserNew.votes.length > 0 ? [...votingUserNew.votes, voteLog.id] : [voteLog.id]
                  const updatedUser = await this.updateUser(updatedVotes, votingUserNew.documentId)
                  if (updatedUser && voted) {
                    // console.log('[VOTING] Voting finished successfuly')
                    return voted
                  } else {
                    console.log('[VOTING] Voting did not successfuly finished, error updating user')
                  }
                } else {
                  console.log('[VOTING] VoteLog creation failed, aborting..')
                }
              } else {
                console.log('[VOTING] Voting failed, aborting..')
              }
            } else {
              console.log('[VOTING] New user creation failed, aborting..')
            }
          } else {
            // console.log('[VOTING] User found, but not adding vote, returning empty object')
            return {};
          }
        } catch (e) {
          throw new PluginError(400, e.message);
        }
      }
      throw new PluginError(400, 'No content received');
    }
  }
});
