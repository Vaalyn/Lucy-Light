let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;

module.exports = class GiveCoinsCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'give-coins',
			aliases: [],
			group: 'supermod',
			memberName: 'give-coins',
			description: 'Gibt einer Person Coins',
			throttling: {
				usages: 6,
				duration: 60
			},
			args: [
				{
					key: 'bits',
					label: 'Bits',
					prompt: 'Wie viele Bits möchtest du erzeugen?\n',
					type: 'integer',
					min: 1
				},
				{
					key: 'recipient',
					label: 'Empfänger',
					prompt: 'Wem möchtest du Bits geben?\n',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		let bits = args.bits;
		let recipient = args.recipient;

		app.services.brg.addCommunityUserCoins(recipient.user.tag, recipient.user.id, bits)
			.catch((error) => {
				logger.error(error);
				return msg.reply('Entschuldige, ich konnte ' + recipient + ' die Bits nicht geben');
			});

		return msg.channel.send(bits + ' Bit :moneybag: an ' + recipient + ' gegeben');
	}
};
