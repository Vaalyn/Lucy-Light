let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalCheatCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-cheat',
			aliases: ['survival-cheat'],
			group: 'moderation',
			memberName: 'survival-cheat',
			description: 'Benutze mächtige Cheats um dich in einer Survival Runde unbesiegbar zu machen.',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'codeword',
					prompt: 'Für welches Codewort willst du Cheaten?',
					type: 'string'
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
		survival.pauseSurvivor(args.codeword, msg.author.id, true)
			.then(function(response) {
				logger.info(response);
				return msg.reply(response);
			})
			.catch(function (error) {
				logger.error(error);
				return msg.reply(error);
			});
	}
};
