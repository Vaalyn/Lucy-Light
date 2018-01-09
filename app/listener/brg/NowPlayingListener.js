let app    = require('../../../index.js');
let moment = require('moment');

module.exports = class BronyRadioGermanyNowPlayingListener {
	constructor(config, logger, brg) {
		this.config = config;
		this.logger = logger;
		this.brg    = brg;

		this.listenerInterval = null;
		this.lastPlayedSong = {
			id: '',
			title: '',
			artist: ''
		}
	}

	startListening() {
		let self = this;

		this.listenerInterval = setInterval(function() {
			self.brg.getNowPlaying()
				.then(function(response) {
					let id     = response.data.result.id;
					let title  = response.data.result.title;
					let artist = response.data.result.artist;

					self.sendMessageIfSongIsFluttertrain(title, artist);

					self.logger.info('Set game to "' + title + ' - ' + artist + '"');
					// TODO: Add check if Twitch Stream is online then set to optional parameter as string
					app.client.user.setGame(title + ' - ' + artist);

					self.setLastPlayedSong(id, title, artist);
				})
				.catch(function(error) {
					self.logger.error(error);
					app.client.user.setGame('');
				});
		}, self.config.discord.updateNowPlayingStatusInterval);
	}

	stopListening() {
		clearInterval(this.listenerInterval);
	}

	sendMessageIfSongIsFluttertrain(title, artist) {
		let self = this;

		if (title.includes('Assertivness') && artist.includes('VSi') && id !== lastPlayedSong.id) {
			app.client.channels.find((channel) => {return channel.id === self.config.discord.channelId;})
				.send('https://orig05.deviantart.net/b7b5/f/2013/268/8/0/fluttertrain_by_bronycopter-d6ntenh.gif')
				.then((message) => {})
				.catch((error) => {
					logger.error(error);
				});
		}
	}

	setLastPlayedSong(id, title, artist) {
		this.lastPlayedSong = {
			id: id,
			title: title,
			artist: artist
		}
	}
}
