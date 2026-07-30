const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const WebSocket = require("ws");
const dotenv = require("dotenv");
dotenv.config({
  path: "/root/studionimbus-web/public/Projects/pf2e-overlay/.env"
});

const TOKEN = process.env.PF2E_BOT_TOKEN;
const COMMAND_CHANNEL_ID = "1532404346266849400";

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
    console.log("WebSocket client connected");
});

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

// ==========================================
// Discord command listener (updated)
// ==========================================
client.on("messageCreate", async (message) => {
    // Ignore bots and messages not in the designated channel
    if (message.author.bot) return;
    if (message.channel.id !== COMMAND_CHANNEL_ID) return;
    
    const content = message.content.trim();
    if (!content.startsWith("/")) return; // Only commands
    
    const parts = content.split(/\s+/);
    const cmd = parts[0].toLowerCase().slice(1); // remove leading "/"
    const args = parts.slice(1);
    
    // ---- /help ----
    if (cmd === 'help' || cmd === 'h') {
        const helpMessage = `
**📖 Available Commands**  
\`/<help/h>\` – Show this help message

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

**NPC & Effects**  
\`/<npc/n> <npc>\` – Show NPC (e.g. \`/npc mira\`)  
\`/<npc/n> clear\` – Hide NPC  
\`/<effect/e> <id> [duration]\` – Trigger one effect  
\`/<effects/ef> <list>\` – Trigger multiple effects (comma separated)  
\`/<effects/ef> clear\` – Clear all active effects  

**Animations**  
\`/<animation/a> <name> <character>\` – Play an animation  
Available: \`shake\`, \`bounce\`, \`spin\`, \`glow\`, \`jump\`  

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
Available animations: \`shake\`, \`bounce\`, \`spin\`, \`glow\`, \`jump\`
                `;
                break;
            case 'effects':
            case 'e':
                // Build list from your client-side effects array (mirror it on server or send from client)
                // We'll just send a placeholder; the client will also list them on console.
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
                `;
                break;
            default:
                reply = 'Unknown list type. Use: `animations`, `effects`, `aliases`';
        }
        await message.reply(reply);
        return;
    }

    // ---- Broadcast all other commands to WebSocket clients ----
    console.log(`Broadcasting command: ${content} from ${message.author.tag}`);
    broadcast({
        type: "command",
        command: content
    });
});

client.login(TOKEN);