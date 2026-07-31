// overlay.js - Full functionality including chibi overlay (FLIP sliding with container offsets)
// ==========================================================
// 1. PLAYER DATA (JS OBJECTS)
// ==========================================================
const GM_USER_ID = "670656351701303296";

const playersData = [
    {
        id: "uri",
        userId: "798680850958647307",
        name: "Uri",
        bloodline: "Yaksha Human",
        classSkill: "Champion",
        avatar: "../images/avatars/uri.png",
        cssClass: "uri",
        chibiImg: "../images/chibi/pcs/uri.png",
        companionImg: null,
        flipImg: null,
        flipped: false
    },
    {
        id: "oryn",
        userId: "389262794480025601",
        name: "Oryn",
        bloodline: "Skilled Human",
        classSkill: "Ranger",
        avatar: "../images/avatars/oryn.jpg",
        cssClass: "oryn",
        chibiImg: "../images/chibi/pcs/oryn.png",
        companionImg: "../images/chibi/companions/jack.png",
        flipImg: null,
        flipped: false
    },
    {
        id: "ikyki",
        userId: "710641511154319393",
        name: "Ikyki",
        bloodline: "Poisonhide Tripkee",
        classSkill: "Alchemist",
        avatar: "../images/avatars/ikyki.png",
        cssClass: "ikyki",
        chibiImg: "../images/chibi/pcs/ikyki.png",
        companionImg: null,
        flipImg: null,
        flipped: false
    },
    {
        id: "azzahd",
        userId: "399287336937979905",
        name: "Azzahd",
        bloodline: "Dromaar Dragonet",
        classSkill: "Summoner",
        avatar: "../images/avatars/azzahd.png",
        cssClass: "azzahd",
        chibiImg: "../images/chibi/pcs/azzahd.png",
        companionImg: "../images/chibi/companions/elowen.png",
        companionFlipImg: "../images/chibi/flips/elowen_rage.png",
        flipImg: null,
        flipped: false,
        companionFlipped: false
    },
    {
        id: "rapha",
        userId: "601987485513547817",
        name: "Rapha",
        bloodline: "Anadi Human",
        classSkill: "Rogue",
        avatar: "../images/avatars/rapha.jpg",
        cssClass: "rapha",
        chibiImg: "../images/chibi/pcs/rapha.png",
        companionImg: null,
        flipImg: null,
        flipped: false
    },
    {
        id: "gordak",
        userId: "223573302176645121",
        name: "Gordak",
        bloodline: "Hold-Scarred Orc",
        classSkill: "Barbarian",
        avatar: "../images/avatars/gordak.png",
        cssClass: "gordak",
        chibiImg: "../images/chibi/pcs/gordak.png",
        companionImg: null,
        flipImg: "../images/chibi/flips/gordak_rage.png",
        flipped: false
    },
    {
        id: "pravish",
        userId: "653001503023562774",
        name: "Pravish",
        bloodline: "Hungerseed Vanara",
        classSkill: "Inventor",
        avatar: "../images/avatars/pravish.png",
        cssClass: "pravish",
        chibiImg: "../images/chibi/pcs/pravish.png",
        companionImg: "../images/chibi/companions/pravish_construct.png",
        flipImg: "../images/chibi/flips/pravish_unleashed.png",
        flipped: false
    }
];

const DEFAULT_AVATAR = "../images/the-party.png";
const GM_CHIBI_IMG = "../images/chibi/gm.png";
const GM_COMPANION_IMG = null;

// NPC definitions
const npcs = [
    { id: "mira", name: "Mira", image: "../images/chibi/npcs/mira.png", aliases: ["m"] },
    { id: "elowen", name: "Elowen", image: "../images/chibi/companions/elowen.png", aliases: ["e"] },
    { id: "sortin", name: "Sortin", image: "../images/chibi/npcs/sortin.png", aliases: ["s"] },
    { id: "voidsever-group", name: "Voidsever Group", image: "../images/chibi/enemies/voidsever_group.png", aliases: ["vsg"] },
    { id: "wolves", name: "Wolves", image: "../images/chibi/enemies/wolves.png", aliases: ["ws"] },
    { id: "basilisk", name: "Basilisk", image: "../images/chibi/enemies/basilisk.png", aliases: ["bk"] },
    { id: "enemy", name: "Enemy", image: "../images/chibi/enemies/enemy.png", aliases: ["nme"] },
];

