// ==========================================================
// 1. DATA MANAGER 
// ==========================================================
class DataManager {
    constructor() {
        const DATA = window.SHARED_DATA || {};
        this.gmData = DATA.gmData || {};
        this.playersData = DATA.playersData || [];
        this.npcs = DATA.npcs || [];
        this.backgrounds = DATA.backgrounds || [];
        this.animations = DATA.animations || [];
        this.effects = DATA.effects || [];
        this.defaultAvatar = DATA.defaultAvatar || '';
    }

    getPlayerById(id) {
        return this.playersData.find(p => p.id === id);
    }

    getPlayerByName(name) {
        return this.playersData.find(p => p.name.toLowerCase() === name.toLowerCase());
    }

    getPlayerByUserId(userId) {
        return this.playersData.find(p => p.userId === userId);
    }

    getNPC(id) {
        return this.npcs.find(n => n.id === id);
    }

    getNPCByName(name) {
        return this.npcs.find(n => n.name.toLowerCase() === name.toLowerCase());
    }

    getBackground(id) {
        return this.backgrounds.find(b => b.id === id);
    }

    getEffect(id) {
        return this.effects.find(e => e.id === id);
    }

    getEffectsByGroup(group) {
        return this.effects.filter(e => e.group === group);
    }

    resolveCharacter(input) {
        let player = this.playersData.find(p =>
            p.id === input ||
            p.name.toLowerCase() === input.toLowerCase() ||
            (p.aliases && p.aliases.includes(input))
        );
        if (player) return { type: 'player', data: player };

        let npc = this.npcs.find(n =>
            n.id === input ||
            n.name.toLowerCase() === input.toLowerCase() ||
            (n.aliases && n.aliases.includes(input))
        );
        if (npc) return { type: 'npc', data: npc };

        return null;
    }

    shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}

// ==========================================================
// 2. SLOT MANAGER 
// ==========================================================
class SlotManager {
    constructor() {
        this.leftSlots = ['player-1', 'player-3', 'player-5', 'player-7'];
        this.rightSlots = ['player-2', 'player-4', 'player-6'];
        this.leftOccupants = [null, null, null, null];
        this.rightOccupants = [null, null, null];
        this.slotOccupancy = {};
        this.pendingRemovals = {};
        this.reflowTimers = { left: [], right: [] };
        this.pendingMovesMap = {}; 
        this.staggerTimers = []; 
    }

    assignSlot(userId) {
        if (this.slotOccupancy[userId]) {
            return this.slotOccupancy[userId];
        }
        const leftCount = this.leftOccupants.filter(id => id !== null || this.pendingRemovals[id]).length;
        const rightCount = this.rightOccupants.filter(id => id !== null || this.pendingRemovals[id]).length;
        let side, occupants, slotIds;
        if (leftCount <= rightCount) {
            side = 'left';
            occupants = this.leftOccupants;
            slotIds = this.leftSlots;
        } else {
            side = 'right';
            occupants = this.rightOccupants;
            slotIds = this.rightSlots;
        }
        this.cancelReflow(side);

        const index = occupants.indexOf(null);
        if (index === -1) return null;
        const slotId = slotIds[index];
        occupants[index] = userId;
        this.slotOccupancy[userId] = { slotId, side, index };
        return { slotId, side, index };
    }

    freeSlot(userId) {
        const occ = this.slotOccupancy[userId];
        if (!occ) return;
        const { side, index } = occ;
        if (side === 'left') {
            this.leftOccupants[index] = null;
        } else {
            this.rightOccupants[index] = null;
        }
        delete this.slotOccupancy[userId];
        delete this.pendingRemovals[userId];
    }

    getOccupancy(userId) {
        return this.slotOccupancy[userId] || null;
    }

    cancelReflow(side) {
        if (this.reflowTimers[side]) {
            this.reflowTimers[side].forEach(t => clearTimeout(t));
            this.reflowTimers[side] = [];
        }
        Object.keys(this.pendingMovesMap).forEach(key => {
            clearTimeout(this.pendingMovesMap[key].timer);
            delete this.pendingMovesMap[key];
        });
    }

    compactSide(side) {
        const occupants = side === 'left' ? this.leftOccupants : this.rightOccupants;
        const slotIds = side === 'left' ? this.leftSlots : this.rightSlots;

        this.cancelReflow(side);

        let firstNull = occupants.indexOf(null);
        if (firstNull === -1) return [];

        const moves = [];
        
        const tempOccupants = [...occupants];
        for (let i = firstNull + 1; i < tempOccupants.length; i++) {
            const userId = tempOccupants[i];
            if (userId !== null && !this.pendingRemovals[userId]) {
                const newIndex = firstNull;
                const newSlotId = slotIds[newIndex];
                moves.push({
                    userId,
                    fromIndex: i,
                    toIndex: newIndex,
                    slotId: newSlotId
                });
                tempOccupants[newIndex] = userId;
                tempOccupants[i] = null;
                firstNull = i;
            }
        }
        return moves;
    }

    scheduleReflow(side, moves, onMove) {
        if (moves.length === 0) return;
        let delay = 500;
        const timers = [];
        moves.forEach(move => {
            const timer = setTimeout(() => {
                const occupants = side === 'left' ? this.leftOccupants : this.rightOccupants;
                const occ = this.slotOccupancy[move.userId];
                if (occ) {
                    occupants[move.toIndex] = move.userId;
                    occupants[move.fromIndex] = null;
                    occ.index = move.toIndex;
                    occ.slotId = move.slotId;
                }
                onMove(move);
                delete this.pendingMovesMap[move.userId];
            }, delay);
            timers.push(timer);
            this.pendingMovesMap[move.userId] = { move, timer, onMove };
            delay += 500;
        });
        this.reflowTimers[side] = timers;
    }

    forceExecuteMove(userId) {
        if (this.pendingMovesMap[userId]) {
            const { move, timer, onMove } = this.pendingMovesMap[userId];
            clearTimeout(timer);
            delete this.pendingMovesMap[userId];
            const side = move.slotId.startsWith('player-') && (move.slotId.includes('player-1') || move.slotId.includes('player-3') || move.slotId.includes('player-5') || move.slotId.includes('player-7')) ? 'left' : 'right';
            const occupants = side === 'left' ? this.leftOccupants : this.rightOccupants;
            const occ = this.slotOccupancy[move.userId];
            if (occ) {
                occupants[move.toIndex] = move.userId;
                occupants[move.fromIndex] = null;
                occ.index = move.toIndex;
                occ.slotId = move.slotId;
            }
            onMove(move);
            return true;
        }
        return false;
    }

    clearStaggerTimers() {
        this.staggerTimers.forEach(t => clearTimeout(t));
        this.staggerTimers = [];
    }

