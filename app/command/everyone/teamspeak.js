let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class TeamSpeakCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'teamspeak',
			aliases: ['ts', 'ts3', 'teamspeak3'],
			group: 'everyone',
			memberName: 'teamspeak',
			description: 'Postet Infos zu unserem TeamSpeak3 Server',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		return msg.channel.send("", { embed: {
			color: 6360082,
			title: 'BRG TeamSpeak3 Server',
			description: '-----------------------------',
			fields: [
				{
					name: 'Server:',
					value: 'ts3.bronyradiogermany.com:9988'
				},
				{
					name: 'Regeln:',
					value: '[Zu den Regeln](https://bronyradiogermany.com/forum/thread-57.html)'
				}
			]
		}});
	}
};
