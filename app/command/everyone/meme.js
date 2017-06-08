let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let fs      = require('fs');
let path    = require('path');
let logger  = app.logger;

module.exports = class MemeCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'meme',
			group: 'everyone',
			memberName: 'meme',
			description: 'Postet ein Meme passend zur Person',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					key: 'meme',
					label: 'Person',
					prompt: 'Von/über wen möchtest du ein Meme sehen?\n',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		var message = 'Sorry, da fällt mir nichts zu ein...';
		let memes   = JSON.parse(fs.readFileSync(path.join(__dirname, '/meme/memes.json')));

		if (memes.hasOwnProperty(args.meme)) {
			message = memes[args.meme][Math.floor(Math.random()*memes[args.meme].length)];
		}
		else if (args.meme === 'random') {
			let memePersons = Object.keys(memes);
			let memePerson  = memePersons[Math.floor(Math.random()*memePersons.length)];
			let meme        = memes[memePerson][Math.floor(Math.random()*memes[memePerson].length)];
			message         = meme;
		}

		return msg.reply(message);
	}
};