    clearAll() {
        this.leftOccupants.fill(null);
        this.rightOccupants.fill(null);
        this.slotOccupancy = {};
        this.pendingRemovals = {};
        Object.keys(this.pendingMovesMap).forEach(key => {
            clearTimeout(this.pendingMovesMap[key].timer);
            delete this.pendingMovesMap[key];
        });
        this.clearStaggerTimers();
        this.cancelReflow('left');
        this.cancelReflow('right');
    }
}

// ==========================================================
// 3. CHIBI MANAGER 
// ==========================================================
class ChibiManager {
    constructor(dataManager, slotManager) {
        this.dataManager = dataManager;
        this.slotManager = slotManager;
        this.chibiItems = {};
        this.gmChibiElement = null;
        this.npcChibiElement = null;
        this.effectSlotMap = {
            'left': 'chibi-over-effect-left',
            'right': 'chibi-over-effect-right',
            'main': 'chibi-slot-effect',
            'under': 'chibi-under-bar'
        };
    }

    repositionContainer(slotId, container) {
        const containerDefaults = {
            1: { fromTop: -20, fromSide: 0 },
            2: { fromTop: 20, fromSide: 0 },
            3: { fromTop: 120, fromSide: 50 },
            4: { fromTop: 130, fromSide: 250 },
            5: { fromTop: 170, fromSide: 315 },
            6: { fromTop: 150, fromSide: 300 },
            7: { fromTop: 0, fromSide: 370 },
        };
        const slot = Number(slotId.replace('player-', ''));
        const defaults = containerDefaults[slot] || { fromTop: 0, fromSide: 0 };
        container.style.position = 'relative';
        const randomTopOffset = Math.floor(Math.random() * 30) - 15;
        const randomSideOffset = Math.floor(Math.random() * 30) - 15;
        container.style.top = defaults.fromTop + randomTopOffset + 'px';
        if (slot === 1 || slot === 3 || slot === 5 || slot === 7) {
            container.style.left = defaults.fromSide + randomSideOffset + 'px';
            container.style.right = 'auto';
        } else {
            container.style.right = defaults.fromSide + randomSideOffset + 'px';
            container.style.left = 'auto';
        }
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
    }