// Effect definitions
const effects = [
    { id: "campu", group: "camp", image: "../images/chibi/effects/chibi-campfire.png", slot: "under", duration: 10 },
    { id: "campm", group: "camp", image: "../images/chibi/effects/chibi-campfire.png", slot: "main", duration: 3 },
    { id: "campl", group: "camp", image: "../images/chibi/effects/chibi-campfire.png", slot: "left", duration: 3 },
    { id: "campr", group: "camp", image: "../images/chibi/effects/chibi-campfire.png", slot: "right", duration: 3 },
    { id: "campd", multiple: true, effects: [
        {id: 'campl', duration: 3},
        {id: 'campr', duration: 4}
    ] },
    { id: "critf", image: "../images/chibi/effects/critical-fail.png", slot: "under", duration: 3 },
    { id: "crits", image: "../images/chibi/effects/critical-success.png", slot: "under", duration: 3 },
    { id: "downed", image: "../images/chibi/effects/downed.png", slot: "main", duration: 3 },
];

// Character aliases
const charAliases = {
    "g": "gordak",
    "a": "azzahd",
    "p": "pravish",
    "o": "oryn",
    "i": "ikyki",
    "r": "rapha",
    "u": "uri"
};

// ==========================================================
// 2. STATE FOR CHIBI OVERLAY
// ==========================================================
let overlayEnabled = true;
let chibiItems = {};
let gmTimeout = null;
let gmRemovalTimer = null; 
let activeNPC = null;
let activeEffects = {};

// Slot IDs – these match the actual HTML element IDs
const leftSlots = ['player-1', 'player-3', 'player-5', 'player-7'];
const rightSlots = ['player-2', 'player-4', 'player-6'];
const effectSlotMap = {
    'left': 'chibi-over-effect-left',
    'right': 'chibi-over-effect-right',
    'main': 'chibi-slot-effect',
    'under': 'chibi-under-bar'
};
// All slots for position computation – use the actual element IDs
const allSlotIds = [
    ...leftSlots.map(s => `chibi-slot-${s}`),
    ...rightSlots.map(s => `chibi-slot-${s}`),
    'chibi-slot-gm',
    'chibi-slot-npc',
    'chibi-over-effect-left',
    'chibi-over-effect-right',
    'chibi-slot-effect',
    'chibi-under-bar'
];

let leftOccupants = [null, null, null, null];
let rightOccupants = [null, null, null];
let slotOccupancy = {};

// For staggering moves
let reflowTimers = { left: [], right: [] };

// ==========================================================
// 3. RENDER PLAYER CARDS (unchanged)
// ==========================================================
function renderPlayerCards() {
    const playerBar = document.getElementById("player-bar");
    if (!playerBar) return;

    const existingPlayers = playerBar.querySelectorAll(".card.player");
    existingPlayers.forEach(card => card.remove());

    playersData.forEach(player => {
        const card = document.createElement("div");
        card.className = `card player ${player.cssClass}`;
        card.setAttribute("data-userid", player.userId);

        const nameDiv = document.createElement("div");
        nameDiv.className = "name";
        nameDiv.textContent = player.name;

        const img = document.createElement("img");
        img.src = player.avatar;
        img.alt = `${player.name} avatar`;
        img.onerror = () => { img.src = DEFAULT_AVATAR; };

        const skillDiv = document.createElement("div");
        skillDiv.className = "skill";
        skillDiv.textContent = player.classSkill;

        card.appendChild(nameDiv);
        card.appendChild(img);
        card.appendChild(skillDiv);

        playerBar.appendChild(card);
    });

    console.log("✅ Fantasy player cards dynamically generated (compact vertical layout)!");
}

// ==========================================================
// 4. WEBSOCKET (extended)
// ==========================================================
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

            if (userId) {
                const targetCard = document.querySelector(`.card[data-userid="${userId}"]`);
                if (targetCard) {
                    if (msg.type === "speaking_start") {
                        targetCard.classList.add("speaking");
                    } else if (msg.type === "speaking_end") {
                        targetCard.classList.remove("speaking");
                    }
                }
            }

            if (!overlayEnabled && (msg.type !== "command")) return;

            if (msg.type === "speaking_start") {
                handleSpeakingStart(userId);
            } else if (msg.type === "speaking_end") {
                handleSpeakingEnd(userId);
            } else if (msg.type === "command") {
                handleCommand(msg.command);
            }
        } catch (e) {
            console.warn("WebSocket message parse error", e);
        }
    };
}

// ==========================================================
// 5. CHIBI LOGIC (container offsets + FLIP sliding)
// ==========================================================

// --- Randomize container offsets (your original function) ---
function repositionContainer(slotId, container) {
    const containerDefaults = {
        1: {fromTop: -20, fromSide: 0},
        2: {fromTop: 20, fromSide: 0},
        3: {fromTop: 120, fromSide: 50},
        4: {fromTop: 130, fromSide: 250},
        5: {fromTop: 170, fromSide: 315},
        6: {fromTop: 150, fromSide: 300},
        7: {fromTop: 0, fromSide: 370},
    };

    const slot = Number(slotId.replace("player-", ""));
    const defaults = containerDefaults[slot] || {fromTop: 0, fromSide: 0};
    // Ensure container is positioned relative for offset
    container.style.position = "relative";
    const randomTopOffset = Math.floor(Math.random() * 30) - 15; // ±15px
    const randomSideOffset = Math.floor(Math.random() * 30) - 15; // ±15px
    container.style.top = defaults.fromTop + randomTopOffset + "px";
    if (slot === 1 || slot === 3 || slot === 5 || slot === 7) {
        container.style.left = defaults.fromSide + randomSideOffset + "px";
        container.style.right = "auto";
    } else {
        container.style.right = defaults.fromSide + randomSideOffset + "px";
        container.style.left = "auto";
    }
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
}

