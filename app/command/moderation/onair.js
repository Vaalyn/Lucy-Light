let app       = require('../../../index.js');
let discord   = require('discord.js-commando');
let logger    = app.logger;
let client    = app.client;
let recording = app.services.recording;

module.exports = class OnAirCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'onair',
			aliases: ['onair'],
			group: 'moderation',
			memberName: 'onair',
			description: 'Beginnt eine Sendung und zeichnet diese auf',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		recording.start()
			.then(function(response) {
				logger.info('Sendung gestartet von: ' + msg.author.username);
				return msg.reply('Die Sendung läuft jetzt, gib alles!');
			})
			.catch(function (error) {
				logger.error(error);
				return msg.reply('Tut mir leid, ich konnte die Sendung nicht starten');
			});
	}
};
