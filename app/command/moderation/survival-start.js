let app      = require('../../../index.js');
let discord  = require('discord.js-commando');
let logger   = app.logger;
let client   = app.client;
let survival = app.services.survival;

module.exports = class SurvivalStartCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'survival-start',
			aliases: ['survival-start'],
			group: 'moderation',
			memberName: 'survival-start',
			description: 'Beginnt ein Survival Spiel. Es wird ein Codewort festgelegt welches regelmäßig vom Bot abgefragt wird um die Anwesenheit zu kontrollieren. Anwesenheiten werden protokolliert.',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'roundName',
					prompt: 'Wie soll die Runde heißen?',
					type: 'string'
				},
				{
					key: 'codeword',
					prompt: 'Welches Codewort soll abgefragt werden?',
					type: 'string'
				},
				{
					key: 'attendanceDuration',
					prompt: 'Wie lange soll ein Anwesenheitstest dauern (Minuten)?',
					type: 'integer'
				},
				{
					key: 'registrationDuration',
					prompt: 'Wie lange soll die Anmeldung möglich sein? (Minuten)?',
					type: 'integer'
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
		survival.startSurvivalRound(
			args.roundName,
			args.codeword,
			args.attendanceDuration,
			args.registrationDuration,
			msg.author.username
		)
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
