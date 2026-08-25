require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  if (message.content === '!ping') {
    message.reply('Pong !');
  }
});

client.login(process.env.DISCORD_TOKEN);

// Petit serveur HTTP pour que Koyeb sache que le bot est vivant
http.createServer((req, res) => res.end('Bot en ligne')).listen(process.env.PORT || 8000);