let axios = require('axios');

module.exports = class BronyRadioGermanyApi {
	static getNowPlaying() {
		return new Promise(function(resolve, reject) {
			axios.get('https://panel.bronyradiogermany.com/api/streaminfo/stream')
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					console.error(error);
					reject(Error(error));
				})
		});
	}
}
