const {
  getPluginService,
  parseParams,
  throwError,
} = require('../utils/functions');

module.exports = {
  getService(name = 'voting') {
    return getPluginService(name)
  },
  getContentTypes(ctx) {
    ctx.body = this.getService()
      .fetchContentTypes();
  },
  getContentTypesFields(ctx) {
    const { model } = ctx.params
    ctx.body = this.getService()
      .fetchContentTypesFields(model)
  },
  sanitizeData(data, id, ctx) {
    const schema = strapi.getModel(id);
    const { auth } = ctx.state;
    return strapi.contentAPI.sanitize.output(data, schema, { auth });
  },
  async getCollection(ctx) {
    const { id } = ctx.params;

    // console.log('ID:', id);

    const entries = await this.getService().getCollection(id)

    // console.log('Entries before sanitization:', entries);

    ctx.body = await this.sanitizeData(entries, id, ctx)

    // console.log('Response:', ctx.body);
  },
  async vote(ctx) {
    const { request, params = {}, state = {} } = ctx;
    const { relation } = parseParams(params);
    const { user } = state;
    const { body = {} } = request;
    const { fingerprint } = ctx.req

    // console.log('[CONTROLLERS] Strapi-Voting: vote', relation);
    try {
      const entity = await this.getService().vote(relation, body, user, fingerprint, true);
      if (entity) {
        return entity;
      }
    } catch (e) {
      throwError(ctx, e);
    }
  },
  async deleteVote(ctx) {
    const { request, params = {}, state = {} } = ctx;
    const { relation } = parseParams(params);
    const { user } = state;
    const { body = {} } = request;
    const { fingerprint } = ctx.req

    // console.log('[CONTROLLERS] Strapi-Voting: vote', relation);
    try {
      const entity = await this.getService().vote(relation, body, user, fingerprint, false);
      if (entity) {
        return entity;
      }
    } catch (e) {
      throwError(ctx, e);
    }
  },
  async confirmEmail(ctx) {
    const { confirmationToken, collectionName } = ctx.params
    try {
      const confirmedEntry = await this.getService().confirmEmail(confirmationToken, collectionName)
      if (confirmedEntry) {
        if (collectionName === 'api::svietimo-kodas-registracija.svietimo-kodas-registracija') {
          ctx.redirect('https://projektas.lrytas.lt/svietimo-kodas-2024/registracija/patvirtinimas');
        } else {
          ctx.redirect('https://projektas.lrytas.lt/svietimo-kodas-2024/registracija/el-pasto-patvirtinimas');
        }
      }
    } catch (e) {
      throwError(ctx, e);
    }
  },
}
