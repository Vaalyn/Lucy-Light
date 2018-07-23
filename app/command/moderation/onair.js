let app           = require('../../../index.js');
let discord       = require('discord.js-commando');
let logger        = app.logger;
let client        = app.client;
let recording     = app.services.recording;
let google        = app.services.google;
let twitterHelper = app.services.twitterHelper;

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
			},
			args: [
				{
					key: 'mountpoint',
					prompt: 'Auf welchem Stream gehst du live?',
					type: 'string',
					default: 'stream'
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
		recording.start(args.mountpoint)
			.then(function(response) {
				if (response === 'stream') {
					twitterHelper.tweetNextShow()
						.then((response) => {
							logger.log(response);
						})
						.catch((error) => {
							logger.error(error)
						});
				}

				logger.info('Sendung gestartet von: ' + msg.author.username);
				return msg.reply('Die Sendung läuft jetzt, gib alles!');
			})
			.catch(function (error) {
				logger.error(error);
				return msg.reply('Tut mir leid, ich konnte die Sendung nicht starten');
			});
	}
};
