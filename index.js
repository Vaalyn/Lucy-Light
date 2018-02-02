let config   = require('./config/config.json');
let path     = require('path');
let moment   = require('moment');
let discord  = require('discord.js-commando');
let twitter  = require('twitter');
let brg      = require('./app/service/brg/BronyRadioGermanyApi.js');
let twitch   = require('./app/service/twitch/TwitchApi.js');
let youtube  = require('./app/service/youtube/YouTubeApi.js');
let google   = {
	calendar: require('./app/service/google/GoogleCalendarApi.js')
};

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

let TwitterHelper           = require('./app/service/twitter/TwitterHelper.js');
let twitterHelper           = new TwitterHelper(config, logger, google, twitterClient);

let StreamRecording = require('./app/service/recording/StreamRecording.js');
let recording       = new StreamRecording(logger);

let listener = {
	coins: require('./app/listener/message/coins/CoinsMessageListener.js'),
	twitterTimeline: require('./app/listener/twitter/timeline/TwitterTimelinePostsListener.js'),
	brgNowPlaying: require('./app/listener/brg/NowPlayingListener.js'),
	brgNextShow: require('./app/listener/brg/NextShowListener.js')
};
let coinsMessageListener    = new listener.coins();
let twitterTimelineListener = new listener.twitterTimeline(config, logger);
let brgNowPlayingListener   = new listener.brgNowPlaying(config, logger, brg, twitch);
let brgNextShowListener     = new listener.brgNextShow(config, logger, google);

client.on('error', (error)   => { logger.error(error); });
client.on('warn',  (warning) => { logger.warn(warning); });
client.on('debug', (info)    => { logger.debug(info); });

client.on('ready', () => {
	moment.locale('de')

	client.registry
	    .registerGroups(config.discord.commandGroups)
	    .registerDefaults()
	    .registerCommandsIn(path.join(__dirname, 'app/command'));

	twitterTimelineListener.startListening();
	brgNowPlayingListener.startListening();
	brgNextShowListener.startListening();

	logger.info('Started and ready!');
});

client.on('disconnected', message => {
	brgNowPlayingListener.stopListening();
	brgNextShowListener.stopListening();
});

client.on('message', message => {
	coinsMessageListener.parseMessage(message);
});

client.on('commandError', (cmd, err) => {
	if (err instanceof discord.FriendlyError) return;
	logger.info('Error in command ' + cmd.groupID + ':' + cmd.memberName, err);
});

client.on('commandBlocked', (msg, reason) => {
	logger.info('Command [' + msg.command.groupID + ':' + msg.command.memberName + '] blocked' + '. Reason: ' + reason);
});

client.on('commandPrefixChange', (guild, prefix) => {
	logger.info('Set Prefix in guild ' + guild.name + '(' + guild.id + ') to "' + prefix + '"');
});

client.on('commandStatusChange', (guild, command, enabled) => {
	var consoleMessage = 'Set Command ' + command.groupID + ':' + command.memberName + ' to enabled=' + enabled;
	consoleMessage += ' in guild ' + guild.name + ' (' + guild.id + ')';
	logger.info(consoleMessage);
});

client.on('groupStatusChange', (guild, group, enabled) => {
	var consoleMessage = 'Set Group ' + group.id + ' to enabled=' + enabled;
	consoleMessage += ' in guild ' + guild.name + ' (' + guild.id + ')';
	logger.info(consoleMessage);
});

client.login(config.discord.botToken);

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
