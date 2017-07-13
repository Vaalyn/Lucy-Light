let config  = require('./config/config.json');
let path    = require('path');
let moment  = require('moment');
let discord = require('discord.js-commando');
let twitter = require('twitter');
let brg     = require('./app/service/brg/BronyRadioGermanyApi.js');
let youtube = require('./app/service/youtube/YouTubeApi.js');
let google  = {
	calendar: require('./app/service/google/GoogleCalendarApi.js')
}

let winston = require('winston');
require('winston-daily-rotate-file');

let logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			formatter: function(options) {
				return moment().format('DD.MM.YYYY, HH:mm:ss') +' '+ options.level.toUpperCase() +' '+ (options.message ? options.message : '') +
				  (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
			}
		}),
		new winston.transports.DailyRotateFile({
			filename: config.logger.filename,
			datePattern: config.logger.datePattern,
			prepend: true,
			level: config.logger.level
		})
	]
});

let twitterClient = new twitter({
	consumer_key: config.twitter.consumerKey,
	consumer_secret: config.twitter.consumerSecret,
	access_token_key: config.twitter.accessTokenKey,
	access_token_secret: config.twitter.accessTokenSecret
});

let client  = new discord.Client({
	owner: config.discord.ownerId,
	commandPrefix: config.discord.commandPrefix
});

let TwitterHelper   = require('./app/service/twitter/TwitterHelper.js');
let twitterHelper   = new TwitterHelper(logger, google, twitterClient);
let StreamRecording = require('./app/service/recording/StreamRecording.js');
let recording       = new StreamRecording(logger);

var lastAnnouncedShow = {};
var lastPlayedSong    = {};

client.on('error', (error)   => { logger.error(error); });
client.on('warn',  (warning) => { logger.warn(warning); });
client.on('debug', (info)    => { logger.debug(info); });

client.on('ready', () => {
	moment.locale('de')

	lastAnnouncedShow.id     = '';
	lastAnnouncedShow.status = '';
	lastPlayedSong.id        = '';
	lastPlayedSong.title     = '';
	lastPlayedSong.artist    = '';

	logger.info('Started and ready!');

	client.registry
	    .registerGroups(config.discord.commandGroups)
	    .registerDefaults()
	    .registerCommandsIn(path.join(__dirname, 'app/command'));
});

client.on('message', message => {
});

client.on('commandError', (cmd, err) => {
	if (err instanceof discord.FriendlyError) return;
	logger.info('Error in command ' + cmd.groupID + ':' + cmd.memberName, err);
});

client.on('commandBlocked', (msg, reason) => {
	logger.info('Command [' + msg.command.groupID + ':' + msg.command.memberName + '] blocked' + '. Reason: ' + reason);
});

client.on('commandPrefixChange', (guild, prefix) => {
	if (prefix === '') {
		logger.info('Prefix removed in guild ' + guild.name + '(' + guild.id + ')');
	}
	else {
		logger.info('Prefix changed to ' + prefix);
	}
});

client.on('commandStatusChange', (guild, command, enabled) => {
	var consoleMessage = 'Command ' + command.groupID + ':' + command.memberName + ' ';

	if (enabled) {
		consoleMessage += 'enabled';
	}
	else {
		consoleMessage += 'disabled';
	}

	consoleMessage += ' in guild ' + guild.name + ' (' + guild.id + ')';
	logger.info(consoleMessage);
});

client.on('groupStatusChange', (guild, group, enabled) => {
	var consoleMessage = 'Group ' + group.id + ' ';

	if (enabled) {
		consoleMessage += 'enabled';
	}
	else {
		consoleMessage += 'disabled';
	}

	consoleMessage += ' in guild ' + guild.name + ' (' + guild.id + ')';
	logger.info(consoleMessage);
});

client.login(config.discord.botToken);

let updateNowPlayingStatus = setInterval(function() {
	brg.getNowPlaying()
		.then(function(response) {
			let id     = response.data.result.id;
			let title  = response.data.result.title;
			let artist = response.data.result.artist;

			if (title.includes('Assertivness') && artist.includes('VSi') && id !== lastPlayedSong.id) {
				client.channels.find((channel) => {return channel.id === config.discord.channelId;})
					.send('https://orig05.deviantart.net/b7b5/f/2013/268/8/0/fluttertrain_by_bronycopter-d6ntenh.gif')
					.then((message) => {})
					.catch((error) => {
						logger.error(error);
					});
			}

			logger.info('Set game to "' + title + ' - ' + artist + '"');
			// TODO: Add check if Twitch Stream is online then set to optional parameter as string
			client.user.setGame(title + ' - ' + artist);

			lastPlayedSong = {
				id: id,
				title: title,
				artist: artist
			}
		})
		.catch(function(error) {
			logger.error(error);
			client.user.setGame('');
		});
}, config.discord.updateNowPlayingStatusInterval);

let updateNextShow = setInterval(function() {
	google.calendar.getNextShow()
		.then(function(response) {
			var nextShow = response;
			var message  = '';

			if (nextShow === undefined) {
				return;
			}

			if (lastAnnouncedShow.id === nextShow.id && lastAnnouncedShow.status === 'soon') {
				if (moment(nextShow.start.dateTime).diff() > config.discord.announceNextShowTimeDifference) {
					return;
				}

				lastAnnouncedShow = {
					id: nextShow.id,
					status: 'now'
				}

				client.registry.resolveCommand('show').run({reply: (response) => {
					logger.info(response);
				}});
			}

			if (lastAnnouncedShow.id !== nextShow.id) {
				lastAnnouncedShow = {
					id: nextShow.id,
					status: 'soon'
				}

				client.registry.resolveCommand('show').run({reply: (response) => {
					logger.info(response);
				}});
			}
		})
		.catch(function(error) {
			logger.error(error);
		});
}, config.discord.updateNextShowInterval);

exports.client   = client;
exports.config   = config;
exports.logger   = logger;
exports.services = {
	brg: brg,
	youtube: youtube,
	google: google,
	recording: recording,
	twitter: twitterClient,
	twitterHelper: twitterHelper
};
