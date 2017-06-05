let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let moment  = require('moment');
let logger  = app.logger;

module.exports = class ShowCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'show',
			aliases: ['show'],
			group: 'everyone',
			memberName: 'show',
			description: 'Zeigt die nächste Sendung an',
			throttling: {
				usages: 3,
				duration: 60
			}
		});
	}

	async run(msg, args) {
		app.services.google.calendar.getNextShow()
			.then(function(response) {
				var nextShow = response;
				var message  = '';

				if (nextShow === undefined) {
					message += 'Derzeit ist keine Sendung geplant. :lucy_oO:'
					return msg.reply(message);
				}

				message += '\nNächste Sendung:\n**' + nextShow.summary + '**\nvon ' + moment(nextShow.start.dateTime).format('dd D. MMMM HH:mm') + ' bis ' + moment(nextShow.end.dateTime).format('dd D. MMMM HH:mm') + ' \n'

				message += '```' + nextShow.description + '```'

				return msg.reply(message);
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