    getCenter(el) {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    setTranslate(element, dx, dy, animate = true) {
        if (!animate) {
            element.style.transition = 'none';
        }
        element.style.transform = `translate(${dx}px, ${dy}px)`;
        if (!animate) {
            void element.offsetHeight;
            element.style.transition = '';
        }
    }

    createChibiElement(userId, slotId, isGM = false, isNPC = false) {
        const container = document.getElementById('chibi-slot-' + slotId);
        if (!container) return null;

        if (!isGM && !isNPC) {
            const others = container.querySelectorAll('.chibi-item:not([data-userid="' + userId + '"])');
            others.forEach(el => {
                if (!el.classList.contains('gm-slot') && !el.classList.contains('npc-slot')) {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }
            });
        }

        const existing = container.querySelector(`.chibi-item[data-userid="${userId}"]`);
        if (existing) {
            const item = this.chibiItems[userId];
            if (item && item.removing) {
                this.cancelRemoval(userId);
            }
            existing.classList.add('show');
            existing.style.opacity = '1';
            existing.dataset.slotId = slotId;
            return existing;
        }

        if (!isGM && !isNPC) {
            this.repositionContainer(slotId, container);
        } else {
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.position = 'relative';
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

    updateChibiAppearance(userId, element, slotId) {
        const player = this.dataManager.getPlayerByUserId(userId);
        if (!player) return;

        const img = element.querySelector('img');
        const compDiv = element.querySelector('.companion');
        const compImg = compDiv.querySelector('img');

        let imgSrc = player.chibiImg;
        const alternates = [{id: 'combat', name: 'Combat', img: player.combatImg || player.chibiImg}, {id: 'downed', name: 'Downed', img: player.downedImg}].concat(player.alternates || []);
        if (player.alternateSet !== 'default' && alternates) {
            const alternate = alternates.find(a => a.id === player.alternateSet);
            if (alternate) {
                imgSrc = alternate.img;
            }
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

        const isRight = this.slotManager.rightSlots.includes(slotId);
        element.classList.toggle('mirrored', isRight);
        compDiv.classList.toggle('mirrored', isRight);
    }

    updateGMChibi(element) {
        const gm = this.dataManager.gmData;
        const img = element.querySelector('img');
        
        let imgSrc = gm.chibiImg;
        const alternates = [
            { id: 'combat', name: 'Combat', img: gm.combatImg || gm.chibiImg },
            { id: 'downed', name: 'Downed', img: gm.downedImg || gm.chibiImg }
        ].concat(gm.alternates || []);
        if (gm.alternateSet !== 'default' && alternates) {
            const alt = alternates.find(a => a.id === gm.alternateSet);
            if (alt) imgSrc = alt.img;
        }
        img.src = imgSrc;

        const compDiv = element.querySelector('.companion');
        const compImg = compDiv.querySelector('img');
        if (gm.companionImg) {
            compImg.src = gm.companionFlipped && gm.companionFlipImg ? gm.companionFlipImg : gm.companionImg;
            compDiv.classList.add('show');
        } else {
            compDiv.classList.remove('show');
        }
    }

    updateNPCChibi(element, npcId) {
        const npc = this.dataManager.getNPC(npcId);
        if (!npc) return;
        const img = element.querySelector('img');
        img.src = npc.image;
        img.alt = npc.name;
        const compDiv = element.querySelector('.companion');
        compDiv.classList.remove('show');
        element.classList.remove('mirrored');
    }

    moveChibiToSlot(item, newSlotId, animate = true) {
        const element = item.element;
        const oldContainer = element.parentNode;
        const newContainer = document.getElementById('chibi-slot-' + newSlotId);
        if (!newContainer || oldContainer === newContainer) return;

        const oldCenter = this.getCenter(element);

        if (!newContainer.style.display || newContainer.style.display === '') {
            newContainer.style.display = 'flex';
            newContainer.style.justifyContent = 'center';
            newContainer.style.alignItems = 'center';
            newContainer.style.position = 'relative';
        }
        newContainer.appendChild(element);

        void element.offsetHeight;
        const newCenter = this.getCenter(element);

        const dx = oldCenter.x - newCenter.x;
        const dy = oldCenter.y - newCenter.y;

        this.setTranslate(element, dx, dy, false);

        requestAnimationFrame(() => {
            if (animate) {
                this.setTranslate(element, 0, 0, true);
            } else {
                this.setTranslate(element, 0, 0, false);
            }
        });
    }

    flipChibiImage(userId, isCompanion = false, alternateId = null) {
        const item = this.chibiItems[userId];
        if (!item) {
            console.warn(`No chibi found for user ${userId}`);
            return;
        }
        const player = this.dataManager.getPlayerByUserId(userId);
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
            player.companionFlipped = !player.companionFlipped;
            newSrc = player.companionFlipped ? (player.companionFlipImg || player.companionImg) : player.companionImg;
        } else {
            if (alternateId === 'combat') {
                newSrc = player.combatImg || player.chibiImg;
                player.alternateSet = 'default';
            } else if (alternateId === 'downed') {
                newSrc = player.downedImg || player.chibiImg;
                player.alternateSet = 'downed';
            } else {
                player.alternateSet = alternateId || player.alternates[0]?.id;
                newSrc = player.alternateSet === 'default' ? player.chibiImg : player.alternates.find(a => a.id === player.alternateSet)?.img || player.chibiImg;
            }
            targetImg = element.querySelector('img');
        }

        if (!targetImg) return;

        targetImg.style.transition = 'opacity 0.3s ease';
        targetImg.style.opacity = '0';

        setTimeout(() => {
            targetImg.src = newSrc;
            void targetImg.offsetHeight;
            targetImg.style.opacity = '1';
            setTimeout(() => {
                targetImg.style.transition = '';
            }, 300);
        }, 300);
    }

    flipGMChibi(isCompanion = false, alternateId = null) {
        const gm = this.dataManager.gmData;
        const element = this.gmChibiElement;
        if (!element) return;

        let targetImg;
        let newSrc;

        if (isCompanion) {
            if (!gm.companionImg) return;
            const compDiv = element.querySelector('.companion');
            targetImg = compDiv.querySelector('img');
            gm.companionFlipped = !gm.companionFlipped;
            newSrc = gm.companionFlipped ? (gm.companionFlipImg || gm.companionImg) : gm.companionImg;
        } else {
            if (alternateId === 'combat') {
                newSrc = gm.combatImg || gm.chibiImg;
                gm.alternateSet = 'default';
            } else if (alternateId === 'downed') {
                newSrc = gm.downedImg || gm.chibiImg;
                gm.alternateSet = 'downed';
            } else {
                gm.alternateSet = alternateId || 'default';
                const alternates = [].concat(gm.alternates || []);
                const alt = alternates.find(a => a.id === gm.alternateSet);
                newSrc = (gm.alternateSet === 'default') ? gm.chibiImg : (alt ? alt.img : gm.chibiImg);
            }
            targetImg = element.querySelector('img');
        }

        if (!targetImg) return;

        targetImg.style.transition = 'opacity 0.3s ease';
        targetImg.style.opacity = '0';
        setTimeout(() => {
            targetImg.src = newSrc;
            void targetImg.offsetHeight;
            targetImg.style.opacity = '1';
            setTimeout(() => targetImg.style.transition = '', 300);
        }, 300);
    }

    showGM(show) {
        if (show) {
            if (this.gmChibiElement) {
                this.updateGMChibi(this.gmChibiElement);
                this.gmChibiElement.classList.add('show');
                this.gmChibiElement.style.opacity = '1';
                return;
            }
            const element = this.createChibiElement(this.dataManager.gmData.userId, 'gm', true);
            if (!element) return;
            this.updateGMChibi(element);
            this.setTranslate(element, 0, 0, false);
            this.gmChibiElement = element;
            requestAnimationFrame(() => {
                element.classList.add('show');
                element.style.opacity = '1';
            });
        } else {
            if (this.gmChibiElement) {
                this.gmChibiElement.classList.remove('show');
                this.gmChibiElement.style.opacity = '0';
            }
        }
    }

    showNPC(show, npcId) {
        if (show && npcId) {
            if (this.npcChibiElement) {
                this.updateNPCChibi(this.npcChibiElement, npcId);
                this.npcChibiElement.classList.add('show');
                this.npcChibiElement.style.opacity = '1';
                return;
            }
            const element = this.createChibiElement('npc', 'npc', false, true);
            if (!element) return;
            this.updateNPCChibi(element, npcId);
            this.setTranslate(element, 0, 0, false);
            this.npcChibiElement = element;
            requestAnimationFrame(() => {
                element.classList.add('show');
                element.style.opacity = '1';
            });
        } else {
            if (this.npcChibiElement) {
                const el = this.npcChibiElement;
                el.classList.remove('show');
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                    if (this.npcChibiElement === el) {
                        this.npcChibiElement = null;
                    }
                }, 400);
            }
        }
    }

    clearPlayerChibis() {
        Object.keys(this.chibiItems).forEach(userId => {
            const item = this.chibiItems[userId];
            if (item.removalTimer) clearTimeout(item.removalTimer);
            if (item.element && item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
            delete this.chibiItems[userId];
        });
        this.slotManager.clearAll();
    }

    cancelRemoval(userId) {
        const item = this.chibiItems[userId];
        if (!item) return false;
        if (item.removalTimer) {
            clearTimeout(item.removalTimer);
            item.removalTimer = null;
        }
        if (item.removing) {
            item.removing = false;
            delete this.slotManager.pendingRemovals[userId];
            this.slotManager.cancelReflow(item.side);
            item.element.style.opacity = '1';
            item.element.classList.add('show');
            return true;
        }
        return false;
    }

    removeChibi(userId, callback) {
        const item = this.chibiItems[userId];
        if (!item) {
            if (callback) callback();
            return;
        }
        if (item.removing) {
            if (callback) callback();
            return;
        }

        if (item.removalTimer) {
            clearTimeout(item.removalTimer);
            item.removalTimer = null;
        }
        if (item.timeout) {
            clearTimeout(item.timeout);
            item.timeout = null;
        }

        item.removing = true;
        this.slotManager.pendingRemovals[userId] = true;

        item.element.classList.remove('show');
        item.element.classList.remove('chibi-speaking');
        item.element.style.opacity = '0';

        item.removalTimer = setTimeout(() => {
            if (!item.removing) {
                delete this.slotManager.pendingRemovals[userId];
                return;
            }
            if (item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
            const side = item.side;
            this.slotManager.freeSlot(userId);
            delete this.slotManager.pendingRemovals[userId];
            delete this.chibiItems[userId];

            const moves = this.slotManager.compactSide(side);
            if (moves.length > 0) {
                this.slotManager.scheduleReflow(side, moves, (move) => {
                    const itemToMove = this.chibiItems[move.userId];
                    if (itemToMove) {
                        this.moveChibiToSlot(itemToMove, move.slotId, true);
                        itemToMove.slotId = move.slotId;
                        itemToMove.index = move.toIndex;
                    }
                });
            }
            if (callback) callback();
        }, 400);
    }

    getChibiElement(userId) {
        const item = this.chibiItems[userId];
        return item ? item.element : null;
    }

    clearAllChibis() {
        Object.keys(this.chibiItems).forEach(userId => {
            const item = this.chibiItems[userId];
            if (item.removalTimer) clearTimeout(item.removalTimer);
            if (item.element && item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
            delete this.chibiItems[userId];
        });
        if (this.gmChibiElement && this.gmChibiElement.parentNode) {
            this.gmChibiElement.parentNode.removeChild(this.gmChibiElement);
            this.gmChibiElement = null;
        }
        if (this.npcChibiElement && this.npcChibiElement.parentNode) {
            this.npcChibiElement.parentNode.removeChild(this.npcChibiElement);
            this.npcChibiElement = null;
        }
        this.slotManager.clearAll();
    }
}

// ==========================================================
// 4. EFFECT MANAGER 
// ==========================================================
class EffectManager {
    constructor() {
        this.effectSlotMap = {
            'left': 'chibi-over-effect-left',
            'right': 'chibi-over-effect-right',
            'main': 'chibi-slot-effect',
            'under': 'chibi-under-bar'
        };
        this.activeEffects = {};
    }

    triggerEffect(effect, duration) {
        const actualId = this.effectSlotMap[effect.slot];
        if (!actualId) return;

        if (this.activeEffects[effect.slot]) {
            const old = this.activeEffects[effect.slot];
            old.element.classList.remove('show');
            old.element.classList.add('hide');
            clearTimeout(old.timeout);
            setTimeout(() => {
                if (old.element.parentNode) old.element.parentNode.removeChild(old.element);
            }, 500);
            delete this.activeEffects[effect.slot];
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
            delete this.activeEffects[effect.slot];
        }, duration * 1000);

        this.activeEffects[effect.slot] = { element: div, timeout };
    }

    clearAllEffects() {
        Object.keys(this.activeEffects).forEach(slot => {
            const old = this.activeEffects[slot];
            old.element.classList.remove('show');
            old.element.classList.add('hide');
            clearTimeout(old.timeout);
            setTimeout(() => {
                if (old.element.parentNode) old.element.parentNode.removeChild(old.element);
            }, 500);
            delete this.activeEffects[slot];
        });
    }
}

// ==========================================================
// 5. ANIMATION MANAGER 
// ==========================================================
class AnimationManager {
    constructor(chibiManager, dataManager) {
        this.chibiManager = chibiManager;
        this.dataManager = dataManager;
    }

    playAnimation(userId, animationName) {
        let element = null;

        if (userId == this.dataManager.gmData.userId) {
            userId = 'gm';
        }
        if (userId === 'gm' || userId === 'npc') {
            const el = document.getElementsByClassName(`${userId}-slot`)[0];
            if (el) element = el;
            else {
                console.warn(`No ${userId} slot found`);
                return;
            }
        } else {
            const combatEl = document.querySelector(`.combat-chibi[data-userid="${userId}"] .combat-chibi-inner`);
            if (combatEl) {
                element = combatEl;
            } else {
                const chibiEl = this.chibiManager.getChibiElement(userId);
                if (chibiEl) element = chibiEl;
                else {
                    console.warn(`No chibi found for user ${userId}`);
                    return;
                }
            }
        }

        const parent = element.parentElement;
        if (!parent) return;

        const targets = Array.from(parent.children);
        targets.forEach(el => {
            el.classList.forEach(cls => {
                if (cls.startsWith('anim-')) {
                    el.classList.remove(cls);
                }
            });

            const animClass = `anim-${animationName}`;
            el.classList.add(animClass);

            const onEnd = () => {
                el.classList.remove(animClass);
                el.removeEventListener('animationend', onEnd);
            };

            el.addEventListener('animationend', onEnd);
        });
    }
}

// ==========================================================
// 6. OVERLAY MANAGER 
// ==========================================================
class OverlayManager {
    constructor(dataManager, slotManager, chibiManager, effectManager, animationManager) {
        this.dataManager = dataManager;
        this.slotManager = slotManager;
        this.chibiManager = chibiManager;
        this.effectManager = effectManager;
        this.animationManager = animationManager;
        this.overlayEnabled = false;
        this.combatMode = false;
        this.overlayEl = document.getElementById('chibi-overlay');
        this.gmTimeout = null;
        this.gmRemovalTimer = null;
        this.activeNPC = null;
        this.npcMuted = false;
        this.combatChibiWrappers = {};
        this.combatCompanionElements = {};
        this.speakingTimeouts = {};
        this.removalTimeouts = {};
        this.lastBackgroundId = "default";
    }

    enable() {
        if (this.overlayEnabled) return;
        this.overlayEnabled = true;
        this.combatMode = false;
        this.overlayEl.classList.add('scenic-mode');
        const defaultBg = this.dataManager.getBackground('default');
        if (defaultBg) {
            this.overlayEl.style.backgroundImage = `url('${defaultBg.image}')`;
        } else {
            this.overlayEl.style.backgroundImage = '';
        }
        this.overlayEl.style.display = 'block';
    }

    disable() {
        if (!this.overlayEnabled) return;
        this.overlayEnabled = false;
        this.overlayEl.classList.remove('scenic-mode');
        this.overlayEl.style.backgroundImage = '';
        this.combatMode = false;
        this.clearTestSlots();
        this.clearCombatChibis();
        this.chibiManager.clearAllChibis();
        this.overlayEl.style.display = 'none';
    }

    setCombatMode() {
        if (!this.overlayEnabled) return;
        this.overlayEl.style.backgroundImage = '';
        this.combatMode = true;
        this.overlayEl.classList.remove('scenic-mode');
        this.clearTestSlots();
        this.dataManager.gmData.alternateSet = 'combat';
        this.chibiManager.showGM(false);
        this.renderCombatChibis();
    }

    setScenicMode() {
        if (!this.overlayEnabled) return;
        this.combatMode = false;
        this.clearCombatChibis();
        this.dataManager.gmData.alternateSet = 'default';
        this.chibiManager.showGM(false);
        this.overlayEl.classList.add('scenic-mode');
        const defaultBg = this.dataManager.getBackground(this.lastBackgroundId || 'default');
        if (defaultBg) {
            this.overlayEl.style.backgroundImage = `url('${defaultBg.image}')`;
        } else {
            this.overlayEl.style.backgroundImage = '';
        }
    }

    setBackground(bgId) {
        if (this.combatMode || !this.overlayEnabled) {
            console.warn('Cannot change background while in combat mode.');
            return;
        }
        if (!bgId || bgId.toLowerCase() === 'clear' || bgId.toLowerCase() === 'c') {
            this.overlayEl.style.backgroundImage = '';
            this.lastBackgroundId = 'clear';
            return;
        }
        const bg = this.dataManager.getBackground(bgId);
        this.lastBackgroundId = bgId;
        if (bg) {
            this.overlayEl.style.backgroundImage = `url('${bg.image}')`;
        }
    }

    renderCombatChibis() {
        const chibiBar = document.getElementById('chibi-player-bar');
        if (!chibiBar) return;
        chibiBar.querySelectorAll('.combat-chibi').forEach(el => el.remove());
        this.combatChibiWrappers = {};
        this.combatCompanionElements = {};

        const players = this.dataManager.playersData;
        const playerCount = players.length;
        let playerIndex = 1;

        players.forEach(player => {
            const wrapper = document.createElement('div');
            wrapper.className = `combat-chibi ${player.cssClass}`;
            wrapper.dataset.userid = player.userId;
            wrapper.style.position = 'relative';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';

            const isRight = playerIndex >= playerCount / 2;
            if (isRight) {
                wrapper.style.transform = 'scaleX(-1)';
            }
            playerIndex++;

            const inner = document.createElement('div');
            inner.className = 'combat-chibi-inner';
            let imgSrc = player.combatImg || player.chibiImg;
            if (player.alternateSet == 'downed') {
                imgSrc = player.downedImg;
            }
            inner.style.backgroundImage = `url(${imgSrc})`;
            inner.style.backgroundSize = 'contain';
            inner.style.backgroundRepeat = 'no-repeat';
            inner.style.backgroundPosition = 'center';
            inner.style.width = '100%';
            inner.style.height = '100%';
            inner.style.position = 'absolute';
            inner.style.top = '0';
            inner.style.left = '0';

            wrapper.appendChild(inner);

            if (player.companionImg) {
                const compImg = document.createElement('img');
                compImg.className = 'combat-companion';
                const src = player.companionFlipped && player.companionFlipImg ? player.companionFlipImg : player.companionImg;
                compImg.src = src;
                compImg.style.display = 'block';
                wrapper.appendChild(compImg);
                this.combatCompanionElements[player.userId] = compImg;
            }

            chibiBar.appendChild(wrapper);
            this.combatChibiWrappers[player.userId] = wrapper;
        });
    }

    clearCombatChibis() {
        const chibiBar = document.getElementById('chibi-player-bar');
        if (chibiBar) {
            chibiBar.querySelectorAll('.combat-chibi').forEach(el => el.remove());
        }
        this.combatChibiWrappers = {};
        this.combatCompanionElements = {};
    }

    fillTestSlots() {
        this.clearTestSlots();
        const allUserIds = this.dataManager.shuffleArray(this.dataManager.playersData.map(p => p.userId));
        let idx = 0;
        const leftSlots = this.slotManager.leftSlots;
        const rightSlots = this.slotManager.rightSlots;

        for (let i = 0; i < leftSlots.length && idx < allUserIds.length; i++) {
            const userId = allUserIds[idx];
            const slotId = leftSlots[i];
            const element = this.chibiManager.createChibiElement(userId, slotId);
            if (element) {
                this.chibiManager.updateChibiAppearance(userId, element, slotId);
                this.chibiManager.setTranslate(element, 0, 0, false);

                this.slotManager.leftOccupants[i] = userId;
                this.slotManager.slotOccupancy[userId] = { slotId, side: 'left', index: i };
                this.chibiManager.chibiItems[userId] = { element, slotId, side: 'left', index: i, timeout: null, removalTimer: null, removing: false };
                idx++;
            }
        }
        for (let i = 0; i < rightSlots.length && idx < allUserIds.length; i++) {
            const userId = allUserIds[idx];
            const slotId = rightSlots[i];
            const element = this.chibiManager.createChibiElement(userId, slotId);
            if (element) {
                this.chibiManager.updateChibiAppearance(userId, element, slotId);
                this.chibiManager.setTranslate(element, 0, 0, false);
                this.slotManager.rightOccupants[i] = userId;
                this.slotManager.slotOccupancy[userId] = { slotId, side: 'right', index: i };
                this.chibiManager.chibiItems[userId] = { element, slotId, side: 'right', index: i, timeout: null, removalTimer: null, removing: false };
                idx++;
            }
        }

        const itemKeys = Object.keys(this.chibiManager.chibiItems);
        itemKeys.forEach((userId, index) => {
            const item = this.chibiManager.chibiItems[userId];
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    item.element.classList.add('show');
                    item.element.style.opacity = '1';
                });
            }, index * 200);
            this.slotManager.staggerTimers.push(timer);
        });

