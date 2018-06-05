let twitterText = require('twitter-text');

module.exports = class TwitterHelper {
	constructor(config, logger, google, twitter) {
		this.config  = config;
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
					let tweet = '';
					let tweetUnusedCharacters = () => { return self.config.twitter.tweet.maxLength - twitterText.parseTweet(tweet).weightedLength};

					if (nextShow !== undefined) {
						tweet += nextShow.summary;
					}
					else {
						tweet += 'Eine Sendung';
					}

					if (tweet.startsWith('@')) {
						tweet = '.' + tweet;
					}

					if (tweetUnusedCharacters() >= 37) {
						tweet += ' – jetzt live im Brony Radio Germany!';
					} else if (tweetUnusedCharacters() >= 22) {
						tweet += ' – jetzt live im #BRG!';
					}

					if (tweetUnusedCharacters() >= 7) {
						tweet += ' #Brony';
					}

					if (tweetUnusedCharacters() >= 5) {
						tweet += ' #MLP';
					}

					self.twitter.post('statuses/update', {status: tweet}, (error, tweet, response) => {
						if (error) {
							self.logger.error(error);
							reject(error);
						}

						resolve(response);
					});
				})
				.catch(function(error) {
					self.logger.error(error);
					reject(error);
				});
		});
	}

	getTimeline() {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.twitter.get('statuses/user_timeline', {screen_name: self.config.twitter.screenName}, function(error, tweets, response) {
				if (error) {
					self.logger.error(error);
					reject(error);
				}

				resolve(tweets);
			})
		});
	}
}
