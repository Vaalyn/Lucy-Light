let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class PayCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'pay',
			aliases: [],
			group: 'everyone',
			memberName: 'pay',
			description: 'Sendet einer anderen Person Coins zu',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'bits',
					label: 'Bits',
					prompt: 'Wie viele Bits möchtest du versenden?\n',
					type: 'integer',
					min: 1
				},
				{
					key: 'recipient',
					label: 'Empfänger',
					prompt: 'An wen möchtest du Bits versenden?\n',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		app.services.brg.getCommunityUserCoins(msg.author.id)
			.then(function(response) {
				let bits = args.bits;
				let recipient = args.recipient;

				if (response.data.result.coins < bits) {
					return msg.reply('Du kannst nur so viele Bits versenden wie du besitzt');
				}

				if (msg.author.id === recipient.user.id) {
					return msg.reply('Warum sollte ich deine Bits an dich selbst überweisen?');
				}

				app.services.brg.removeCommunityUserCoins(msg.author.tag, msg.author.id, coins)
					.then((response) => {
						if (response.data.status === 'success') {
							app.services.brg.addCommunityUserCoins(recipient.user.tag, recipient.user.id, coins)
								.catch((error) => {
									logger.error(error);
									return msg.reply('Entschuldige, ich konnte deine Bits nicht an ' + recipient + ' auszahlen');
								});
						} else {
							return msg.reply('Entschuldige, ich konnte nichts von deinen Bits nehmen...');
						}
					})
					.catch((error) => {
						logger.error(error);
						return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
					});

				msg.channel.send(bits + ' Bit :moneybag: an ' + recipient + ' gezahlt');

				let richEmbed = { embed: {
					color: 6360082,
					title: '**Dein aktueller Kontostand**\n\n',
					description: ':moneybag: ' + (response.data.result.coins - bits) + ' Bits'
				}};

				return msg.channel.send('', richEmbed);
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
