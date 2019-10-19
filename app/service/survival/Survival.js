let app    = require('../../../index.js');
let axios  = require('axios');
let moment = require('moment');
let fs     = require('fs');
let logger = app.logger;

module.exports = class Survival {
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;

		this.rounds = [];

		this.loadRounds();
	}

	startSurvivalRound(roundName, codeword, attendanceDuration, registrationDuration, username) {
		let self = this;

		let round = {
			name: roundName,
			codeword: codeword,
			attendanceDuration: attendanceDuration,
			lastAttendanceCheck: moment().unix(),
			attendanceCheckRunning: false,
			username: username,
			registrationDuration: registrationDuration,
			startedAt: moment().unix(),
			stoppedAt: null,
			survivors: []
		}

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((existingRound) => {
				if (round.name === existingRound.name) {
					return reject('Es gibt bereits eine Survival Runde mit diesem Namen!');
				}
			});

			self.rounds.push(round);

			self.saveRounds()
				.then(() => {
					return resolve(`${username} hat eine Survival Runde gestartet!\nDie Anmeldung ist für \`${registrationDuration}\` Minuten möglich, benutze hierfür den Befehl \`!! survival-register ${codeword}\`\nDanach gibt es immer mal wieder Anwesenheitstests bei denen du dich mit dem folgenden Codewort melden musst: \`${codeword}\`.`);
				})
				.catch((error) => {
					return reject('Ich konnte die Survival Runde nicht starten.');
				});
		});
	}

	stopSurvivalRound(codeword) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					round.stoppedAt = moment().unix();

					self.saveRounds()
						.then(() => {
							return resolve('Die Survival Runde ist jetzt beendet.');
						})
						.catch((error) => {
							return reject('Ich konnte die Survival Runde nicht beenden.');
						});
				}
			});
		});
	}

	registerSurvivor(codeword, discordUserId, discordUsername) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					round.survivors.forEach((survivor) => {
						if (discordUserId === survivor.discordUserId) {
							return reject('Du bist bereits registriert!');
						}
					});

					let registrationEnd = round.startedAt + (round.registrationDuration * 60);

					if (registrationEnd < moment().unix()) {
						return reject('Die Anmeldung ist bereits geschlossen.');
					}

					let survivor = {
						discordUserId: discordUserId,
						discordUsername: discordUsername,
						registeredAt: moment().unix(),
						lastSurvivedAttendanceCheck: moment().unix(),
						attendanceChecks: [],
						pausedAt: moment.unix(0).unix()
					};

					round.survivors.push(survivor);

					return resolve(`Du hast dich für die Survival Runde \`${round.name}\` angemeldet.`);
				}
			})
		});

		return reject('Ich habe die Survival Runde nicht gefunden!');
	}

	addAttendanceCheck(codeword) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					let attendanceCheck = {
						startedAt: moment().unix(),
						stoppedAt: null,
						survived: false,
						paused: false
					};

					round.lastAttendanceCheck = moment().unix();
					round.attendanceCheckRunning = true;

					round.survivors.forEach((survivor) => {
						let timeSincePaused = (moment().unix() - survivor.pausedAt);

						if (timeSincePaused <= (60 * 30)) {
							attendanceCheck.survived = true;
							attendanceCheck.paused = true;
							survivor.lastSurvivedAttendanceCheck = round.lastAttendanceCheck;
						}

						survivor.attendanceChecks.push(attendanceCheck);
					});

					self.setupStopAttendanceCheckTimeout(round);

					self.saveRounds()
						.then(() => {
							return resolve(`Wer ist noch alles anwesend?.\nMelde dich innerhalb von \`${round.attendanceDuration}\` Minuten per PN bei mir um den Test zu überleben.\nBenutze den Befehl \`!! survival-check ${codeword}\` damit ich dich als anwesend notiere.`);
						})
						.catch((error) => {
							return reject(error);
						});
				}
			})
		});
	}

	stopAttendanceCheck(codeword) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					if (round.stoppedAt !== null) {
						return reject(`Die Runde für das Codewort \`${codeword}\` ist bereits vorbei!`);
					}

					round.attendanceCheckRunning = false;

					round.survivors.forEach((survivor) => {
						survivor.attendanceChecks.forEach((attendanceCheck) => {
							if (attendanceCheck.stoppedAt === null) {
								attendanceCheck.stoppedAt = moment().unix();
							}
						});
					});

					return resolve(`Der aktuelle Anwesenheitstest für das Codewort \`${codeword}\` ist beendet!`);
				}
			});

			return reject(`Ich habe keinen laufender Anwesenheitstest zu dem Codewort \`${codeword}\` gefunden!`);
		});
	}

	registerAttendance(codeword, discordUserId) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					if (round.stoppedAt !== null) {
						return reject(`Die Runde für das Codewort \`${codeword}\` ist bereits vorbei!`);
					}

					round.survivors.forEach((survivor) => {
						if (discordUserId === survivor.discordUserId) {
							survivor.attendanceChecks.forEach((attendanceCheck) => {
								if (attendanceCheck.stoppedAt === null) {
									attendanceCheck.survived = true;
									survivor.lastSurvivedAttendanceCheck = round.lastAttendanceCheck;

									return resolve('Du hast den Anwesenheitstest bestanden!');
								}
							});
						}
					});
				}
			});

			return reject(`Ich habe keinen aktiven Anwesenheitstest zu dem Codwort \`${codeword}\` gefunden bei dem du angemeldet bist!`);
		});
	}

	pauseSurvivor(codeword, discordUserId, cheat = false) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword.toLowerCase() === round.codeword.toLowerCase()) {
					if (round.stoppedAt !== null) {
						return reject(`Die Runde für das Codewort \`${codeword}\` ist bereits vorbei!`);
					}

					round.survivors.forEach((survivor) => {
						if (discordUserId === survivor.discordUserId) {
							if (cheat === true) {
								survivor.pausedAt = Number.MAX_SAFE_INTEGER;

								return resolve(`Du bist jetzt für die Runde \`${round.name}\` dauerhaft pausiert und musst in dieser Zeit bei keinem Anwesenheitstest mit machen.`);
							}
							else {
								survivor.pausedAt = moment().unix();

								return resolve(`Du bist jetzt 30 Minuten lang für die Runde \`${round.name}\` pausiert und musst in dieser Zeit bei keinem Anwesenheitstest mit machen.`);
							}
						}
					});
				}
			});

			return reject(`Ich habe keine aktive Runde zu dem Codwort \`${codeword}\` gefunden bei der du angemeldet bist!`);
		});
	}

	saveRounds() {
		let self = this;

		let roundsJson = JSON.stringify(self.rounds, null, 4);

		let filename = __dirname + '/../../../survival-rounds.json';

		return new Promise(function(resolve, reject) {
			fs.writeFile(filename, roundsJson, (error) => {
				if (error) {
					self.logger.error(error);
					return reject(error);
				}

				return resolve();
			});
		});
	}

	loadRounds() {
		let self = this;

		let filename = __dirname + '/../../../survival-rounds.json';

		try {
			let roundsJson = fs.readFileSync(filename);

			self.rounds = JSON.parse(roundsJson);

			self.rounds.forEach((round) => {
				if (round.attendanceCheckRunning === true) {
					self.setupStopAttendanceCheckTimeout(round);
				}
			});
		}
		catch (error) {
			self.logger.error(error);
		}
	}

	setupStopAttendanceCheckTimeout(round, timeoutMiliseconds = null) {
		let self = this;

		if (timeoutMiliseconds === null) {
			timeoutMiliseconds = (round.attendanceDuration * 60 * 1000);
		}

		setTimeout(() => {
			self.stopAttendanceCheck(round.codeword)
				.then((message) => {
					app.client.channels.find((channel) => {return channel.id === self.config.discord.channelId;})
						.send(message)
							.then((messageSent) => {
								self.logger.info(`Send Message: ${messageSent}`);
							})
							.catch((error) => {
								self.logger.error(error);
							});

					self.saveRounds()
						.then(() => {})
						.catch((error) => {
							self.logger.error(error);
						});
				})
				.catch((error) => {
					self.logger.error(error);
				});
		}, timeoutMiliseconds);
	}

	listSurvivors(codeword) {
		let self = this;

		return new Promise(function(resolve, reject) {
			self.rounds.forEach((round) => {
				if (codeword === round.codeword) {
					let survivors = round.survivors.filter((survivor) => {
						if (survivor.lastSurvivedAttendanceCheck >= round.lastAttendanceCheck) {
							return true;
						}

						return false;
					}).map((survivor) => {
						return `${survivor.discordUsername}`;
					});

					return resolve(survivors);
				}
			});

			return reject(`Ich habe keine Runde für das Codewort \`${codeword}\` gefunden!`);
		});
	}
}