// --- Get center of an element (relative to viewport) ---
function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// --- Create chibi element (no absolute positioning) ---
function createChibiElement(userId, slotId, isGM = false, isNPC = false) {
    const container = document.getElementById('chibi-slot-' + slotId);
    if (!container) return null;
    if (!isGM && !isNPC) {
        repositionContainer(slotId, container);
    } else {
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.style.position = "relative";
    }
    const div = document.createElement('div');
    div.className = 'chibi-item';
    if (isGM) div.classList.add('gm-slot');
    if (isNPC) div.classList.add('npc-slot');
    div.dataset.userId = userId;
    div.dataset.slotId = slotId;

    div.style.transform = 'translate(0, 0)';
    div.style.transition = 'transform 0.4s ease, opacity 0.3s ease';

    const img = document.createElement('img');
    div.appendChild(img);
    const compDiv = document.createElement('div');
    compDiv.className = 'companion';
    const compImg = document.createElement('img');
    compDiv.appendChild(compImg);
    div.appendChild(compDiv);

    container.appendChild(div);
    return div;
}

// --- Helper: apply translate to chibi (with optional transition) ---
function setChibiTranslate(element, dx, dy, animate = true) {
    if (!animate) {
        element.style.transition = 'none';
    }
    element.style.transform = `translate(${dx}px, ${dy}px)`;
    if (!animate) {
        void element.offsetHeight;
        element.style.transition = '';
    }
}

// --- Move a chibi to a new slot with FLIP animation ---
function moveChibiToSlot(item, newSlotId, animate = true) {
    const element = item.element;
    const oldContainer = element.parentNode;
    const newContainer = document.getElementById('chibi-slot-' + newSlotId);
    if (!newContainer || oldContainer === newContainer) return;

    // 1. Capture old position
    const oldCenter = getCenter(element);

    // 2. Move element to new container (this will place it at new container's center)
    //    but the container may not have flex set, ensure it does
    if (!newContainer.style.display || newContainer.style.display === '') {
        newContainer.style.display = 'flex';
        newContainer.style.justifyContent = 'center';
        newContainer.style.alignItems = 'center';
        newContainer.style.position = 'relative';
    }
    newContainer.appendChild(element);

    // 3. Capture new position (after layout)
    //    We need to measure after the move, but before any transition
    //    Force a reflow
    void element.offsetHeight;
    const newCenter = getCenter(element);

    // 4. Compute delta (old - new) -> translate to move back to old position
    const dx = oldCenter.x - newCenter.x;
    const dy = oldCenter.y - newCenter.y;

    // 5. Set translate to snap back (no transition)
    setChibiTranslate(element, dx, dy, false);

    // 6. After a frame, remove translate with transition to slide
    requestAnimationFrame(() => {
        // For staggering, we may want to delay, but the caller uses setTimeout
        if (animate) {
            setChibiTranslate(element, 0, 0, true);
        } else {
            setChibiTranslate(element, 0, 0, false);
        }
    });
}

// --- Update chibi appearance (unchanged) ---
function updateChibiAppearance(userId, element, slotId) {
    const player = playersData.find(p => p.userId === userId);
    if (!player) return;

    const img = element.querySelector('img');
    const compDiv = element.querySelector('.companion');
    const compImg = compDiv.querySelector('img');

    let imgSrc = player.chibiImg;
    if (player.flipped && player.flipImg) {
        imgSrc = player.flipImg;
    }
    img.src = imgSrc;
    img.alt = player.name;

    if (player.companionImg) {
        if (player.companionFlipped && player.companionFlipImg) {
            compImg.src = player.companionFlipImg;
        } else {
            compImg.src = player.companionImg;
        }
        compDiv.classList.add('show');
    } else {
        compDiv.classList.remove('show');
    }

    const isRight = rightSlots.includes(slotId);
    element.classList.toggle('mirrored', isRight);
    compDiv.classList.toggle('mirrored', isRight);
}

