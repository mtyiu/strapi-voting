'use strict';

module.exports = ({ strapi }) => {
	// strapi.db.lifecycles.subscribe({
	// 	models: ['api::svietimo-kodas-registracija.svietimo-kodas-registracija'],
	// 	async afterCreate(event) {
	// 		const { result } = event;
	// 		console.log('BEFORE CREATE SVIETIMO KODAS', result);
	// 		await strapi.service('voting').sendConfirmationEmail(result.email, 'api::svietimo-kodas-registracija.svietimo-kodas-registracija', result.id, 'Švietimo Kodas 2024');
	// 	},
	// });
};
