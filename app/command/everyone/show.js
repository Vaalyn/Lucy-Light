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

				if (nextShow === undefined) {
					let message = 'Derzeit ist keine Sendung geplant. :lucy_oO:'
					return msg.reply(message);
				}

				let richEmbed = { embed: {
					color: 6360082,
					title: '🎵  **' + nextShow.summary.toUpperCase() + '**\n\n',
					description: moment().to(nextShow.start.dateTime),
					fields: [
						{
							name: 'Anfang:',
							value: moment(nextShow.start.dateTime).format('dd D. MMMM HH:mm')
						},
						{
							name: 'Ende:',
							value: moment(nextShow.end.dateTime).format('dd D. MMMM HH:mm')
						},
						{
							name: 'Beschreibung:',
							value: '```' + nextShow.description + '```'
						}
					]
				}};

				if (msg.channel !== undefined) {
					return msg.channel.send("", richEmbed);
				}
				else {
					app.client.channels.find((channel) => {return channel.id === app.config.discord.channelId;})
						.send("", richEmbed)
						.then((message) => {})
						.catch((error) => {
							logger.error(error);
						});
				}
			})
			.catch(function(error) {
				logger.error(error);
				return msg.reply('Sorry, es gab einen Fehler beim ausführen des Befehls.\nhttps://derpicdn.net/img/2012/6/20/10898/full.gif');
			});
	}
};
