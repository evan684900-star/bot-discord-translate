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

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'translate') return;

  const targetLang = interaction.options.getString('to');
  const text = interaction.options.getString('message');

  await interaction.deferReply();

    try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    console.log('Google Translate response:', JSON.stringify(data));

    const translated = data[0].map(chunk => chunk[0]).join('');

    await interaction.editReply({
      embeds: [{
        color: 0x5865F2,
        fields: [
          { name: 'Original', value: text },
          { name: 'Translation', value: translated }
        ],
        footer: { text: `Translated by ${interaction.user.username}` }
      }]
    });
  } catch (err) {
    console.error(err);
    await interaction.editReply('❌ Translation failed. Please try again.');
  }
});

client.login(process.env.DISCORD_TOKEN);

http.createServer((req, res) => res.end('Bot en ligne')).listen(process.env.PORT || 8000);