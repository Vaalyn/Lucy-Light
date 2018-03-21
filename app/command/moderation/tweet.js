let app         = require('../../../index.js');
let discord     = require('discord.js-commando');
let logger      = app.logger;
let client      = app.client;
let twitter     = app.services.twitter;
let twitterText = require('twitter-text');

module.exports = class TweetCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'tweet',
			group: 'moderation',
			memberName: 'tweet',
			description: 'Sendet einen Tweet auf Twitter',
			throttling: {
				usages: 3,
				duration: 900
			},
			args: [
				{
					key: 'tweet',
					label: 'Tweet',
					prompt: 'Was möchtest du Tweeten?\n',
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
		let message = args.tweet;

		let parseResult = twitterText.parseTweet(message).valid
		if (!parseResult.valid) {
			if (parseResult.permillage > 1000) {
				return msg.reply('Dein Tweet ist zu lang und hat ' + (parseResult.permillage / 10).toFixed(1) + '% der maximalen Länge!')
			} else {
				return msg.reply('Dein Tweet wurde von Twitter verworfen und als nicht zulässig betrachtet!')
			}
		}

		twitter.post('statuses/update', {status: message}, (error, tweet, response) => {
			if (error) {
				logger.error(error);
				return msg.reply('Beim senden deines Tweets ist ein Fehler aufgetreten');
			}

			return msg.reply('Dein Tweet wurde gesendet');
		});
	}
};
