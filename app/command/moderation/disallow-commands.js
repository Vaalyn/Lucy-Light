let app               = require('../../../index.js');
let discord           = require('discord.js-commando');
let logger            = app.logger;
let client            = app.client;
let blacklistCommands = app.blacklistCommands;

module.exports = class DisallowCommandsCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'disallow-commands',
			aliases: ['disallow-commands'],
			group: 'moderation',
			memberName: 'disallow-commands',
			description: 'Sperrt einen User für die Benutzung von Befehlen',
			throttling: {
				usages: 6,
				duration: 60
			},
			args: [
				{
					key: 'user',
					label: 'Benutzer',
					prompt: 'Wen darf ich in Zukunft ignorieren?\n',
					type: 'member'
				}
			]
		});
	}

	hasPermission(msg) {
		let response = false;

		if (msg.channel.type !== 'text') {
			return response;
		}

		let commandGroupRoles = app.config.discord.commandGroupRoles.find((role) => {
			return role.group === this.groupID;
		});

		commandGroupRoles.roles.forEach((role) => {
			if (msg.member._roles.includes(role)) {
				response = true;
			}
		});

		return response;
	}

	async run(msg, args) {
		let discordUser = args.user.user;

		let isAlreadyBlacklisted = blacklistCommands.users.some(function(blacklistedUser) {
			if (blacklistedUser.id === discordUser.id) {
				return true;
			}
		});

		if (isAlreadyBlacklisted) {
			return msg.reply('Den ignoriere ich bereits!');
		}

		let user = {
			id: discordUser.id,
			username: discordUser.username,
			discriminator: discordUser.discriminator,
			avatar: discordUser.avatar,
			avatarUrl: discordUser.avatarURL
		};

		blacklistCommands.users.push(user);

		app.saveCommandsBlacklist();

		return msg.reply('Okay, dann ignoriere ich den ab sofort.');
	}
};
