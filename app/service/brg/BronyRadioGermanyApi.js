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
					reject(Error(error));
				})
		});
	}

	static getCommunityUserCoins(discordUsername) {
		return new Promise(function(resolve, reject) {
			axios.get('https://panel.bronyradiogermany.com/api/communtiy/user/coin/' + encodeURIComponent(discordUsername))
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					logger.error(error);
					reject(Error(error));
				})
		});
	}

	static addCommunityUserCoins(discordUsername, coins) {
		return new Promise(function(resolve, reject) {
			axios.post('https://panel.bronyradiogermany.com/api/communtiy/user/coin/add' + '?authorizationToken=' + app.config.brg.authToken, {
				discordUsername: discordUsername,
				coins: coins
			})
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					logger.error(error);
					reject(Error(error));
				})
		});
	}
}
