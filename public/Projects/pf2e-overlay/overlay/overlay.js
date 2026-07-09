// overlay.js - Fixed WebSocket Connection (via nginx proxy)
// ========================
// 1. PLAYER DATA (JS OBJECTS)
// ========================
const playersData = [
    {
        id: "uri",
        userId: "798680850958647307",
        name: "Uri",
        bloodline: "Yaksha Human",
        classSkill: "Champion",
        avatar: "../images/uri.png",
        cssClass: "uri"
    },
    {
        id: "oryn",
        userId: "389262794480025601",
        name: "Oryn",
        bloodline: "Skilled Human",
        classSkill: "Ranger",
        avatar: "../images/oryn.jpg",
        cssClass: "oryn"
    },
    {
        id: "ikyki",
        userId: "710641511154319393",
        name: "Ikyki",
        bloodline: "Poisonhide Tripkee",
        classSkill: "Alchemist",
        avatar: "../images/ikyki.png",
        cssClass: "ikyki"
    },
    {
        id: "azzahd",
        userId: "399287336937979905",
        name: "Azzahd",
        bloodline: "Dromaar Dragonet",
        classSkill: "Summoner",
        avatar: "../images/azzahd.png",
        cssClass: "azzahd"
    },
    {
        id: "rapha",
        userId: "601987485513547817",
        name: "Rapha",
        bloodline: "Anadi Human",
        classSkill: "Rogue",
        avatar: "../images/rapha.jpg",
        cssClass: "rapha"
    },
    {
        id: "gordak",
        userId: "223573302176645121",
        name: "Gordak",
        bloodline: "Hold-Scarred Orc",
        classSkill: "Barbarian",
        avatar: "../images/gordak.png",
        cssClass: "gordak"
    },
    {
        id: "pravish",
        userId: "653001503023562774",
        name: "Pravish",
        bloodline: "Hungerseed Vanara",
        classSkill: "Inventor",
        avatar: "../images/pravish.png",
        cssClass: "pravish"
    }
];

const DEFAULT_AVATAR = "../images/the-party.png";

// Render player cards into #player-bar
function renderPlayerCards() {
    const playerBar = document.getElementById("player-bar");
    if (!playerBar) return;

    const existingPlayers = playerBar.querySelectorAll(".card.player");
    existingPlayers.forEach(card => card.remove());

    playersData.forEach(player => {
        const card = document.createElement("div");
        card.className = `card player ${player.cssClass}`;
        card.setAttribute("data-userid", player.userId);

        // ---- name (top) ----
        const nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.textContent = player.name;

        // ---- image (middle) ----
        const img = document.createElement("img");
        img.src = player.avatar;
        img.alt = `${player.name} avatar`;
        img.onerror = () => { img.src = DEFAULT_AVATAR; };

        // ---- skill (bottom) ----
        const skillDiv = document.createElement("div");
        skillDiv.className = "skill";
        skillDiv.textContent = player.classSkill;

        // Wrap name and skill in an optional container? Not needed, just append.
        card.appendChild(nameDiv);
        card.appendChild(img);
        card.appendChild(skillDiv);

        playerBar.appendChild(card);
    });

    console.log("✅ Fantasy player cards dynamically generated (compact vertical layout)!");
}

// ========================
// 2. WEBSOCKET (FIXED - use nginx proxy path)
// ========================
let ws = null;

function initWebSocket() {
    // Use the secure WebSocket endpoint provided by nginx.
    // For HTTPS pages, this will be wss://studionimbus.dev/ws
    // For local HTTP testing, it falls back to ws://.../ws
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    console.log(`Attempting WebSocket connection to ${wsUrl}`);

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log("🌙 PF2e Overlay connected to voice WebSocket");
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        console.warn("Make sure the WebSocket server (server.js) is running and nginx is proxying /ws to port 8080.");
    };

    ws.onclose = (event) => {
        console.log(`WebSocket closed (code: ${event.code}). Reconnecting in 3s...`);
        setTimeout(initWebSocket, 3000);
    };

    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            const userId = msg.userId;
            if (!userId) return;

            const targetCard = document.querySelector(`.card[data-userid="${userId}"]`);
            if (!targetCard) return;

            if (msg.type === "speaking_start") {
                targetCard.classList.add("speaking");
            } else if (msg.type === "speaking_end") {
                targetCard.classList.remove("speaking");
            }
        } catch (e) {
            console.warn("WebSocket message parse error", e);
        }
    };
}

// ========================
// 3. EXTRA FANTASY EFFECTS
// ========================
function addAmbientEffects() {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
        setInterval(() => {
            const glint = document.createElement("div");
            glint.style.position = "absolute";
            glint.style.top = Math.random() * 80 + "%";
            glint.style.left = Math.random() * 80 + "%";
            glint.style.width = "40px";
            glint.style.height = "40px";
            glint.style.background = "radial-gradient(circle, rgba(255,220,140,0.5), transparent)";
            glint.style.borderRadius = "50%";
            glint.style.filter = "blur(8px)";
            glint.style.pointerEvents = "none";
            glint.style.opacity = "0";
            glint.style.transition = "opacity 2s ease-out";
            mainContent.appendChild(glint);
            requestAnimationFrame(() => { glint.style.opacity = "0.8"; });
            setTimeout(() => {
                glint.style.opacity = "0";
                setTimeout(() => glint.remove(), 2100);
            }, 400);
        }, 11000);
    }

    const desc = document.getElementById("description");
    if (desc) {
        setInterval(() => {
            desc.style.borderLeftColor = "#e7c17e";
            setTimeout(() => {
                if (desc) desc.style.borderLeftColor = "var(--rune-glow)";
            }, 300);
        }, 4000);
    }
}

// ========================
// 4. INITIALIZE
// ========================
function initialize() {
    renderPlayerCards();
    setTimeout(initWebSocket, 100);
    addAmbientEffects();

    const gmImg = document.querySelector(".card.gm img");
    if (gmImg && gmImg.src.includes("poor.png")) {
        gmImg.onerror = function() {
            this.src = "https://via.placeholder.com/180x180?text=Game+Master";
        };
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}