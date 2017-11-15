let app    = require('../../../../index.js');
let axios  = require('axios');
let moment = require('moment');
let logger = app.logger;

module.exports = class CoinsMessageListener {
	constructor() {
		this.users = [];
	}

	parseMessage(message) {
		if (message.channel.id !== app.config.discord.channelId) {
			return;
		}

		if (message.author.bot === true) {
			return;
		}

		let username = this.usernameFromMessage(message);
		let timeSinceLastEvent = this.timeSinceLastCoinEventForUsername(username);

		if (timeSinceLastEvent > app.config.listener.message.coins.timeBetweenEvents) {
			this.users[username] = moment();

			let coins = Math.floor(Math.random() * 5) + 1;

			app.services.brg.addCommunityUserCoins(username, coins);
		}
	}

	usernameFromMessage(message) {
		return message.author.username + '#' + message.author.discriminator;
	}

	timeSinceLastCoinEventForUsername(username) {
		if (username in this.users) {
			return moment() - this.users[username];
		}

		return Number.MAX_VALUE;
	}
}
