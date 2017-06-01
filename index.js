let config  = require('./config/config.json');
let path    = require('path');
let discord = require('discord.js-commando');
let brg     = require('./app/service/brg/brg.js');
let youtube = require('./app/service/youtube/youtube.js');

let client  = new discord.Client({
	owner: config.discord.ownerId,
	commandPrefix: config.discord.commandPrefix
});

client.registry
    .registerGroups(config.discord.commandGroups)
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'app/command'));

client.on('error', console.error);
client.on('warn', console.warn);
client.on('debug', console.log);

client.on('ready', () => {
	console.log('I am ready!');
});

client.on('message', message => {
	if (message === '!! nowplaying') { return; }
	nowplaying = message;
});

client.on('commandError', (cmd, err) => {
	if (err instanceof discord.FriendlyError) return;
	console.error('Error in command ' + cmd.groupID + ':' + cmd.memberName, err);
});

client.on('commandBlocked', (msg, reason) => {
	console.log('Command [' + msg.command.groupID + ':' + msg.command.memberName + '] blocked' + '. Reason: ' + reason);
});

client.on('commandPrefixChange', (guild, prefix) => {
	if (prefix === '') {
		console.log('Prefix removed in guild ' + guild.name + '(' + guild.id + ')');
	}
	else {
		console.log('Prefix changed to ' + prefix);
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
	console.log(consoleMessage);
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
	console.log(consoleMessage);
});

client.login(config.discord.botToken);

exports.config   = config;
exports.services = {
	'brg': brg,
	'youtube': youtube
}
