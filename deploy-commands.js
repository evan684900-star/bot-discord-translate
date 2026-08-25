require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate a message into another language')
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'French', value: 'fr' },
          { name: 'Spanish', value: 'es' },
          { name: 'German', value: 'de' },
          { name: 'Italian', value: 'it' },
          { name: 'Portuguese', value: 'pt' },
          { name: 'Dutch', value: 'nl' },
          { name: 'Russian', value: 'ru' },
          { name: 'Japanese', value: 'ja' },
          { name: 'Korean', value: 'ko' },
          { name: 'Chinese', value: 'zh' },
          { name: 'Arabic', value: 'ar' },
          { name: 'Turkish', value: 'tr' },
          { name: 'Polish', value: 'pl' },
          { name: 'Swedish', value: 'sv' }
        ))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The text you want to translate')
        .setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Deploying slash command...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash command deployed successfully!');
  } catch (error) {
    console.error(error);
  }
})();