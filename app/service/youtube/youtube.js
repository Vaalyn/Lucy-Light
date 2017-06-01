let app   = require('../../../index.js');
let axios = require('axios');

module.exports = class YoutubeApi {
	static getYoutubeVideo(title, artist) {
		return new Promise(function(resolve, reject) {
			axios.get('https://www.googleapis.com/youtube/v3/search?part=id&q=' + artist + ' ' + title + '&maxResults=1&type=video&key=' + app.config.google.apiKey)
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
