let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalRegisterCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-register',
			aliases: ['survival-register'],
			group: 'everyone',
			memberName: 'survival-register',
			description: 'Meldet dich bei einem Survival Spiel an.',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'codeword',
					prompt: 'Wie lautet das Codewort für die Survival Runde bei der du dich anmelden möchtest?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		survival.registerSurvivor(args.codeword, msg.author.id, msg.author.username)
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
