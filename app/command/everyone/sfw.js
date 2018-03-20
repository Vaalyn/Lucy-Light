let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let logger  = app.logger;
let client  = app.client;

module.exports = class SfwCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'sfw',
			aliases: ['sfw'],
			group: 'everyone',
			memberName: 'sfw',
			description: 'Nimmt dir die Berechtigung den NSFW Channel zu sehen weg',
			throttling: {
				usages: 1,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		let memberHasRole = false;

		let guildMember = msg.member;
		if (guildMember === null) {
			guildMember = app.store.guild.members.get(msg.author.id);
		}

		guildMember.roles.forEach((role) => {
			if (role.id === app.config.discord.nsfwRoleId) {
				memberHasRole = true;
			}
		});

		if (!memberHasRole) {
			return msg.reply('Du hast die Berechtigung den NSFW Channel zu sehen nicht');
		}

		guildMember.removeRole(app.config.discord.nsfwRoleId)
			.then(function(response) {
				return msg.reply('Du kannst den NSFW Channel jetzt nicht mehr sehen');
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
