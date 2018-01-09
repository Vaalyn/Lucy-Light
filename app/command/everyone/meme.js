let app     = require('../../../index.js');
let discord = require('discord.js-commando');
let fs      = require('fs');
let path    = require('path');
let logger  = app.logger;

module.exports = class MemeCommand extends discord.Command {
	constructor(client) {
		super(client, {
			name: 'meme',
			aliases: Object.keys(JSON.parse(fs.readFileSync(path.join(__dirname, '/meme/memes.json')))),
			group: 'everyone',
			memberName: 'meme',
			description: 'Postet ein Meme passend zur Person. Der Name der Person kann auch als Befehl verwendet werden.',
			throttling: {
				usages: 3,
				duration: 60
			},
			args: [
				{
					default: '',
					key: 'meme',
					label: 'Person',
					prompt: 'Von/über wen möchtest du ein Meme sehen?\n',
					type: 'string'
				}
			]
		});
	}

	createMemeRichEmbed(meme) {
		var richMeme = {
			color: app.config.discord.embed.color
		}

		if (meme.hasOwnProperty('author')) {
			richMeme.author = {
				name: meme.author.name,
				icon_url: meme.author.icon_url
			};
		}

		if (meme.hasOwnProperty('title')) {
			richMeme.title = meme.title;
		}

		if (meme.hasOwnProperty('description')) {
			richMeme.description = meme.description;
		}

		if (meme.hasOwnProperty('fields')) {
			richMeme.fields = [];
			meme.fields.forEach(function(field) {
				richMeme.fields.push({
					name: field.name,
					value: field.value
				});
			});
		}

		if (meme.hasOwnProperty('footer')) {
			richMeme.footer = {
				icon_url: meme.footer.icon_url,
				text: meme.footer.text
			};
		}

		switch (meme.type) {
			case 'image':
				richMeme.image = {
					url: meme.url
				};
				break;
			case 'link':
				richMeme.url = meme.url;
				break;
		}

		return richMeme;
	}

	async run(msg, args) {
		let meme;
		let message     = 'Sorry, da fällt mir nichts zu ein...\nWenn du den Befehl "!! help meme" verwendest, sag ich dir wen ich alles kenne.';
		let memes       = JSON.parse(fs.readFileSync(path.join(__dirname, '/meme/memes.json')));
		let memePersons = Object.keys(memes);
		let memePerson  = memePersons.find(function(memePerson) {
			return msg.content.startsWith('!! ' + memePerson);
		});

		if (memePerson !== undefined) {
			meme = memes[memePerson][Math.floor(Math.random()*memes[memePerson].length)];
		}
		else if (memes.hasOwnProperty(args.meme)) {
			meme    = memes[args.meme][Math.floor(Math.random()*memes[args.meme].length)];
			message = memes[args.meme][Math.floor(Math.random()*memes[args.meme].length)];
		}
		else if (args.meme === 'random') {
			let memePerson = memePersons[Math.floor(Math.random()*memePersons.length)];
			meme           = memes[memePerson][Math.floor(Math.random()*memes[memePerson].length)];
		}

		if (meme === undefined) {
			return msg.reply(message);
		}
		else if (meme.type === 'video') {
			return msg.reply(meme.url);
		}
		else {
			let richMeme = this.createMemeRichEmbed(meme);
			return msg.channel.send('', { embed: richMeme });
		}
	}
};
