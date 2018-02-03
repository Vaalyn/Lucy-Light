let app    = require('../../../index.js');
let moment = require('moment');

module.exports = class BronyRadioGermanyNextShowListener {
	constructor(config, logger, google) {
		this.config = config;
		this.logger = logger;
		this.google = google;

		this.listenerInterval = null;
		this.lastAnnouncedShow = {
			id: '',
			status: 'soon'
		}
	}

	startListening() {
		let self = this;

		this.listenerInterval = setInterval(function() {
			self.google.calendar.getNextShow()
				.then(function(response) {
					var nextShow = response;
					var message  = '';

					if (nextShow === undefined) {
						return;
					}

					if (self.lastAnnouncedShow.id !== nextShow.id) {
						let announceAs = (moment(nextShow.start.dateTime).diff() > self.config.discord.announceNextShowTimeDifference) ? 'soon' : 'now';

						self.setLastAnnouncedShow(nextShow.id, announceAs);

						return app.client.registry.resolveCommand('show').run({reply: (response) => {
							self.logger.info(response);
						}});
					}

					if (self.lastAnnouncedShow.id === nextShow.id && self.lastAnnouncedShow.status === 'soon') {
						if (moment(nextShow.start.dateTime).diff() > self.config.discord.announceNextShowTimeDifference) {
							return;
						}

						self.setLastAnnouncedShow(nextShow.id, 'now');

						app.client.registry.resolveCommand('show').run({reply: (response) => {
							self.logger.info(response);
						}});
					}
				})
				.catch(function(error) {
					self.logger.error(error);
				});
		}, self.config.discord.updateNextShowInterval);
	}

	stopListening() {
		clearInterval(this.listenerInterval);
	}

	setLastAnnouncedShow(id, status) {
		this.lastAnnouncedShow = {
			id: id,
			status: status
		}
	}
}