// --- UPDATED: flip with crossfade (always animates) ---
function flipChibiImage(userId, isCompanion = false) {
    const item = chibiItems[userId];
    if (!item) {
        console.warn(`No chibi found for user ${userId}`);
        return;
    }
    const player = playersData.find(p => p.userId === userId);
    if (!player) return;

    const element = item.element;
    let targetImg;
    let newSrc;

    if (isCompanion) {
        if (!player.companionImg) {
            console.warn(`No companion for ${player.name}`);
            return;
        }
        const compDiv = element.querySelector('.companion');
        targetImg = compDiv.querySelector('img');
        // Toggle companion flip
        player.companionFlipped = !player.companionFlipped;
        newSrc = player.companionFlipped ? (player.companionFlipImg || player.companionImg) : player.companionImg;
    } else {
        // Toggle player flip
        player.flipped = !player.flipped;
        // If no flip image, fallback to normal (but we still toggle state for consistency)
        newSrc = player.flipped ? (player.flipImg || player.chibiImg) : player.chibiImg;
        targetImg = element.querySelector('img');
    }

    if (!targetImg) return;

    // Crossfade: fade out, swap, fade in
    targetImg.style.transition = 'opacity 0.3s ease';
    targetImg.style.opacity = '0';

    setTimeout(() => {
        targetImg.src = newSrc;
        // Force reflow
        void targetImg.offsetHeight;
        targetImg.style.opacity = '1';
        // Remove transition after animation to avoid interfering
        setTimeout(() => {
            targetImg.style.transition = '';
        }, 300);
    }, 300);
}

// --- Update GM chibi ---
function updateGMChibi(element) {
    const img = element.querySelector('img');
    img.src = GM_CHIBI_IMG;
    img.alt = 'Game Master';
    const compDiv = element.querySelector('.companion');
    if (GM_COMPANION_IMG) {
        compDiv.querySelector('img').src = GM_COMPANION_IMG;
        compDiv.classList.add('show');
    } else {
        compDiv.classList.remove('show');
    }
    element.classList.remove('mirrored');
}

// --- Update NPC chibi ---
function updateNPCChibi(element, npcId) {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;
    const img = element.querySelector('img');
    img.src = npc.image;
    img.alt = npc.name;
    const compDiv = element.querySelector('.companion');
    compDiv.classList.remove('show');
    element.classList.remove('mirrored');
}

// --- Assign slot ---
function assignSlot(userId) {
    const leftCount = leftOccupants.filter(id => id !== null).length;
    const rightCount = rightOccupants.filter(id => id !== null).length;
    let side, occupants, slotIds;
    if (leftCount <= rightCount) {
        side = 'left';
        occupants = leftOccupants;
        slotIds = leftSlots;
    } else {
        side = 'right';
        occupants = rightOccupants;
        slotIds = rightSlots;
    }
    // Cancel any pending reflow on this side
    cancelReflow(side);

    const index = occupants.indexOf(null);
    if (index === -1) return null;
    const slotId = slotIds[index];
    occupants[index] = userId;
    slotOccupancy[userId] = { slotId, side, index };
    return { slotId, side, index };
}

function freeSlot(userId) {
    const occ = slotOccupancy[userId];
    if (!occ) return;
    const { side, index } = occ;
    if (side === 'left') {
        leftOccupants[index] = null;
    } else {
        rightOccupants[index] = null;
    }
    delete slotOccupancy[userId];
}

// --- Cancel pending reflow timers ---
function cancelReflow(side) {
    if (reflowTimers[side]) {
        reflowTimers[side].forEach(t => clearTimeout(t));
        reflowTimers[side] = [];
    }
}

// --- Compact side with staggered FLIP moves ---
function compactSide(side) {
    const occupants = side === 'left' ? leftOccupants : rightOccupants;
    const slotIds = side === 'left' ? leftSlots : rightSlots;

    cancelReflow(side);

    let firstNull = occupants.indexOf(null);
    if (firstNull === -1) return;

    const moves = [];
    for (let i = firstNull + 1; i < occupants.length; i++) {
        if (occupants[i] !== null) {
            const userId = occupants[i];
            const newIndex = firstNull;
            const newSlotId = slotIds[newIndex];
            moves.push({
                userId,
                fromIndex: i,
                toIndex: newIndex,
                slotId: newSlotId
            });
            // Update state immediately
            occupants[newIndex] = userId;
            occupants[i] = null;
            if (slotOccupancy[userId]) {
                slotOccupancy[userId].index = newIndex;
                slotOccupancy[userId].slotId = newSlotId;
            }
            const item = chibiItems[userId];
            if (item) {
                item.slotId = newSlotId;
                item.index = newIndex;
            }
            firstNull = i;
        }
    }

    if (moves.length === 0) return;

    // Stagger the FLIP moves with delays 
    let delay = 500;
    const timers = [];
    moves.forEach(move => {
        const timer = setTimeout(() => {
            const item = chibiItems[move.userId];
            if (!item) return;
            // Perform FLIP move to new slot (with animation)
            moveChibiToSlot(item, move.slotId, true);
        }, delay);
        timers.push(timer);
        delay += 500;
    });

    reflowTimers[side] = timers;
}

