let moment = require('moment');
let http   = require('http');
let fs     = require('fs');

module.exports = class StreamRecording {
	constructor(logger) {
		this.logger = logger;
		this.isRecording = false;
		this.fileName    = '';
	}

	start() {
		let self = this;

		return new Promise(function(resolve, reject) {
			if (self.isRecording) {
				return reject('Aufnahme läuft bereits');
			}

			self.isRecording = true;
			self.fileName    = __dirname + '/../../../recording/' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.mp3';

			self.ripper = http.get('http://radio.bronyradiogermany.com:8000/stream', (response) => {
				if (response.statusCode != 200) {
					self.logger.error('Stream Error Code: ' + response.statusCode)
					return reject('Stream Error Code: ' + response.statusCode)
				}

				response.on('data', (chunk) => {
					fs.appendFile(self.fileName, chunk, (error) => {
						if (error) {
							self.logger.error(error);
							return reject(error)
						}
					})
				})
			})

			return resolve()
		});
	}

	stop () {
		let self = this;

		return new Promise((resolve, reject) => {
			if (!self.isRecording) {
				reject('Es läuft keine Aufnahme');
			}

			self.ripper.abort();
			self.isRecording = false;
			self.fileName    = '';

			return resolve()
		})
	}
}
