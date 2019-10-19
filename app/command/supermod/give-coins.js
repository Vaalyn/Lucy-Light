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
					type: 'integer'
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

	hasPermission(msg) {
		let response = false;

		if (msg.channel.type !== 'text') {
			return response;
		}

		let commandGroupRoles = app.config.discord.commandGroupRoles.find((role) => {
			return role.group === this.groupID;
		});

		commandGroupRoles.roles.forEach((role) => {
			if (msg.member._roles.includes(role)) {
				response = true;
			}
		});

		return response;
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
