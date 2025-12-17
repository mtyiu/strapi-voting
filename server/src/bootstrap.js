'use strict';

module.exports = async ({ strapi }) => {
	// Register plugin permissions
	const actions = [
		{
			section: 'plugins',
			displayName: 'Access the Voting plugin',
			uid: 'menu.access',
			pluginName: 'voting',
		},
		{
			section: 'plugins',
			displayName: 'Access Voting plugin settings',
			uid: 'settings.access',
			pluginName: 'voting',
		},
	];

	await strapi.admin.services.permission.actionProvider.registerMany(actions);

	// strapi.db.lifecycles.subscribe({
	// 	models: ['api::svietimo-kodas-registracija.svietimo-kodas-registracija'],
	// 	async afterCreate(event) {
	// 		const { result } = event;
	// 		console.log('BEFORE CREATE SVIETIMO KODAS', result);
	// 		await strapi.service('voting').sendConfirmationEmail(result.email, 'api::svietimo-kodas-registracija.svietimo-kodas-registracija', result.id, 'Švietimo Kodas 2024');
	// 	},
	// });
};
