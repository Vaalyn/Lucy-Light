let app    = require('../../../../index.js');
let axios  = require('axios');
let moment = require('moment');
let logger = app.logger;

module.exports = class CoinsMessageListener {
	constructor() {
		this.users = [];
		this.usersLastMessages = [];
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

		if (this.hasEnoughTimePassed(userId) && !this.isMessageSpam(message)) {
			this.users[userId] = moment();

			let coins = Math.floor(Math.random() * 5) + 1;

			app.services.brg.addCommunityUserCoins(username, userId, coins);
		}

		this.usersLastMessages[userId].unshift(message.content);

		if (this.usersLastMessages[userId].length > 5) {
			this.usersLastMessages[userId].pop();
		}
	}

	hasEnoughTimePassed(userId) {
		let timeSinceLastEvent = this.timeSinceLastCoinEventForUser(userId);

		if (timeSinceLastEvent > app.config.listener.message.coins.timeBetweenEvents) {
			return true;
		}

		return false;
	}

	timeSinceLastCoinEventForUser(userId) {
		if (userId in this.users) {
			return moment() - this.users[userId];
		}

		return Number.MAX_VALUE;
	}

	isMessageSpam(message) {
		let isSpam = false;

		if (this.usersLastMessages[message.author.id] === undefined) {
			this.usersLastMessages[message.author.id] = [];
		}

		this.usersLastMessages[message.author.id].forEach((userMessage) => {
			if (message.content === userMessage) {
				isSpam = true;
			}
		});

		return isSpam;
	}
}
