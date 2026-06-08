const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const WebSocket = require("ws");
const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.PF2E_BOT_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

const wss = new WebSocket.Server({ port: 8080 });

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Track active speaking timeouts (to debounce end events)
const speakingTimeouts = new Map();

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.member?.user?.bot) return;

    const isTrackedUser = (member) => !member.user.bot;

    // User joined a voice channel
    if (newState.channelId && !oldState.channelId && isTrackedUser(newState.member)) {
        const channel = newState.channel;
        const guild = channel.guild;

        let connection = getVoiceConnection(guild.id);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false   // important: we must hear audio to detect speaking
            });

            // Add a dummy player to keep connection alive (optional but recommended)
            const player = createAudioPlayer();
            connection.subscribe(player);

            connection.on("ready", () => {
                console.log(`Bot joined ${channel.name} in ${guild.name}`);
            });

            connection.on("disconnect", () => {
                console.log(`Bot disconnected from ${guild.name}`);
            });
        }

        // ✅ CORRECT WAY: listen to speaking events on the receiver
        const receiver = connection.receiver;

        // 'start' event – user starts speaking
        receiver.speaking.on("start", (userId) => {
            if (userId === client.user.id) return;
            // Clear any pending end timeout for this user
            if (speakingTimeouts.has(userId)) {
                clearTimeout(speakingTimeouts.get(userId));
                speakingTimeouts.delete(userId);
            }
            broadcast({ type: "speaking_start", userId });
        });

        // 'end' event – user stops speaking
        receiver.speaking.on("end", (userId) => {
            if (userId === client.user.id) return;
            // Debounce: if multiple end events fire rapidly, only send one after a short delay
            if (speakingTimeouts.has(userId)) return;
            const timeout = setTimeout(() => {
                broadcast({ type: "speaking_end", userId });
                speakingTimeouts.delete(userId);
            }, 200);
            speakingTimeouts.set(userId, timeout);
        });
    }
});

// Optional: leave voice channel when empty
client.on("voiceStateUpdate", (oldState, newState) => {
    const guild = newState.guild || oldState.guild;
    const connection = getVoiceConnection(guild.id);
    if (connection) {
        const botChannelId = connection.joinConfig.channelId;
        const voiceChannel = guild.channels.cache.get(botChannelId);
        if (voiceChannel) {
            const humanMembers = voiceChannel.members.filter(m => !m.user.bot);
            if (humanMembers.size === 0) {
                connection.destroy();
                console.log(`Left empty voice channel in ${guild.name}`);
                speakingTimeouts.clear();
            }
        }
    }
});

client.login(TOKEN);