// overlay.js
// PF2e Fantasy Overlay - Dynamic Player Cards & WebSocket Speaking Detection

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
    }
];

const DEFAULT_AVATAR = "https://via.placeholder.com/100x130?text=Hero";

// Render player cards into #player-bar
function renderPlayerCards() {
    const playerBar = document.getElementById("player-bar");
    if (!playerBar) return;

    // Remove any existing player cards to avoid duplication
    const existingPlayers = playerBar.querySelectorAll(".card.player");
    existingPlayers.forEach(card => card.remove());

    playersData.forEach(player => {
        const card = document.createElement("div");
        card.className = `card player ${player.cssClass}`;
        card.setAttribute("data-userid", player.userId);

        const img = document.createElement("img");
        img.src = player.avatar;
        img.alt = `${player.name} avatar`;
        img.onerror = () => { img.src = DEFAULT_AVATAR; };

        const infoDiv = document.createElement("div");
        infoDiv.className = "info";

        const nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.textContent = player.name;

        const hrLine = document.createElement("hr");
        const bloodDiv = document.createElement("div");
        bloodDiv.className = "blood";
        bloodDiv.textContent = player.bloodline;
        const skillDiv = document.createElement("div");
        skillDiv.className = "skill";
        skillDiv.textContent = player.classSkill;

        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(hrLine);
        infoDiv.appendChild(bloodDiv);
        infoDiv.appendChild(skillDiv);

        card.appendChild(img);
        card.appendChild(infoDiv);
        playerBar.appendChild(card);
    });

    console.log("✅ Fantasy player cards dynamically generated!");
}

// ========================
// 2. WEBSOCKET (SPEAKING DETECTION)
// ========================
let ws = null;

function initWebSocket() {
    const ws = new WebSocket(`wss://${window.location.host}/ws`);

    ws.onopen = () => console.log("🌙 PF2e Overlay connected to voice WebSocket");
    ws.onerror = (err) => console.warn("WebSocket error", err);
    ws.onclose = () => {
        console.log("WebSocket closed, reconnecting in 3s...");
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
            console.warn("WebSocket parse error", e);
        }
    };
}

// ========================
// 3. EXTRA FANTASY EFFECTS (AMBIENT GLINTS)
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

    // Subtle description border shimmer
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
// 4. INITIALIZE ON DOM READY
// ========================
function initialize() {
    renderPlayerCards();
    // Give a tiny delay to ensure cards are in DOM before WebSocket tries to target them
    setTimeout(initWebSocket, 100);
    addAmbientEffects();

    // Fix GM avatar fallback
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