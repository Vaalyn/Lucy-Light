let moment = require('moment');
let http   = require('http');
let fs     = require('fs');

module.exports = class StreamRecording {
	constructor(logger) {
		this.logger = logger;

		this.recorder = {
			stream: this._initializeRecorder('stream', 8000),
			daydj: this._initializeRecorder('daydj', 8006)
		};
	}

	start(mountpoint = 'stream') {
		let self = this;

		return new Promise(function(resolve, reject) {
			if (!self._isValidMountpoint(mountpoint)) {
				return reject('Ungülter Stream');
			}

			if (self.recorder[mountpoint].isRecording) {
				return reject('Aufnahme läuft bereits');
			}

			self.recorder[mountpoint].isRecording = true;
			self.recorder[mountpoint].fileName    = __dirname + '/../../../recording/' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.mp3';

			self.recorder[mountpoint].ripper = http.get(self.recorder[mountpoint].streamUrl, (response) => {
				if (response.statusCode != 200) {
					self.logger.error('Stream Error Code: ' + response.statusCode)
					return reject('Stream Error Code: ' + response.statusCode)
				}

				response.on('data', (chunk) => {
					fs.appendFile(self.recorder[mountpoint].fileName, chunk, (error) => {
						if (error) {
							self.logger.error(error);
							return reject(error)
						}
					})
				})
			})

			return resolve(mountpoint)
		});
	}

	stop (mountpoint = 'stream') {
		let self = this;

		return new Promise((resolve, reject) => {
			if (!self._isValidMountpoint(mountpoint)) {
				return reject('Ungülter Stream');
			}

			if (!self.recorder[mountpoint].isRecording) {
				return reject('Es läuft keine Aufnahme');
			}

			self.recorder[mountpoint].ripper.abort();
			self.recorder[mountpoint].isRecording = false;
			self.recorder[mountpoint].fileName    = '';

			return resolve()
		})
	}

	_initializeRecorder(mountpoint, port) {
		return {
			isRecording: false,
			fileName: '',
			streamUrl: `http://radio.bronyradiogermany.com:${port}/${mountpoint}`
		};
	}

	_isValidMountpoint(mountpoint) {
		return this.recorder[mountpoint] !== undefined;
	}
}
