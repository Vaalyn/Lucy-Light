let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;
let brg     = app.services.brg;
let youtube = app.services.youtube;

module.exports = class BestOfVotingCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'bestofvoting',
			group: 'everyone',
			memberName: 'bestofvoting',
			description: 'Postet den Link zum Best of Voting',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		var message = '**Abstimmen für das Best of-Voting**: https://brg.drweissbrot.net/bestof';
		return msg.reply(message);
	}
};
