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

		let userId = message.author.id;
		let username = message.author.tag;
		let timeSinceLastEvent = this.timeSinceLastCoinEventForUser(userId);

		if (timeSinceLastEvent > app.config.listener.message.coins.timeBetweenEvents) {
			this.users[userId] = moment();

			let coins = Math.floor(Math.random() * 5) + 1;

			app.services.brg.addCommunityUserCoins(username, userId, coins);
		}
	}

	timeSinceLastCoinEventForUser(userId) {
		if (userId in this.users) {
			return moment() - this.users[userId];
		}

		return Number.MAX_VALUE;
	}
}
