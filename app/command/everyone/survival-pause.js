let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalPauseCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-pause',
			aliases: ['survival-pause'],
			group: 'everyone',
			memberName: 'survival-pause',
			description: 'Nimm eine 30 Minuten pause damit du in dieser Zeit alle Anwesenheitstests überlebst. Du kannst diesen Befehl nur 1 mal alle 4h benutzen!',
			throttling: {
				usages: 1,
				duration: (60 * 60 * 4)
			},
			args: [
				{
					key: 'codeword',
					prompt: 'Wie lautet das Codewort für das du die Pause nimmst?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		survival.pauseSurvivor(args.codeword, msg.author.id)
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
