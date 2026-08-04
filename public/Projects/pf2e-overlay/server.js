const { Client, GatewayIntentBits, ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, VoiceConnectionStatus } = require("@discordjs/voice");
const WebSocket = require("ws");
const dotenv = require("dotenv");
dotenv.config({
  path: "/root/studionimbus-web/public/Projects/pf2e-overlay/.env"
});

const TOKEN = process.env.PF2E_BOT_TOKEN;
const COMMAND_CHANNEL_ID = "1532404346266849400";
const VOICE_CHANNEL_ID = "1496296627617534106";

process.on('unhandledRejection', (reason) => console.error('❌ Unhandled Rejection:', reason));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
    console.log("🔗 WebSocket client connected");
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === "command") {
                broadcast({ type: "command", command: data.command });
            }
        } catch (err) {
            console.error("❌ WebSocket parse error:", err);
        }
    });
    ws.on("close", () => console.log("🔌 WebSocket client disconnected"));
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Track speaking debounce and guild readiness
const speakingTimeouts = new Map();
const guildReady = new Map(); // guildId -> boolean (true when voice connection is ready)

// ---------- Join function ----------
function joinVoiceAndSetup(guild, channel) {
    if (channel.id !== VOICE_CHANNEL_ID) return;

    const me = guild.members.me;
    if (!me.permissionsIn(channel).has("Connect")) {
        console.error(`❌ No "Connect" permission for ${channel.name}`);
        return;
    }

    // If already connected, do nothing
    if (getVoiceConnection(guild.id)) {
        console.log(`ℹ️ Already connected to voice, skipping.`);
        return;
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
    });
    console.log(`🔊 Attempting to join ${channel.name}...`);

    const player = createAudioPlayer();
    connection.subscribe(player);

    // Mark as not ready until 'ready' fires
    guildReady.set(guild.id, false);

    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`✅ Bot joined ${channel.name}`);
        guildReady.set(guild.id, true);

        const receiver = connection.receiver;
        receiver.speaking.on("start", (userId) => {
            if (userId === client.user.id) return;
            if (speakingTimeouts.has(userId)) {
                clearTimeout(speakingTimeouts.get(userId));
                speakingTimeouts.delete(userId);
            }
            broadcast({ type: "speaking_start", userId });
        });

        receiver.speaking.on("end", (userId) => {
            if (userId === client.user.id) return;
            if (speakingTimeouts.has(userId)) return;
            const timeout = setTimeout(() => {
                broadcast({ type: "speaking_end", userId });
                speakingTimeouts.delete(userId);
            }, 200);
            speakingTimeouts.set(userId, timeout);
        });
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log(`🔌 Disconnected, attempting to reconnect...`);
        // The library will auto-reconnect; we just log.
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
        console.log(`❌ Voice connection destroyed.`);
        guildReady.delete(guild.id);
        speakingTimeouts.clear();
    });

    connection.on("error", (error) => {
        console.error(`❌ Voice error:`, error);
        // If error occurs, we rely on voiceStateUpdate to re-trigger.
    });

    return connection;
}

// ---------- Startup ----------
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    // Debug listing (optional)
    for (const guild of client.guilds.cache.values()) {
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice || c.type === 'GUILD_VOICE');
        for (const [id, channel] of voiceChannels) {
            const members = channel.members.map(m => m.user.tag).join(', ');
            console.log(`🎤 ${channel.name} (${id}) - Members: ${members || 'none'}`);
        }
    }

    // Auto-join if human in target channel
    for (const guild of client.guilds.cache.values()) {
        const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID);
        if (!voiceChannel) continue;
        const hasHuman = voiceChannel.members.some(m => !m.user.bot);
        if (hasHuman && !getVoiceConnection(guild.id)) {
            console.log(`🔊 Auto‑joining ${voiceChannel.name}`);
            joinVoiceAndSetup(guild, voiceChannel);
        }
    }
});

// ---------- Voice state updates ----------
client.on("voiceStateUpdate", async (oldState, newState) => {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const targetChannelId = VOICE_CHANNEL_ID;

    // 1. User joined the target channel (and is not a bot)
    if (newState.channelId === targetChannelId && !oldState.channelId && !newState.member.user.bot) {
        const channel = newState.channel;
        let connection = getVoiceConnection(guild.id);
        if (!connection) {
            console.log(`👤 User joined target channel, joining...`);
            joinVoiceAndSetup(guild, channel);
        } else {
            console.log(`ℹ️ Already connected, no action.`);
        }
    }

    // 2. Leave if the channel becomes empty (only after bot is ready)
    const connection = getVoiceConnection(guild.id);
    if (!connection) return;
    if (connection.joinConfig.channelId !== targetChannelId) return;

    // Only check if the bot is ready (to avoid destroying during connection)
    if (!guildReady.get(guild.id)) {
        console.log(`⏳ Bot not ready yet, skipping empty check.`);
        return;
    }

    const voiceChannel = guild.channels.cache.get(targetChannelId);
    if (!voiceChannel) return;

    // Wait 2 seconds before checking emptiness (allows for quick re-joins)
    setTimeout(() => {
        const conn = getVoiceConnection(guild.id);
        if (!conn) return;
        if (conn.joinConfig.channelId !== targetChannelId) return;

        // If connection is still connecting, don't destroy
        if (conn.state.status === VoiceConnectionStatus.Connecting) {
            console.log(`⏳ Still connecting, not leaving yet.`);
            return;
        }

        const humans = voiceChannel.members.filter(m => !m.user.bot);
        if (humans.size === 0) {
            console.log(`👋 Channel empty, leaving...`);
            conn.destroy();
            guildReady.delete(guild.id);
            speakingTimeouts.clear();
        } else {
            console.log(`👥 ${humans.size} human(s) still in channel, staying.`);
        }
    }, 2000);
});

