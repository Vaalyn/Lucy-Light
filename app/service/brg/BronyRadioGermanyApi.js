let app    = require('../../../index.js');
let axios  = require('axios');
let logger = app.logger;

module.exports = class BronyRadioGermanyApi {
	static getNowPlaying() {
		return new Promise(function(resolve, reject) {
			axios.get('https://panel.bronyradiogermany.com/api/streaminfo/stream')
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					logger.error(error);
					reject(error);
				})
		});
	}

	static getCommunityUserCoins(discordUserId) {
		return new Promise(function(resolve, reject) {
			axios.get('https://panel.bronyradiogermany.com/api/communtiy/user/coin/' + encodeURIComponent(discordUserId))
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					logger.error(error);
					reject(error);
				})
		});
	}

	static addCommunityUserCoins(discordUsername, discordUserId, coins) {
		return new Promise(function(resolve, reject) {
			axios.post('https://panel.bronyradiogermany.com/api/communtiy/user/coin/add' + '?authorizationToken=' + app.config.brg.authToken, {
				discordUsername: discordUsername,
				discordUserId: discordUserId,
				coins: coins
			})
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					logger.error(error);
					reject(error);
				})
		});
	}
}
