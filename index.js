
Index.JS
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
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
 
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/javascript') && !contentType.includes('text/plain')) {
      const raw = await res.text();
      console.error('Réponse non-JSON reçue:', raw.slice(0, 300));
      throw new Error('Service de traduction indisponible (réponse invalide)');
    }
 
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
 
