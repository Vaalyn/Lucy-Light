let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalCheckCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-check',
			aliases: ['survival-check'],
			group: 'everyone',
			memberName: 'survival-check',
			description: 'Melde dich als anwesend damit du den aktuellen Anwesenheitstest überlebst.',
			throttling: {
				usages: 3,
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

	async run(msg, args) {
		survival.registerAttendance(args.codeword, msg.author.id)
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
