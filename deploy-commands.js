const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'weather',
    description: 'Get the weather information for a specified city',
    options: [
      {
        name: 'city',
        type: 3, // STRING
        description: 'The name of the city',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // Registering global commands
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
