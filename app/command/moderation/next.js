let app       = require('../../../index.js');
let discord   = require('discord.js-commando');
let logger    = app.logger;
let client    = app.client;
let recording = app.services.recording;

module.exports = class NextCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'next',
			aliases: ['next'],
			group: 'moderation',
			memberName: 'next',
			description: 'Beendet eine laufende Sendung und startet eine neue',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	hasPermission(msg) {
		var response = false;

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
		recording.stop()
			.then(function(response) {
				logger.info('Sendung beendet von: ' + msg.author.username);
				msg.reply('Alles klar, die Sendung ist vorbei. Gleich geht es mit der nächsten Sendung weiter...');

				recording.start()
					.then(function(response) {
						logger.info('Sendung gestartet von: ' + msg.author.username);
						return msg.reply('Die nächste Sendung läuft jetzt, gib alles!');
					})
					.catch(function (error) {
						logger.error(error);
						return msg.reply('Tut mir leid, ich konnte die nächste Sendung nicht starten');
					});
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Es läuft momentan keine Sendung, bitte verwende den `!! onair` Befehl zum starten einer neuen Sendung');
			});
	}
};
