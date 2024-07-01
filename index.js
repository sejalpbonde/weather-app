const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const weatherApiKey = process.env.WEATHER_API_KEY;

// Define the slash command
const commands = [
  {
    name: 'weather',
    description: 'Get the weather information for a specified city',
    options: [
      {
        name: 'city',
        type: 3, // STRING type
        description: 'The name of the city',
        required: true,
      },
    ],
  },
];

// Register the slash command globally
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId), // Registering global commands
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('WeatherBot is online!');
});

// Event listener for message-based commands (fallback)
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!weather')) {
    const args = message.content.split(' ');
    const city = args.slice(1).join(' ');

    if (!city) {
      message.channel.send('Please provide a city name.');
      return;
    }

    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
      const weatherData = response.data;

      const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

      const weatherInfo = `
        **Weather in ${weatherData.name}:**
        🌡️ Temperature: ${weatherData.main.temp}°C (Feels like ${weatherData.main.feels_like}°C)
        💧 Humidity: ${weatherData.main.humidity}%
        🌬️ Wind: ${weatherData.wind.speed} m/s at ${weatherData.wind.deg}°
        🌡️ Pressure: ${weatherData.main.pressure} hPa
        🌅 Sunrise: ${sunrise}
        🌇 Sunset: ${sunset}
        🌤️ Weather: ${weatherData.weather[0].description}
        👁️ Visibility: ${weatherData.visibility / 1000} km
      `;

      message.channel.send(weatherInfo);
    } catch (error) {
      console.error(error);
      message.channel.send('Could not fetch weather data. Please ensure the city name is correct.');
    }
  }
});

// Event listener for slash command interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'weather') {
    const city = options.getString('city');

    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
      const weatherData = response.data;

      const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

      const weatherInfo = `
        **Weather in ${weatherData.name}:**
        🌡️ Temperature: ${weatherData.main.temp}°C (Feels like ${weatherData.main.feels_like}°C)
        💧 Humidity: ${weatherData.main.humidity}%
        🌬️ Wind: ${weatherData.wind.speed} m/s at ${weatherData.wind.deg}°
        🌡️ Pressure: ${weatherData.main.pressure} hPa
        🌅 Sunrise: ${sunrise}
        🌇 Sunset: ${sunset}
        🌤️ Weather: ${weatherData.weather[0].description}
        👁️ Visibility: ${weatherData.visibility / 1000} km
      `;

      await interaction.reply(weatherInfo);
    } catch (error) {
      console.error(error);
      await interaction.reply('Could not fetch weather data. Please ensure the city name is correct.');
    }
  }
});

client.login(token);
