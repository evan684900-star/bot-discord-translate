require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const { pipeline } = require('@xenova/transformers');
const { franc } = require('franc-min');

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

// Mapping code ISO 639-3 (franc) vers code court utilisé par les modèles
const langMap = { eng: 'en', fra: 'fr', spa: 'es', deu: 'de' };
const supported = ['en', 'fr', 'es', 'de'];

// Cache d'un seul modèle à la fois pour économiser la RAM
let currentModelKey = null;
let currentModel = null;

async function getModel(src, tgt) {
  const key = `${src}-${tgt}`;
  if (currentModelKey === key) return currentModel;

  console.log(`Chargement du modèle ${key}...`);
  currentModel = await pipeline('translation', `Xenova/opus-mt-${src}-${tgt}`);
  currentModelKey = key;
  return currentModel;
}

async function translateText(text, targetLang) {
  // Détection de la langue source
  const detected = franc(text);
  let sourceLang = langMap[detected] || 'en';

  if (sourceLang === targetLang) return text;

  // Traduction directe si possible, sinon on pivote par l'anglais
  if (sourceLang === 'en' || targetLang === 'en') {
    const model = await getModel(sourceLang, targetLang);
    const result = await model(text);
    return result[0].translation_text;
  } else {
    const toEnglish = await getModel(sourceLang, 'en');
    const intermediate = await toEnglish(text);
    const toTarget = await getModel('en', targetLang);
    const result = await toTarget(intermediate[0].translation_text);
    return result[0].translation_text;
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'translate') return;

  const targetLang = interaction.options.getString('to');
  const text = interaction.options.getString('message');

  await interaction.deferReply();

  try {
    const translated = await translateText(text, targetLang);

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