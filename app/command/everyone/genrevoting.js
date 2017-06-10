let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class GenreVotingCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'genrevoting',
			group: 'everyone',
			memberName: 'genrevoting',
			description: 'Postet den Link zum Genre des Monats Voting',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		var message = '**Abstimmen für das Genre des Monats**: https://brg.drweissbrot.net/genre';
		return msg.reply(message);
	}
};
