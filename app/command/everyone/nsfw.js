let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;
let client  = app.client;

module.exports = class NsfwCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'nsfw',
			aliases: ['nsfw'],
			group: 'everyone',
			memberName: 'nsfw',
			description: 'Gibt dir die Berechtigung um den NSFW Channel sehen zu können',
			throttling: {
				usages: 1,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		let memberAlreadyHasRole = false;

		let guildMember = msg.member;
		if (guildMember === null) {
			guildMember = app.store.guild.members.get(msg.author.id);
		}

		guildMember.roles.forEach((role) => {
			if (role.id === app.config.discord.nsfwRoleId) {
				memberAlreadyHasRole = true;
			}
		});

		if (memberAlreadyHasRole) {
			return msg.reply('Du hast bereits die Berechtigung den NSFW Channel sehen zu können');
		}

		guildMember.addRole(app.config.discord.nsfwRoleId)
			.then(function(response) {
				return msg.reply('Du kannst jetzt den NSFW Channel sehen und betreten');
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