// --- Handle speaking start ---
function handleSpeakingStart(userId) {
    if (userId === GM_USER_ID) {
        // Cancel both GM timers
        if (gmTimeout) {
            clearTimeout(gmTimeout);
            gmTimeout = null;
        }
        if (gmRemovalTimer) {
            clearTimeout(gmRemovalTimer);
            gmRemovalTimer = null;
        }
        showGM(true);
        if (activeNPC) showNPC(true, activeNPC);
        playAnimation(userId, 'speak');
        return;
    }
    
    const player = playersData.find(p => p.userId === userId);
    if (!player || player.muted) return;
    
    if (chibiItems[userId]) {
        const item = chibiItems[userId];
        if (item.timeout) {
            clearTimeout(item.timeout);
            item.timeout = null;
        }
        if (item.removalTimer) {
            clearTimeout(item.removalTimer);
            item.removalTimer = null;
        }
        item.element.classList.add('show');
        item.element.style.opacity = '1';
        playAnimation(userId, 'speak');
        return;
    }
    
    const slot = assignSlot(userId);
    if (!slot) {
        console.warn("No free slot for user", userId);
        return;
    }
    
    const element = createChibiElement(userId, slot.slotId);
    if (!element) return;
    updateChibiAppearance(userId, element, slot.slotId);
    setChibiTranslate(element, 0, 0, false);
    requestAnimationFrame(() => {
        element.classList.add('show');
        element.style.opacity = '1';
        element.classList.add('chibi-speaking');
    });

    chibiItems[userId] = {
        element,
        slotId: slot.slotId,
        side: slot.side,
        index: slot.index,
        timeout: null,
        removalTimer: null
    };
}

// --- Handle speaking end ---
function handleSpeakingEnd(userId) {
    if (userId === GM_USER_ID) {
        if (gmTimeout) {
            clearTimeout(gmTimeout);
            gmTimeout = null;
        }
        gmTimeout = setTimeout(() => {
            showGM(false);
            showNPC(false);
            gmTimeout = null;
        }, 3000);
        return;
    }

    const player = playersData.find(p => p.userId === userId);
    if (!player || player.muted) return;
    
    const item = chibiItems[userId];
    if (!item) return;
    item.element.classList.remove('chibi-speaking');
    if (item.timeout) {
        clearTimeout(item.timeout);
        item.timeout = null;
    }
    item.timeout = setTimeout(() => {
        removeUser(userId);
    }, 3000);
}

function removeUser(userId) {
    const item = chibiItems[userId];
    if (!item) return;
    if (item.removalTimer) {
        clearTimeout(item.removalTimer);
        item.removalTimer = null;
    }
    if (item.timeout) {
        clearTimeout(item.timeout);
        item.timeout = null;
    }

    item.element.classList.remove('show');
    item.element.classList.remove('chibi-speaking');
    item.element.style.opacity = '0';

    item.removalTimer = setTimeout(() => {
        if (item.element.parentNode) {
            item.element.parentNode.removeChild(item.element);
        }
        delete chibiItems[userId];
        const side = item.side;
        freeSlot(userId);
        compactSide(side);
        if (item.removalTimer) {
            clearTimeout(item.removalTimer);
            item.removalTimer = null;
        }
    }, 400);
}

// --- GM and NPC visibility (using containers too) ---
let gmChibiElement = null;
let npcChibiElement = null;

function showGM(show) {
    if (show) {
        if (gmRemovalTimer) {
            clearTimeout(gmRemovalTimer);
            gmRemovalTimer = null;
        }
        if (!gmChibiElement) {
            gmChibiElement = createChibiElement(GM_USER_ID, 'gm', true);
            updateGMChibi(gmChibiElement);
            setChibiTranslate(gmChibiElement, 0, 0, false);
        }
        requestAnimationFrame(() => {
            gmChibiElement.classList.add('show');
            gmChibiElement.style.opacity = '1';
        });
    } else {
        if (gmChibiElement) {
            gmChibiElement.classList.remove('show');
            gmChibiElement.style.opacity = '0';
            gmRemovalTimer = setTimeout(() => {
                if (gmChibiElement && gmChibiElement.parentNode) {
                    gmChibiElement.parentNode.removeChild(gmChibiElement);
                }
                gmChibiElement = null;
                gmRemovalTimer = null;
            }, 400);
        }
    }
}

function showNPC(show, npcId) {
    if (show && npcId) {
        if (!npcChibiElement) {
            npcChibiElement = createChibiElement('npc', 'npc', false, true);
            updateNPCChibi(npcChibiElement, npcId);
            setChibiTranslate(npcChibiElement, 0, 0, false);
        }
        requestAnimationFrame(() => {
            npcChibiElement.classList.add('show');
            npcChibiElement.style.opacity = '1';
        });
    } else {
        if (npcChibiElement) {
            npcChibiElement.classList.remove('show');
            npcChibiElement.style.opacity = '0';
            setTimeout(() => {
                if (npcChibiElement && npcChibiElement.parentNode) {
                    npcChibiElement.parentNode.removeChild(npcChibiElement);
                }
                npcChibiElement = null;
            }, 400);
        }
    }
}

