let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

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
		var message = '**Abstimmen für das Best of-Voting**: https://panel.bronyradiogermany.com/best-of-voting';
		return msg.reply(message);
	}
};
