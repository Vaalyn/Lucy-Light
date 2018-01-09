let app    = require('../../../../index.js');
let moment = require('moment');

module.exports = class TwitterTimelinePostsListener {
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;

		this.startedAt = 0;
		this.announcedPosts = [];
		this.listenerIntervall = null;
	}

	startListening() {
		let self = this;

		this.startedAt = moment();

		this.listenerIntervall = setInterval(function() {
			app.services.twitterHelper.getTimeline()
				.then(function(response) {
					self.processTweets(response);
				})
				.catch(function(error) {
					self.logger.error(error);
				});
		}, self.config.listener.twitter.timeline.listenerIntervall)
	}

	processTweets(tweets) {
		for (let tweet of tweets) {
			if (this.shouldTweetBeAnnounced(tweet)) {
				this.announceTweet(tweet);
				break;
			}
		};
	}

	announceTweet(tweet) {
		let self = this;

		app.client.channels.find((channel) => {return channel.id === self.config.discord.channelId;})
			.send('', {
				embed: {
					color: self.config.discord.embed.color,
					author: {
						name: tweet.user.name,
						icon_url: tweet.user.profile_image_url
					},
					title: 'Neuer Twitter Post',
					description: tweet.text,
					fields: [
						{
							name: 'Twitter Account',
							value: '@' + tweet.user.screen_name
						}
					],
					url: tweet.user.url
				}
			})
			.then((message) => {
				self.announcedPosts.push(tweet.id);
			})
			.catch((error) => {
				self.logger.error(error);
			});
	}

	shouldTweetBeAnnounced(tweet) {
		if (moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en') < this.startedAt) {
			return false;
		}

		if (tweet.in_reply_to_status_id !== null) {
			return false;
		}

		if (tweet.in_reply_to_status_id_str !== null) {
			return false;
		}

		if (tweet.in_reply_to_user_id !== null) {
			return false;
		}

		if (tweet.in_reply_to_user_id_str !== null) {
			return false;
		}

		if (tweet.in_reply_to_screen_name !== null) {
			return false;
		}

		if (tweet.hasOwnProperty('retweeted_status')) {
			return false;
		}

		return !this.hasTweetBeenAnounced(tweet.id);

		return true;
	}

	hasTweetBeenAnounced(id) {
		let hasBeenAnounced = false;

		this.announcedPosts.forEach((post) => {
			if (post === id) {
				hasBeenAnounced = true;
			}
		});

		return hasBeenAnounced;
	}
}