        this.chibiManager.showGM(true);
    }

    clearTestSlots() {
        this.chibiManager.clearPlayerChibis();
        this.chibiManager.showGM(false);
        if (this.gmTimeout) clearTimeout(this.gmTimeout);
        if (this.gmRemovalTimer) clearTimeout(this.gmRemovalTimer);
        this.gmTimeout = null;
        this.gmRemovalTimer = null;
        this.activeNPC = null;
        Object.keys(this.speakingTimeouts).forEach(k => clearTimeout(this.speakingTimeouts[k]));
        Object.keys(this.removalTimeouts).forEach(k => clearTimeout(this.removalTimeouts[k]));
        this.speakingTimeouts = {};
        this.removalTimeouts = {};
        this.slotManager.clearStaggerTimers();
    }

    handleSpeakingStart(userId) {
        if (userId === this.dataManager.gmData.userId && !this.dataManager.gmData.muted) {
            if (this.gmTimeout) {
                clearTimeout(this.gmTimeout);
                this.gmTimeout = null;
            }
            if (this.gmRemovalTimer) {
                clearTimeout(this.gmRemovalTimer);
                this.gmRemovalTimer = null;
            }
            this.chibiManager.showGM(true);
            if (this.activeNPC && !this.npcMuted) {
                this.chibiManager.showNPC(true, this.activeNPC);
            }
            this.animationManager.playAnimation(userId, 'speak');
            return;
        }

        const player = this.dataManager.getPlayerByUserId(userId);
        if (!player || player.muted) return;

        if (this.combatMode) {
            const wrapper = this.combatChibiWrappers[userId];
            if (wrapper) {
                const inner = wrapper.querySelector('.combat-chibi-inner');
                if (inner) inner.classList.add('chibi-speaking');
            }
            return;
        }

        this.slotManager.forceExecuteMove(userId);

        if (this.chibiManager.chibiItems[userId]) {
            const item = this.chibiManager.chibiItems[userId];
            const wasRemoving = item.removing;
            if (wasRemoving) {
                this.chibiManager.cancelRemoval(userId);
            }
            if (this.speakingTimeouts[userId]) {
                clearTimeout(this.speakingTimeouts[userId]);
                this.speakingTimeouts[userId] = null;
            }
            if (this.removalTimeouts[userId]) {
                clearTimeout(this.removalTimeouts[userId]);
                this.removalTimeouts[userId] = null;
            }
            item.element.classList.add('show');
            item.element.style.opacity = '1';
            this.animationManager.playAnimation(userId, 'speak');
            return;
        }

        const slot = this.slotManager.assignSlot(userId);
        if (!slot) {
            console.warn('No free slot for user', userId);
            return;
        }

        const element = this.chibiManager.createChibiElement(userId, slot.slotId);
        if (!element) return;
        this.chibiManager.updateChibiAppearance(userId, element, slot.slotId);
        this.chibiManager.setTranslate(element, 0, 0, false);
        requestAnimationFrame(() => {
            element.classList.add('show');
            element.style.opacity = '1';
            element.classList.add('chibi-speaking');
        });

        this.chibiManager.chibiItems[userId] = {
            element,
            slotId: slot.slotId,
            side: slot.side,
            index: slot.index,
            timeout: null,
            removalTimer: null,
            removing: false
        };
    }

    handleSpeakingEnd(userId) {
        if (userId === this.dataManager.gmData.userId && !this.dataManager.gmData.muted) {
            if (this.gmTimeout) {
                clearTimeout(this.gmTimeout);
                this.gmTimeout = null;
            }
            this.gmTimeout = setTimeout(() => {
                this.chibiManager.showGM(false);
                if (!this.npcMuted) {
                    this.chibiManager.showNPC(false);
                }
                this.gmTimeout = null;
            }, 3000);
            return;
        }

        const player = this.dataManager.getPlayerByUserId(userId);
        if (!player || player.muted) return;

        if (this.combatMode) {
            const wrapper = this.combatChibiWrappers[userId];
            if (wrapper) {
                const inner = wrapper.querySelector('.combat-chibi-inner');
                if (inner) inner.classList.remove('chibi-speaking');
            }
            return;
        }

        const item = this.chibiManager.chibiItems[userId];
        if (!item) return;
        item.element.classList.remove('chibi-speaking');
        if (this.speakingTimeouts[userId]) {
            clearTimeout(this.speakingTimeouts[userId]);
            this.speakingTimeouts[userId] = null;
        }
        this.speakingTimeouts[userId] = setTimeout(() => {
            this.removeSpeakingUser(userId);
        }, 3000);
    }

    removeSpeakingUser(userId) {
        if (this.removalTimeouts[userId]) {
            clearTimeout(this.removalTimeouts[userId]);
            this.removalTimeouts[userId] = null;
        }
        if (this.speakingTimeouts[userId]) {
            clearTimeout(this.speakingTimeouts[userId]);
            this.speakingTimeouts[userId] = null;
        }
        this.chibiManager.removeChibi(userId);
    }

    showNPC(npcId) {
        if (npcId && npcId.toLowerCase() === 'clear') {
            this.activeNPC = null;
            this.chibiManager.showNPC(false);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(npcId);
        if (resolved && resolved.type === 'npc') {
            this.activeNPC = resolved.data.id;
            this.chibiManager.showNPC(true, this.activeNPC);
        }
    }

    impersonate(charName) {
        if (charName === 'gm') {
            this.chibiManager.showGM(true);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            this.slotManager.forceExecuteMove(userId);

            if (this.chibiManager.chibiItems[userId]) {
                const item = this.chibiManager.chibiItems[userId];
                if (item.removing) {
                    this.chibiManager.cancelRemoval(userId);
                }
                item.element.classList.toggle('chibi-speaking');
                return;
            }
            if (this.combatMode) {
                const wrapper = this.combatChibiWrappers[userId];
                if (wrapper) {
                    wrapper.classList.toggle('chibi-speaking');
                }
                return;
            }
            const wasMuted = resolved.data.muted;
            resolved.data.muted = false;
            this.handleSpeakingStart(userId);
            if (wasMuted) resolved.data.muted = true;
            setTimeout(() => {
                const item = this.chibiManager.chibiItems[userId];
                if (item) {
                    item.element.classList.remove('chibi-speaking');
                }
            }, 2000);
        }
    }

    mute(charName) {
        if (charName === 'all') {
            this.handleSpeakingEnd(gmData.userId);
            this.dataManager.gmData.muted = true;
            this.showNPC(false);
            this.npcMuted = true;
            this.dataManager.playersData.forEach(p => {
                this.removeSpeakingUser(p.userId);
                p.muted = true;
            });
            return;
        }
        if (charName === 'gm') {
            this.handleSpeakingEnd(this.dataManager.gmData.userId);
            this.dataManager.gmData.muted = true;
            return;
        }
        if (charName === 'npc') {
            this.showNPC('clear');
            this.npcMuted = true;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            this.removeSpeakingUser(userId);
            resolved.data.muted = true;
        }
    }

    unmute(charName) {
        if (charName === 'gm') {
            this.dataManager.gmData.muted = false;
            return;
        }
        if (charName === 'npc') {
            this.npcMuted = false;
        }
        if (charName === 'all') {
            this.dataManager.gmData.muted = false;
            this.npcMuted = false;
            this.dataManager.playersData.forEach(p => p.muted = false);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            resolved.data.muted = false;
        }
    }

    pop(charName) {
        if (charName === 'gm') {
            this.chibiManager.showGM(false);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (this.chibiManager.chibiItems[userId]) {
                this.removeSpeakingUser(userId);
            } else if (this.combatMode) {
                const wrapper = this.combatChibiWrappers[userId];
                if (wrapper) {
                    const inner = wrapper.querySelector('.combat-chibi-inner');
                    if (inner) inner.classList.remove('chibi-speaking');
                }
            }
        }
    }

    flip(charName, alternateId) {
        if (charName.toLowerCase() === 'gm') {
            this.chibiManager.flipGMChibi(false, alternateId);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (!resolved || resolved.type !== 'player') return;
        const userId = resolved.data.userId;
        const player = resolved.data;

        if (this.combatMode) {
            const wrapper = this.combatChibiWrappers[userId];
            if (!wrapper) {
                console.warn(`No combat chibi found for "${charName}"`);
                return;
            }
            const inner = wrapper.querySelector('.combat-chibi-inner');
            if (!inner) return;

            let newSrc = player.combatImg || player.chibiImg;
            if (alternateId) {
                switch (alternateId) {
                    case 'default':
                        newSrc = player.chibiImg;
                        player.alternateSet = 'default';
                        break;
                    case 'combat':
                        newSrc = player.combatImg;
                        player.alternateSet = 'default';
                        break;
                    case 'downed':
                        newSrc = player.downedImg;
                        player.alternateSet = alternateId;
                        break;
                    default:
                        newSrc = player.alternates.find(a => a.id === alternateId).img;
                        player.alternateSet = alternateId;
                }
            } else {
                newSrc = player.chibiImg;
            }

            inner.style.transition = 'opacity 0.3s ease';
            inner.style.opacity = '0';
            
            setTimeout(() => {
                inner.style.backgroundImage = `url(${newSrc})`;
                void inner.offsetHeight;
                inner.style.opacity = '1';
                setTimeout(() => {
                    inner.style.transition = '';
                }, 300);
            }, 300);

            const compImg = this.combatCompanionElements[userId];
            if (compImg && player.companionImg) {
                const compSrc = player.companionFlipped && player.companionFlipImg ? player.companionFlipImg : player.companionImg;
                if (compImg.src !== compSrc) {
                    compImg.style.transition = 'opacity 0.3s ease';
                    compImg.style.opacity = '0';
                    setTimeout(() => {
                        compImg.src = compSrc;
                        void compImg.offsetHeight;
                        compImg.style.opacity = '1';
                        setTimeout(() => {
                            compImg.style.transition = '';
                        }, 300);
                    }, 300);
                }
            }
        } else {
            if (this.chibiManager.chibiItems[userId]) {
                this.chibiManager.flipChibiImage(userId, false, alternateId);
            } else {
                console.warn(`No chibi found for "${charName}"`);
            }
        }
    }

    compFlip(charName) {
        if (charName.toLowerCase() === 'gm') {
            this.chibiManager.flipGMChibi(true);
            return;
        }
        const resolved = this.dataManager.resolveCharacter(charName);
        if (!resolved || resolved.type !== 'player') return;
        const userId = resolved.data.userId;
        const player = resolved.data;

        if (this.combatMode) {
            const compImg = this.combatCompanionElements[userId];
            if (!compImg) {
                console.warn(`No companion for "${charName}"`);
                return;
            }
            player.companionFlipped = !player.companionFlipped;
            const newSrc = player.companionFlipped ? (player.companionFlipImg || player.companionImg) : player.companionImg;
            compImg.style.transition = 'opacity 0.3s ease';
            compImg.style.opacity = '0';
            setTimeout(() => {
                compImg.src = newSrc;
                void compImg.offsetHeight;
                compImg.style.opacity = '1';
                setTimeout(() => {
                    compImg.style.transition = '';
                }, 300);
            }, 300);
        } else {
            if (this.chibiManager.chibiItems[userId]) {
                this.chibiManager.flipChibiImage(userId, true);
            } else {
                console.warn(`No chibi found for "${charName}"`);
            }
        }
    }

    triggerEffect(effectName, duration) {
        const effect = this.dataManager.getEffect(effectName);
        if (!effect) return;
        if (effect.multiple) {
            effect.effects.forEach(eff => {
                const subEffect = this.dataManager.getEffect(eff.id);
                if (subEffect) {
                    this.effectManager.triggerEffect(subEffect, eff.duration || subEffect.duration || 10);
                }
            });
            return;
        }
        if (isNaN(duration)) duration = effect.duration || 10;
        this.effectManager.triggerEffect(effect, duration);
    }

    triggerMultipleEffects(names) {
        if (names.length === 0) return;
        const cleaned = names.join(' ').split(',').map(s => s.trim()).filter(s => s.length > 0);
        cleaned.forEach(name => {
            const matched = this.dataManager.getEffect(name) || this.dataManager.getEffectsByGroup(name);
            if (!matched) {
                console.warn(`No effect found for: ${name}`);
                return;
            }
            if (Array.isArray(matched)) {
                matched.forEach(e => this.effectManager.triggerEffect(e, e.duration || 10));
            } else {
                this.effectManager.triggerEffect(matched, matched.duration || 10);
            }
        });
    }

    clearEffects() {
        this.effectManager.clearAllEffects();
    }

    playAnimationForChar(charName, animName) {
        const resolved = this.dataManager.resolveCharacter(charName);
        if (resolved && resolved.type === 'player') {
            const userId = resolved.data.userId;
            if (this.chibiManager.chibiItems[userId] || this.combatMode) {
                this.animationManager.playAnimation(userId, animName);
            }
        } else if (charName === 'gm' || charName === 'npc') {
            this.animationManager.playAnimation(charName, animName);
        } else {
            console.warn(`Character "${charName}" not found.`);
        }
    }
}

// ==========================================================
// 7. WEBSOCKET MANAGER 
// ==========================================================
class WebSocketManager {
    constructor(overlayManager) {
        this.overlayManager = overlayManager;
        this.ws = null;
        this.url = 'ws://127.0.0.1:8080';
        this.init();
    }

    init() {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
        this.url = wsUrl;
        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                console.log('🌙 PF2e Overlay connected to voice WebSocket');
            };
            this.ws.onerror = (err) => {
                console.error('WebSocket error:', err);
                console.warn('Make sure the WebSocket server (server.js) is running and nginx is proxying /ws to port 8080.');
            };
            this.ws.onclose = (event) => {
                console.log(`WebSocket closed (code: ${event.code}). Reconnecting in 3s...`);
                setTimeout(() => this.connect(), 3000);
            };
            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    const userId = msg.userId;

                    if (userId) {
                        const targetCard = document.querySelector(`.card[data-userid="${userId}"]`);
                        if (targetCard) {
                            if (msg.type === 'speaking_start') {
                                targetCard.classList.add('speaking');
                            } else if (msg.type === 'speaking_end') {
                                targetCard.classList.remove('speaking');
                            }
                        }
                    }

                    if (!this.overlayManager.overlayEnabled && msg.type !== 'command') return;

                    if (msg.type === 'speaking_start') {
                        this.overlayManager.handleSpeakingStart(userId);
                    } else if (msg.type === 'speaking_end') {
                        this.overlayManager.handleSpeakingEnd(userId);
                    } else if (msg.type === 'command') {
                        if (window.commandProcessor) {
                            window.commandProcessor.process(msg.command);
                        } else {
                            console.warn('Command processor not initialized');
                        }
                    }
                } catch (e) {
                    console.warn('WebSocket message parse error', e);
                }
            };
        } catch (e) {
            console.error('Failed to create WebSocket:', e);
        }
    }
}

