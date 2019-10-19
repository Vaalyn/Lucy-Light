let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalStopCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-stop',
			aliases: ['survival-stop'],
			group: 'moderation',
			memberName: 'survival-stop',
			description: 'Beendet ein Survival Spiel.',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'codeword',
					prompt: 'Für welches Codewort soll die Runde beendet werden?',
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
		survival.stopSurvivalRound(args.codeword)
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
