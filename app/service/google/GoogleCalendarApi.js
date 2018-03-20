let app    = require('../../../index.js');
let axios  = require('axios');
let moment = require('moment');
let logger = app.logger;

module.exports = class GoogleCalendarApi {
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;
	}

	getNextShow() {
		let self = this;

		return new Promise(function(resolve, reject) {
			axios.get('https://www.googleapis.com/calendar/v3/calendars/' + self.config.google.calendarId + '/events?orderBy=startTime&maxResults=5&singleEvents=true&timeMin=' + moment().add(15, 'minutes').toISOString() + '&key=' + self.config.google.apiKey)
				.then((response) => {
					var nextShow;
					let shows = response.data.items;

					if (shows.length === 0) {
						resolve(nextShow);
						return;
					}

					nextShow = self.sortGoogleCalenderItems(shows)[0];

					resolve(nextShow);
				})
				.catch((error) => {
					console.log(error);
					self.logger.error(error);
					reject(error);
				})
		});
	}

	sortGoogleCalenderItems (items) {
		return items.sort((a, b) => {
			var firstDate = new Date(a.start.dateTime)
			var secondDate = new Date(b.start.dateTime)

			if (firstDate < secondDate) {
				return -1
			} else if (firstDate > secondDate) {
				return 1
			} else {
				return 0
			}
		})
	}
}
