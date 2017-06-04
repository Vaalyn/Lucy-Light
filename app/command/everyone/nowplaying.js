let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;
let brg     = app.services.brg;
let youtube = app.services.youtube;

module.exports = class NowPlayingCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'nowplaying',
			aliases: ['nowplaying'],
			group: 'everyone',
			memberName: 'nowplaying',
			description: 'Zeigt das aktuelle Lied an',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		brg.getNowPlaying()
			.then(function(response) {
				var message      = '';
				let upvotes      = response.data.result.upvotes;
				let downvotes    = response.data.result.downvotes;
				let votes        = upvotes - downvotes;
				let title        = response.data.result.title;
				let artist       = response.data.result.artist;
				let currentEvent = response.data.result.current_event;
				let listener     = response.data.result.listener;

				if (currentEvent === 'DJ-Pony Lucy' || currentEvent === 'DJ-Pony Mary') {
					message = 'Gerade läuft im Auto-DJ:\n\n';
				}
				else {
					message = '🔴 **' + currentEvent + '**\n\n';
				}

				message += ':musical_note:  **' + title + ' - ' + artist + '**\n\n';

				if (votes > 0) {
					message += votes + '  💖  |  ';
				}
				else if (votes < 0) {
					message += votes * -1 + '  💔  |  ';
				}

				message += listener + '  👥';

				youtube.getYouTubeVideo(title, artist)
					.then(function(response) {
						if (response.data.items.length > 0) {
							message += '  |  https://youtu.be/' + response.data.items[0].id.videoId
						}
						return msg.reply(message);
					})
					.catch(function(error) {
						logger.error(error);
						return msg.reply(message);
					});
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