// ==========================================================
// 6. COMMAND HANDLING
// ==========================================================
function resolveCharacter(input) {
    let player = playersData.find(p => p.id === input || p.name.toLowerCase() === input.toLowerCase());
    if (player) return { type: 'player', data: player };
    let npc = npcs.find(n => n.id === input || n.name.toLowerCase() === input.toLowerCase() || (n.aliases && n.aliases.includes(input)));
    if (npc) return { type: 'npc', data: npc };
    const aliasTarget = charAliases[input];
    if (aliasTarget) {
        player = playersData.find(p => p.id === aliasTarget);
        if (player) return { type: 'player', data: player };
        npc = npcs.find(n => n.id === aliasTarget);
        if (npc) return { type: 'npc', data: npc };
    }
    return null;
}

function handleCommand(rawCommand) {
    console.log("Received command:", rawCommand);
    const parts = rawCommand.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === '/chibi' || cmd === '/c') {
        if (args[0] === 'on' || args[0] === 'y') {
            overlayEnabled = true;
            document.getElementById('chibi-overlay').style.display = 'block';
        } else if (args[0] === 'off' || args[0] === 'n') {
            overlayEnabled = false;
            document.getElementById('chibi-overlay').style.display = 'none';
        } else if (args[0] === 'test' || args[0] === 't') {
            if (!overlayEnabled) return;
            fillTestSlots();
        } else if (args[0] === 'testoff' || args[0] === 'to') {
            if (!overlayEnabled) return;
            clearTestSlots();
        }
        return;
    }

    // ---- /flip command with crossfade ----
    if (cmd === '/flip' || cmd === '/f') {
        const charName = args.join(' ');
        if (!charName) return;
        const resolved = resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (chibiItems[userId]) {
                flipChibiImage(userId, false);
            } else {
                console.warn(`No chibi found for "${charName}"`);
            }
        } else {
            console.warn(`Character "${charName}" not found.`);
        }
        return;
    }

    // ---- /compflip command with crossfade ----
    if (cmd === '/compflip' || cmd === '/cf') {
        const charName = args.join(' ');
        if (!charName) return;
        const resolved = resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (chibiItems[userId]) {
                flipChibiImage(userId, true);
            } else {
                console.warn(`No chibi found for "${charName}"`);
            }
        } else {
            console.warn(`Character "${charName}" not found.`);
        }
        return;
    }

    if (cmd === '/npc' || cmd === '/n') {
        const npcName = args.join(' ');
        if (!npcName) return;
        if (npcName.toLowerCase() === 'clear' || npcName.toLowerCase() === 'c') {
            activeNPC = null;
            showNPC(false);
            return;
        }
        const resolved = resolveCharacter(npcName);
        if (resolved && resolved.type === 'npc') {
            if (npcChibiElement) {
                if (npcChibiElement.parentNode) {
                    npcChibiElement.parentNode.removeChild(npcChibiElement);
                }
                npcChibiElement = null;
            }
            activeNPC = resolved.data.id;
            showNPC(true, activeNPC);
        }
        return;
    }

    if (cmd === '/effect' || cmd === '/e') {
        const effectName = args[0];
        let duration = parseInt(args[1]);
        if (!effectName) return;
        const effect = effects.find(e => e.id.toLowerCase() === effectName.toLowerCase());
        if (!effect) return;
        if (effect.multiple) {
            effect.effects.forEach(eff => {
                const subEffect = effects.find(e => e.id === eff.id);
                if (subEffect) {
                    triggerEffect(subEffect, eff.duration || subEffect.duration || 10);
                }
            });
            return;
        }
        if (isNaN(duration)) duration = effect.duration || 10;
        triggerEffect(effect, duration);
        return;
    }

    if (cmd === '/effects' || cmd === '/es') {
        if (args.length === 0) return;
        const cleanedArgs = args.map(a => a.trim()).filter(a => a.length > 0);
        if (cleanedArgs[0].toLowerCase() === 'clear' || cleanedArgs[0].toLowerCase() === 'c') {
            Object.keys(activeEffects).forEach(slot => {
                const old = activeEffects[slot];
                old.element.classList.remove('show');
                old.element.classList.add('hide');
                clearTimeout(old.timeout);
                setTimeout(() => {
                    if (old.element.parentNode) old.element.parentNode.removeChild(old.element);
                }, 500);
                delete activeEffects[slot];
            });
            return;
        }
        const effectNames = cleanedArgs.join(' ').split(',').map(s => s.trim()).filter(s => s.length > 0);
        effectNames.forEach(name => {
            const matchedEffects = effects.filter(e => 
                e.id === name || e.group === name
            );
            if (matchedEffects.length === 0) {
                console.warn(`No effect found for: ${name}`);
                return;
            }
            matchedEffects.forEach(effect => {
                triggerEffect(effect, effect.duration || 10);
            });
        });
    }

    if (cmd === '/pop' || cmd === '/p') {
        const charName = args.join(' ');
        if (!charName) return;
        if (charName == "gm") {
            showGM(false);
            return;
        }
        const resolved = resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (chibiItems[userId]) {
                removeUser(userId);
            } else {
                console.warn(`No chibi found for "${charName}"`);
            }
        } else {
            console.warn(`Character "${charName}" not found.`);
        }
        return;
    }

    if (cmd === '/impersonate' || cmd === '/i') {
        const charName = args.join(' ');
        if (!charName) return;
        if (charName == "gm") {
            showGM(true);
            return;
        }
        const resolved = resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (chibiItems[userId]) {
                chibiItems[userId].element.classList.toggle('chibi-speaking');
                return;
            }
            let muted = resolved.data.muted || false;
            resolved.data.muted = false;
            handleSpeakingStart(userId);
            if (muted) {
                resolved.data.muted = true;
            }
            setTimeout(() => {
                if (chibiItems[userId]) {
                    chibiItems[userId].element.classList.remove('chibi-speaking');
                }
            }, 2000);
        }
        return;
    }

    if (cmd === 'mute' || cmd === '/m') {
        const charName = args.join(' ');
        if (!charName) return;
        if (charName == "alloff") {
            playersData.forEach(p => {
                removeUser(p.userId);
                p.muted = true;
                return;
            })
        }
        if (charName == "allon") {
            playersData.forEach(p => {
                p.muted = false;
                return;
            })
        }
        const resolved = resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            removeUser(userId);
            resolved.data.muted = true;
        }
        return;
    }

    // ---- /animation command ----
    if (cmd === '/animation' || cmd === '/a') {
        if (args.length < 2) {
            console.warn('Usage: /animation <name> <character>');
            return;
        }
        const animName = args[0].toLowerCase();
        const charName = args.slice(1).join(' ');
        const resolved = resolveCharacter(charName);
        if ((resolved && resolved.type === 'player' || charName === "gm" || charName === "npc")) {
            if (charName === "gm" || charName === "npc") {
                playAnimation(charName, animName);
                return;
            } else {
                const userId = resolved.data.userId;
                if (chibiItems[userId]) {
                    playAnimation(userId, animName);
                } else {
                    console.warn(`No chibi found for "${charName}"`);
                }
            }
        } else {
            console.warn(`Character "${charName}" not found.`);
        }
        return;
    }
}

