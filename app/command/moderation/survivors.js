let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivorsCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survivors',
			aliases: ['survivors'],
			group: 'moderation',
			memberName: 'survivors',
			description: 'Listet alle Überlebenden zu einem Codewort auf.',
			throttling: {
				usages: 1,
				duration: 60
			},
			args: [
				{
					key: 'codeword',
					prompt: 'Wie lautet das Codewort?',
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
		survival.listSurvivors(args.codeword)
			.then(function(response) {
				let survivors = response;

				let survivorsList = survivors.join(', ');
				let survivorsMessage = `Die folgenden Personen sind noch dabei: ${survivorsList}`;

				logger.info(survivorsMessage);
				return msg.reply(survivorsMessage);
			})
			.catch(function (error) {
				logger.error(error);
				return msg.reply(error);
			});
	}
};