// ==========================================================
// 8. COMMAND PROCESSOR 
// ==========================================================
class CommandProcessor {
    constructor(overlayManager) {
        this.overlayManager = overlayManager;
    }

    process(rawCommand) {
        console.log('Received command:', rawCommand);
        const parts = rawCommand.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case '/chibi':
            case '/c':
                this.handleChibi(args);
                break;
            case '/flip':
            case '/f':
                this.handleFlip(args);
                break;
            case '/compflip':
            case '/cf':
                this.handleCompFlip(args);
                break;
            case '/npc':
            case '/n':
                this.handleNPC(args);
                break;
            case '/effect':
            case '/e':
                this.handleEffect(args);
                break;
            case '/effects':
            case '/es':
                this.handleEffects(args);
                break;
            case '/background':
            case '/bg':
                this.handleBackground(args);
                break;
            case '/pop':
            case '/p':
                this.handlePop(args);
                break;
            case '/impersonate':
            case '/i':
                this.handleImpersonate(args);
                break;
            case '/mute':
            case '/m':
                this.handleMute(args);
                break;
            case '/unmute':
            case '/um':
                this.handleUnmute(args);
                break;
            case '/animation':
            case '/a':
                this.handleAnimation(args);
                break;
            default:
                console.warn(`Unknown command: ${cmd}`);
        }
    }

    handleChibi(args) {
        if (args.length === 0) return;
        const sub = args[0].toLowerCase();
        if (sub === 'on' || sub === 'y') {
            this.overlayManager.enable();
        } else if (sub === 'off' || sub === 'n') {
            this.overlayManager.disable();
        } else if (sub === 'test' || sub === 't') {
            if (!this.overlayManager.overlayEnabled) return;
            this.overlayManager.fillTestSlots();
        } else if (sub === 'testoff' || sub === 'to') {
            if (!this.overlayManager.overlayEnabled) return;
            this.overlayManager.clearTestSlots();
        } else if (sub === 'combat' || sub === 'cm') {
            if (!this.overlayManager.overlayEnabled) return;
            this.overlayManager.setCombatMode();
        } else if (sub === 'scenic' || sub === 'sc') {
            if (!this.overlayManager.overlayEnabled) return;
            this.overlayManager.setScenicMode();
        }
    }

    handleFlip(args) {
        if (args.length === 0) return;
        const charName = args[0];
        const alternateId = args[1] || 'default';
        this.overlayManager.flip(charName, alternateId);
    }

    handleCompFlip(args) {
        if (args.length === 0) return;
        const charName = args.join(' ');
        this.overlayManager.compFlip(charName);
    }

    handleNPC(args) {
        if (args.length === 0) return;
        const npcName = args.join(' ');
        this.overlayManager.showNPC(npcName);
    }

    handleEffect(args) {
        if (args.length === 0) return;
        const effectName = args[0];
        let duration = parseInt(args[1]);
        this.overlayManager.triggerEffect(effectName, duration);
    }

    handleEffects(args) {
        if (args.length === 0) return;
        if (args[0].toLowerCase() === 'clear' || args[0].toLowerCase() === 'c') {
            this.overlayManager.clearEffects();
            return;
        }
        this.overlayManager.triggerMultipleEffects(args);
    }

    handleBackground(args) {
        if (args.length === 0) {
            this.overlayManager.setBackground('clear');
            return;
        }
        const bgId = args[0];
        this.overlayManager.setBackground(bgId);
    }

    handlePop(args) {
        if (args.length === 0) return;
        const charName = args.join(' ');
        this.overlayManager.pop(charName);
    }

    handleImpersonate(args) {
        if (args.length === 0) return;
        const charName = args.join(' ');
        this.overlayManager.impersonate(charName);
    }

    handleMute(args) {
        if (args.length === 0) return;
        const charName = args.join(' ');
        this.overlayManager.mute(charName);
    }

    handleUnmute(args) {
        if (args.length === 0) return;
        const charName = args.join(' ');
        this.overlayManager.unmute(charName);
    }

    handleAnimation(args) {
        if (args.length < 2) {
            console.warn('Usage: /animation <name> <character>');
            return;
        }
        const animName = args[0].toLowerCase();
        const charName = args.slice(1).join(' ');
        this.overlayManager.playAnimationForChar(charName, animName);
    }
}

