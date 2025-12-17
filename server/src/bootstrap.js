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
};
