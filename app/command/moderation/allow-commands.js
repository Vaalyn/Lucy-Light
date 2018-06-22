let app               = require('../../../index.js');
let discord           = require('discord.js-commando');
let logger            = app.logger;
let client            = app.client;
let blacklistCommands = app.blacklistCommands;

module.exports = class AllowCommandsCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'allow-commands',
			aliases: ['allow-commands'],
			group: 'moderation',
			memberName: 'allow-commands',
			description: 'Schaltet einen User wieder für die Benutzung von Befehlen frei',
			throttling: {
				usages: 6,
				duration: 60
			},
			args: [
				{
					key: 'user',
					label: 'Benutzer',
					prompt: 'Wen soll ich nicht mehr ignorieren?\n',
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

		blacklistCommands.users = blacklistCommands.users.filter(function(blacklistedUser) {
			if (blacklistedUser.id === discordUser.id) {
				msg.reply(`"${blacklistedUser.username}" wird jetzt nicht mehr von mir ignoriert.`);
				return false;
			}

			return true;
		});

		app.saveCommandsBlacklist();
	}
};