// ==========================================================
// 9. UI HELPERS 
// ==========================================================
function renderPlayerCards(dataManager) {
    const playerBar = document.getElementById('player-bar');
    if (!playerBar) return;

    playerBar.querySelectorAll('.card.player').forEach(card => card.remove());

    dataManager.playersData.forEach(player => {
        const card = document.createElement('div');
        card.className = `card player ${player.cssClass}`;
        card.setAttribute('data-userid', player.userId);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = player.name;

        const img = document.createElement('img');
        img.src = player.avatar;
        img.alt = `${player.name} avatar`;
        img.onerror = () => { img.src = dataManager.defaultAvatar; };

        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill';
        skillDiv.textContent = player.classSkill;

        card.appendChild(nameDiv);
        card.appendChild(img);
        card.appendChild(skillDiv);
        playerBar.appendChild(card);
    });
    console.log('✅ Fantasy player cards dynamically generated (compact vertical layout)!');
}

function addAmbientEffects() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        setInterval(() => {
            const glint = document.createElement('div');
            glint.style.position = 'absolute';
            glint.style.top = Math.random() * 80 + '%';
            glint.style.left = Math.random() * 80 + '%';
            glint.style.width = '40px';
            glint.style.height = '40px';
            glint.style.background = 'radial-gradient(circle, rgba(255,220,140,0.5), transparent)';
            glint.style.borderRadius = '50%';
            glint.style.filter = 'blur(8px)';
            glint.style.pointerEvents = 'none';
            glint.style.opacity = '0';
            glint.style.transition = 'opacity 2s ease-out';
            mainContent.appendChild(glint);
            requestAnimationFrame(() => { glint.style.opacity = '0.8'; });
            setTimeout(() => {
                glint.style.opacity = '0';
                setTimeout(() => glint.remove(), 2100);
            }, 400);
        }, 11000);
    }

    const desc = document.getElementById('description');
    if (desc) {
        setInterval(() => {
            desc.style.borderLeftColor = '#e7c17e';
            setTimeout(() => {
                if (desc) desc.style.borderLeftColor = 'var(--rune-glow)';
            }, 300);
        }, 4000);
    }
}

// ==========================================================
// 10. INITIALIZATION
// ==========================================================
function initialize() {
    const dataManager = new DataManager();
    const slotManager = new SlotManager();
    const chibiManager = new ChibiManager(dataManager, slotManager);
    const effectManager = new EffectManager();
    const animationManager = new AnimationManager(chibiManager, dataManager);
    const overlayManager = new OverlayManager(dataManager, slotManager, chibiManager, effectManager, animationManager);
    const commandProcessor = new CommandProcessor(overlayManager);
    window.commandProcessor = commandProcessor;
    const wsManager = new WebSocketManager(overlayManager);

    renderPlayerCards(dataManager);
    addAmbientEffects();

    const gmImg = document.querySelector('.card.gm img');
    if (gmImg && gmImg.src.includes('poor.png')) {
        gmImg.onerror = function() {
            this.src = 'https://via.placeholder.com/180x180?text=Game+Master';
        };
    }

    console.log('✅ Overlay system initialized with synchronous test fill and race condition fixes.');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}