function shuffleArray(arr) {
    const a = [...arr]; // copy so original isn't modified
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// --- Test fill and clear (adapted) ---
function fillTestSlots() {
    clearTestSlots();
    let idx = 0;
    const allPlayerIds = shuffleArray(playersData.map(p => p.userId));
    for (let i = 0; i < leftSlots.length && idx < allPlayerIds.length; i++) {
        setTimeout(() => {
            const userId = allPlayerIds[idx];
            const slotId = leftSlots[i];
            const element = createChibiElement(userId, slotId);
            if (element) {
                const player = playersData.find(p => p.userId === userId);
                updateChibiAppearance(userId, element, slotId);
                setChibiTranslate(element, 0, 0, false);
                requestAnimationFrame(() => {
                    element.classList.add('show');
                    element.style.opacity = '1';
                });
                leftOccupants[i] = userId;
                slotOccupancy[userId] = { slotId, side: 'left', index: i };
                chibiItems[userId] = { element, slotId, side: 'left', index: i, timeout: null };
                idx++;
            }
        }, i * 200);
    }
    for (let i = 0; i < rightSlots.length && idx < allPlayerIds.length; i++) {
        setTimeout(() => {
            const userId = allPlayerIds[idx];
            const slotId = rightSlots[i];
            const element = createChibiElement(userId, slotId);
            if (element) {
                const player = playersData.find(p => p.userId === userId);
                updateChibiAppearance(userId, element, slotId);
                setChibiTranslate(element, 0, 0, false);
                requestAnimationFrame(() => {
                    element.classList.add('show');
                    element.style.opacity = '1';
                });
                rightOccupants[i] = userId;
                slotOccupancy[userId] = { slotId, side: 'right', index: i };
                chibiItems[userId] = { element, slotId, side: 'right', index: i, timeout: null };
                idx++;
            }

        }, i * 200);
    }
    showGM(true);
}

function clearTestSlots() {
    Object.keys(chibiItems).forEach(userId => {
        const item = chibiItems[userId];
        if (item.element && item.element.parentNode) {
            item.element.parentNode.removeChild(item.element);
        }
        delete chibiItems[userId];
    });
    leftOccupants.fill(null);
    rightOccupants.fill(null);
    slotOccupancy = {};
    cancelReflow('left');
    cancelReflow('right');
    showGM(false);
    showNPC(false);
}

// --- Effects (unchanged) ---
function triggerEffect(effect, duration) {
    const actualId = effectSlotMap[effect.slot];
    if (!actualId) return;

    if (activeEffects[effect.slot]) {
        const old = activeEffects[effect.slot];
        old.element.classList.remove('show');
        old.element.classList.add('hide');
        clearTimeout(old.timeout);
        setTimeout(() => {
            if (old.element.parentNode) old.element.parentNode.removeChild(old.element);
        }, 500);
        delete activeEffects[effect.slot];
    }

    const container = document.getElementById(actualId);
    const div = document.createElement('div');
    div.className = 'chibi-effect';
    const img = document.createElement('img');
    img.src = effect.image;
    img.alt = effect.name;
    div.appendChild(img);
    container.appendChild(div);

    requestAnimationFrame(() => {
        div.classList.add('show');
    });

    const timeout = setTimeout(() => {
        div.classList.remove('show');
        div.classList.add('hide');
        setTimeout(() => {
            if (div.parentNode) div.parentNode.removeChild(div);
        }, 500);
        delete activeEffects[effect.slot];
    }, duration * 1000);

    activeEffects[effect.slot] = { element: div, timeout };
}

// ==========================================================
// 7. AMBIENT EFFECTS (unchanged)
// ==========================================================
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

// --- Animation support ---
function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 0); }
            20%, 40%, 60%, 80% { transform: translate(8px, 0); }
        }
        .chibi-item.anim-shake {
            animation: shake 0.6s ease-in-out !important;
        }
        @keyframes bounce {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(0, -20px); }
        }
        .chibi-item.anim-bounce {
            animation: bounce 0.5s ease-in-out !important;
        }
        @keyframes speak {
            0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
            20%  { transform: translate(0, -3px) rotate(-1deg) scale(1.02); }
            50%  { transform: translate(0, -8px) rotate(1deg) scale(1.04); }
            80%  { transform: translate(0, -3px) rotate(-0.5deg) scale(1.02); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .chibi-item.anim-speak {
            animation: speak 3s ease-in-out !important;
        }
        .chibi-item.chibi-speaking {
            animation: speak 0.9s ease-in-out infinite;
        }
        /* Spin animation (rotate) */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .chibi-item.anim-spin {
            animation: spin 1s linear !important;
        }
        @keyframes glow {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        .chibi-item.anim-glow {
            animation: glow 0.8s ease-in-out !important;
        }
        @keyframes jump {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(0, -30px); }
        }
        .chibi-item.anim-jump {
            animation: jump 0.7s ease-in-out !important;
        }
        @keyframes attack-left {
            0%   { transform: translate(0, 0) scale(1); }
            15%  { transform: translate(-20px, 5px) scale(1.1) rotate(-5deg); }
            30%  { transform: translate(-15px, 8px) scale(1.05) rotate(3deg); }
            45%  { transform: translate(-25px, 5px) scale(1.1) rotate(-2deg); }
            60%  { transform: translate(-20px, 8px) scale(1.05) rotate(4deg); }
            75%  { transform: translate(-15px, 5px) scale(1.1) rotate(-3deg); }
            100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes attack-right {
            0%   { transform: translate(0, 0) scale(1); }
            15%  { transform: translate(20px, 5px) scale(1.1) rotate(5deg); }
            30%  { transform: translate(15px, 8px) scale(1.05) rotate(-3deg); }
            45%  { transform: translate(25px, 5px) scale(1.1) rotate(2deg); }
            60%  { transform: translate(20px, 8px) scale(1.05) rotate(-4deg); }
            75%  { transform: translate(15px, 5px) scale(1.1) rotate(3deg); }
            100% { transform: translate(0, 0) scale(1); }
        }
        .chibi-item.anim-attack-left {
            animation: attack-left 0.6s ease-in-out !important;
        }
        .chibi-item.anim-attack-right {
            animation: attack-right 0.6s ease-in-out !important;
        }
    `;
    document.head.appendChild(style);
}

// --- Apply an animation to a chibi element ---
function playAnimation(userId, animationName) {
    let item;
    if (userId == "gm" || userId == "npc") {
        item = { element: document.getElementsByClassName(`${userId}-slot`)[0] }
    } else {
        item = chibiItems[userId];
        if (!item) {
            console.warn(`No chibi found for user ${userId}`);
        }
    }
    
    const element = item.element;
    element.classList.forEach(cls => {
        if (cls.startsWith('anim-')) {
            element.classList.remove(cls);
        }
    });
    const animClass = `anim-${animationName}`;
    element.classList.add(animClass);

    const onEnd = () => {
        element.classList.remove(animClass);
        element.removeEventListener('animationend', onEnd);
    };
    element.addEventListener('animationend', onEnd);
}

// ==========================================================
// 8. INITIALIZE
// ==========================================================
function initialize() {
    renderPlayerCards();
    setTimeout(initWebSocket, 100);
    addAmbientEffects();
    injectAnimationStyles();
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
