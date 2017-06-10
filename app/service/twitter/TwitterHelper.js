module.exports = class TwitterHelper {
	constructor(logger, google, twitter) {
		this.logger  = logger;
		this.google  = google;
		this.twitter = twitter;
	}

	tweetNextShow() {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.google.calendar.getNextShow()
				.then(function(response) {
					let nextShow = response;
					let tweet    = '';

					if (nextShow !== undefined) {
						tweet += nextShow.summary;
					}
					else {
						tweet += 'Eine Sendung';
					}

					if (tweet.startsWith('@')) {
						tweet = '.' + tweet;
					}

					if (message.length <= 118) {
						tweet += ' – jetzt live im #BRG!';
					}
					else if (message.length <= 103) {
						tweet += ' – jetzt live im Brony Radio Germany!';
					}

					if (message.length < 133) {
						tweet += ' #Brony';
					}

					if (message.length <  135) {
						tweet += ' #MLP';
					}

					self.twitter.post('statuses/update', {status: tweet}, (error, tweet, response) => {
						if (error) {
							self.logger.error(error);
							reject(Error(error));
						}

						resolve(response);
					});
				})
				.catch(function(error) {
					self.logger.error(error);
					reject(Error(error));
				});
		});
	}
}
