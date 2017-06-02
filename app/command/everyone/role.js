let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;
let client  = app.client;

module.exports = class RoleCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'role',
			aliases: ['role'],
			group: 'everyone',
			memberName: 'role',
			description: 'Gibt die Rollen und Rollen-IDs des angefragten Nutzers aus',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'member',
					label: 'user',
					prompt: 'Wessen Rollen möchtest du sehen?\n',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		var roles = '\nHier sind die Rollen von `' + args.member.displayName + '`:\n';

		function getRole (roleId) {
			var foundRole;

			client.channels.forEach(function(channel) {
				if (channel.id === app.config.discord.channelId) {
					channel.guild.roles.forEach(function(role) {
						if (role.id === roleId) {
							foundRole = role;
						}
					});
				}
			});

			return foundRole;
		}

		roles += '```\n';
		args.member._roles.forEach(function(roleId) {
			let role = getRole(roleId);
			roles += role.name + ': ' + role.id + '\n';
		});
		roles += '```\n';

		return msg.reply(roles);
	}
};
