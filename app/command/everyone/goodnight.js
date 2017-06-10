let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class GoodNightCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'goodnight',
			aliases: ['gute nacht', 'nachti', 'nacht'],
			group: 'everyone',
			memberName: 'goodnight',
			description: 'Wünscht eine gute Nacht',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		var message = 'Möge Luna über Eure Träume wachen. https://s-media-cache-ak0.pinimg.com/736x/a9/41/74/a9417416bf5fcafb65e0f7b091c70cb1.jpg';
		return msg.reply(message);
	}
};
