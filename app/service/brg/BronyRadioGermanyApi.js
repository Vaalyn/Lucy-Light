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
}
