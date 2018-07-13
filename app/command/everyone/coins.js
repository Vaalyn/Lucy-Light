let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class CoinsCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'coins',
			aliases: ['bits'],
			group: 'everyone',
			memberName: 'coins',
			description: 'Zeigt deine aktuelle Anzahl an Coins/Bits an',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		app.services.brg.getCommunityUserCoins(msg.author.id)
			.then(function(response) {
				let richEmbed = { embed: {
					color: 6360082,
					title: '**Dein aktueller Kontostand**\n\n',
					description: ':moneybag: ' + response.data.result.coins + ' Bits'
				}};

				return msg.channel.send('', richEmbed);
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