// ---------- Discord command listener ----------
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== COMMAND_CHANNEL_ID) return;

    const content = message.content.trim();
    if (!content.startsWith("/")) return;

    const parts = content.split(/\s+/);
    const cmd = parts[0].toLowerCase().slice(1);
    const args = parts.slice(1);

    // ---- /voice - force join ----
    if (cmd === 'voice') {
        const guild = message.guild;
        if (!guild) return message.reply('Use in a server.');
        const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID);
        if (!voiceChannel) return message.reply('Channel not found.');
        const connection = getVoiceConnection(guild.id);
        if (connection) {
            return message.reply(`Already connected (status: ${connection.state.status})`);
        }
        joinVoiceAndSetup(guild, voiceChannel);
        return message.reply(`Attempting to join...`);
    }

    // ---- /help ----
    if (cmd === 'help' || cmd === 'h') {
        const helpMessage = `
**📖 Available Commands**  
\`/<help/h>\` – Show this help message
\`/join\` – Force the bot to join the configured voice channel

**General** 
\`/<chibi/c> <on/y>\` – Enable overlay  
\`/<chibi/c> <off/n>\` – Disable overlay  
\`/<chibi/c> <test/t>\` – Fill all slots with test chibis  
\`/<chibi/c> <testoff/to>\` – Clear test chibis  

**Chibi control**  
\`/<impersonate/i> <name>\` – Show chibi as if speaking  
\`/<pop/p> <name>\` – Remove chibi immediately  
\`/<flip/f> <name>\` – Toggle main image (crossfade)  
\`/<compflip/cf> <name>\` – Toggle companion image (crossfade)  
\`/<mute/m> <name/alloff/allon>\` – Mute chibi (chibi does not respond to voice)

**NPC & Effects**  
\`/<npc/n> <npc>\` – Show NPC (e.g. \`/npc mira\`)  
\`/<npc/n> clear\` – Hide NPC  
\`/<effect/e> <id> [duration]\` – Trigger one effect  
\`/<effects/ef> <list>\` – Trigger multiple effects (comma separated)  
\`/<effects/ef> clear\` – Clear all active effects  

**Animations**  
\`/<animation/a> <name> <character>\` – Play an animation  

**Lists**  
\`/<list/l> <animations/an>\` – Show all animation names  
\`/<list/l> <effects/e>\` – Show all effect IDs and groups  
\`/<list/l> <aliases/al>\` – Show character shortcuts  
        `;
        await message.reply(helpMessage);
        return;
    }

    // ---- /list ----
    if (cmd === 'list' || cmd === 'l') {
        if (args.length === 0) {
            await message.reply('Available lists: `animations`, `effects`, `aliases`');
            return;
        }
        const listType = args[0].toLowerCase();
        let reply = '';
        switch(listType) {
            case 'animations':
            case 'an':
                reply = `
Available animations: \`shake\`, \`bounce\`, \`spin\`, \`glow\`, \`jump\`, \`speak\`, \`attack-<left/right>\`
                `;
                break;
            case 'effects':
            case 'e':
                reply = `
Effects: 
    \`campu\`, \`campm\`, \`campl\`, \`campr\`, \`campd\` 
Groups: 
    \`camp\`
                `;
                break;
            case 'aliases':
            case 'al':
                reply = `
Character aliases: 
    \`u\`→Uri, 
    \`o\`→Oryn, 
    \`i\`→Ikyki, 
    \`a\`→Azzahd, 
    \`r\`→Rapha, 
    \`g\`→Gordak, 
    \`p\`→Pravish
NPC aliases: 
    \`m\`→Mira, 
    \`e\`→Elowen
    \`s\`→Sortin
    \`vsg\`→Voidsever Group
    \`w\`→Wolves
    \`bk\`→Basilisk
                `;
                break;
            default:
                reply = 'Unknown list type. Use: `animations`, `effects`, `aliases`';
        }
        await message.reply(reply);
        return;
    }

    // ---- Broadcast all other commands ----
    console.log(`Broadcasting command: ${content} from ${message.author.tag}`);
    broadcast({
        type: "command",
        command: content
    });
});

client.login(TOKEN);