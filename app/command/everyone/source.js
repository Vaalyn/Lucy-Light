let app     = require('../../../index.js');
let discord = require('discord.js-commando');

module.exports = class SourceCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'source',
			group: 'everyone',
			memberName: 'source',
			description: 'Postet einen Link zum GitHub Projekt',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		var message = 'https://github.com/Vaalyn/Lucy-Light';
		return msg.reply(message);
	}
};
