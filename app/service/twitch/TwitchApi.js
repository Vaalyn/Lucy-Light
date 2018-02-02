let app    = require('../../../index.js');
let axios  = require('axios');
let logger = app.logger;

module.exports = class TwitchApi {
	static getStreamOnline() {
		return new Promise(function(resolve, reject) {
			axios.request({
				method: 'get',
				url: 'https://api.twitch.tv/helix/streams?user_login=bronyradiogermany',
				headers: {
					'Client-ID': app.config.twitch.clientId
				}
			})
				.then((response) => {
					if (response.data.data.length > 0) {
						return resolve(true);
					}

					return resolve(false);
				})
				.catch((error) => {
					logger.error(error);

					return reject(error);
				})
		});
	}
}
