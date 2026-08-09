/**
 * ============================================================
 * 1. DATA MANAGER
 * ============================================================
 */

/**
 * Manages access to all shared data including players, NPCs, backgrounds, animations, and effects.
 * Acts as a central repository for data loaded from the global `window.SHARED_DATA`.
 */
class DataManager {
  /**
   * Creates a new DataManager instance.
   * Initialises internal collections from the global `window.SHARED_DATA` object.
   * If `window.SHARED_DATA` is not defined, empty defaults are used.
   */
  constructor() {
    const DATA = window.SHARED_DATA || {};

    /**
     * Game Master (GM) data object.
     * @type {Object}
     */
    this.gmData = DATA.gmData || {};

    /**
     * Array of player data objects.
     * @type {Array<Object>}
     */
    this.playersData = DATA.playersData || [];

    /**
     * Array of NPC data objects.
     * @type {Array<Object>}
     */
    this.npcs = DATA.npcs || [];

    /**
     * Array of background data objects.
     * @type {Array<Object>}
     */
    this.backgrounds = DATA.backgrounds || [];

    /**
     * Array of animation data objects.
     * @type {Array<Object>}
     */
    this.animations = DATA.animations || [];

    /**
     * Array of effect data objects.
     * @type {Array<Object>}
     */
    this.effects = DATA.effects || [];

    /**
     * Default avatar image URL for players whose avatar fails to load.
     * @type {string}
     */
    this.defaultAvatar = DATA.defaultAvatar || '';
  }

  /**
   * Retrieves a player by their unique ID.
   * @param {string} id - The player's ID.
   * @returns {Object|undefined} The player data object, or undefined if not found.
   */
  getPlayerById(id) {
    return this.playersData.find(p => p.id === id);
  }

  /**
   * Retrieves a player by their name (case‑insensitive).
   * @param {string} name - The player's name.
   * @returns {Object|undefined} The player data object, or undefined if not found.
   */
  getPlayerByName(name) {
    return this.playersData.find(p => p.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Retrieves a player by their user ID (usually a string like 'user123').
   * @param {string} userId - The user ID.
   * @returns {Object|undefined} The player data object, or undefined if not found.
   */
  getPlayerByUserId(userId) {
    return this.playersData.find(p => p.userId === userId);
  }

  /**
   * Retrieves an NPC by its ID.
   * @param {string} id - The NPC's ID.
   * @returns {Object|undefined} The NPC data object, or undefined if not found.
   */
  getNPC(id) {
    return this.npcs.find(n => n.id === id);
  }

  /**
   * Retrieves an NPC by its name (case‑insensitive).
   * @param {string} name - The NPC's name.
   * @returns {Object|undefined} The NPC data object, or undefined if not found.
   */
  getNPCByName(name) {
    return this.npcs.find(n => n.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Retrieves a background by its ID.
   * @param {string} id - The background ID.
   * @returns {Object|undefined} The background data object, or undefined if not found.
   */
  getBackground(id) {
    return this.backgrounds.find(b => b.id === id);
  }

  /**
   * Retrieves an effect by its ID.
   * @param {string} id - The effect ID.
   * @returns {Object|undefined} The effect data object, or undefined if not found.
   */
  getEffect(id) {
    return this.effects.find(e => e.id === id);
  }

  /**
   * Retrieves all effects belonging to a specific group.
   * @param {string} group - The group name.
   * @returns {Array<Object>} An array of effect objects in that group.
   */
  getEffectsByGroup(group) {
    return this.effects.filter(e => e.group === group);
  }

  /**
   * Resolves a character identifier (ID, name, or alias) to either a player or NPC.
   * @param {string} input - The identifier to resolve.
   * @returns {Object|null} An object with `type` ('player' or 'npc') and `data` (the character object),
   *                        or `null` if no match is found.
   */
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

  /**
   * Returns a shuffled copy of the given array using the Fisher‑Yates algorithm.
   * @param {Array} arr - The array to shuffle.
   * @returns {Array} A new shuffled array.
   */
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}


/**
 * ============================================================
 * 2. SLOT MANAGER
 * ============================================================
 */

/**
 * Manages the assignment and layout of chibi slots on the scenic overlay.
 * Slots are arranged on two sides (left and right) with fixed maximum capacities.
 * Handles slot allocation, freeing, compaction (reflow), and pending move scheduling.
 */
class SlotManager {
  /**
   * Creates a new SlotManager.
   */
  constructor() {
    /**
     * IDs of the left‑side slot elements.
     * @type {string[]}
     */
    this.leftSlots = ['player-1', 'player-3', 'player-5', 'player-7'];

    /**
     * IDs of the right‑side slot elements.
     * @type {string[]}
     */
    // UPDATED: added 'player-8' to support 8 players
    this.rightSlots = ['player-2', 'player-4', 'player-6', 'player-8'];

    /**
     * Current occupants (user IDs) of left slots. `null` indicates an empty slot.
     * @type {Array<string|null>}
     */
    this.leftOccupants = [null, null, null, null];

    /**
     * Current occupants (user IDs) of right slots. `null` indicates an empty slot.
     * @type {Array<string|null>}
     */
    // UPDATED: right now has 4 slots
    this.rightOccupants = [null, null, null, null];

    /**
     * Lookup table mapping each user ID to its slot occupancy details.
     * @type {Object<string, {slotId: string, side: string, index: number}>}
     */
    this.slotOccupancy = {};

    /**
     * Set of user IDs that are pending removal (being faded out).
     * Used to prevent reflow from moving them during removal.
     * @type {Object<string, boolean>}
     */
    this.pendingRemovals = {};

    /**
     * Timers for scheduled reflows on each side.
     * @type {Object<string, Array<number>>}
     */
    this.reflowTimers = { left: [], right: [] };

    /**
     * Map of user IDs to pending move objects for forced execution.
     * @type {Object<string, {move: Object, timer: number, onMove: Function}>}
     */
    this.pendingMovesMap = {};

    /**
     * Collection of timers used for staggering initial chibi appearance.
     * @type {Array<number>}
     */
    this.staggerTimers = [];
  }

  /**
   * Assigns a free slot to a user, balancing the number of occupants on each side.
   * @param {string} userId - The user ID to assign.
   * @returns {Object|null} An object containing `slotId`, `side`, and `index` of the assigned slot,
   *                        or `null` if no slot is available.
   */
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

  /**
   * Frees the slot occupied by the given user.
   * @param {string} userId - The user ID whose slot should be freed.
   */
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

  /**
   * Returns the occupancy details for a user, if any.
   * @param {string} userId - The user ID.
   * @returns {Object|null} The occupancy object, or `null` if the user has no slot.
   */
  getOccupancy(userId) {
    return this.slotOccupancy[userId] || null;
  }

  /**
   * Cancels all pending reflow timers for a given side.
   * Also clears any pending moves for that side.
   * @param {string} side - Either 'left' or 'right'.
   */
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

  /**
   * Compacts the occupants on a side by shifting all non‑pending users upwards to fill gaps.
   * @param {string} side - Either 'left' or 'right'.
   * @returns {Array<Object>} An array of move objects, each containing `userId`, `fromIndex`, `toIndex`, and `slotId`.
   */
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

  /**
   * Schedules the execution of a set of moves with staggered delays.
   * Each move is executed after a cumulative delay (500ms per move).
   * @param {string} side - The side ('left' or 'right').
   * @param {Array<Object>} moves - An array of move objects from `compactSide`.
   * @param {Function} onMove - Callback invoked when each move is executed.
   */
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

  /**
   * Immediately executes a pending move for a user, bypassing the scheduled delay.
   * @param {string} userId - The user ID of the pending move.
   * @returns {boolean} `true` if a pending move was found and executed, otherwise `false`.
   */
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

  /**
   * Clears all stagger timers used for initial appearance animation.
   */
  clearStaggerTimers() {
    this.staggerTimers.forEach(t => clearTimeout(t));
    this.staggerTimers = [];
  }

  /**
   * Clears all state: occupants, occupancy map, pending removals, moves, and timers.
   */
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


/**
 * ============================================================
 * 3. CHIBI MANAGER
 * ============================================================
 */

/**
 * Manages the creation, display, updating, and removal of chibi (character) elements
 * in the overlay. Handles both scenic and combat modes, as well as GM and NPC chibis.
 */
class ChibiManager {
  /**
   * Creates a new ChibiManager.
   * @param {DataManager} dataManager - Reference to the data manager.
   * @param {SlotManager} slotManager - Reference to the slot manager.
   */
  constructor(dataManager, slotManager) {
    this.dataManager = dataManager;
    this.slotManager = slotManager;

    /**
     * Internal map of user IDs to chibi item objects.
     * @type {Object<string, {element: HTMLElement, slotId: string, side: string, index: number, timeout: number|null, removalTimer: number|null, removing: boolean}>}
     */
    this.chibiItems = {};

    /**
     * The DOM element of the GM chibi, if currently displayed.
     * @type {HTMLElement|null}
     */
    this.gmChibiElement = null;

    /**
     * The DOM element of the NPC chibi, if currently displayed.
     * @type {HTMLElement|null}
     */
    this.npcChibiElement = null;

    /**
     * Mapping of effect slot identifiers to container element IDs.
     * @type {Object<string, string>}
     */
    this.effectSlotMap = {
      'left': 'chibi-over-effect-left',
      'right': 'chibi-over-effect-right',
      'main': 'chibi-slot-effect',
      'under': 'chibi-under-bar'
    };
  }

  /**
   * Positions a chibi container randomly within its slot, accounting for side and default offsets.
   * @param {string} slotId - The slot ID (e.g., 'player-1').
   * @param {HTMLElement} container - The container element to position.
   */
  repositionContainer(slotId, container) {
    const containerDefaults = {
      1: { fromTop: -20, fromSide: 0 },
      2: { fromTop: 20, fromSide: 0 },
      3: { fromTop: 120, fromSide: 50 },
      4: { fromTop: 130, fromSide: 250 },
      5: { fromTop: 170, fromSide: 315 },
      6: { fromTop: 150, fromSide: 300 },
      7: { fromTop: 0, fromSide: 370 },
      8: { fromTop: 10, fromSide: 370 }  
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

  /**
   * Returns the centre coordinates of a DOM element relative to the viewport.
   * @param {HTMLElement} el - The element.
   * @returns {{x: number, y: number}} The centre point.
   */
  getCenter(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  /**
   * Applies a translate transformation to an element, optionally with animation.
   * @param {HTMLElement} element - The element to transform.
   * @param {number} dx - The X translation (px).
   * @param {number} dy - The Y translation (px).
   * @param {boolean} animate - Whether to animate the transition.
   */
  setTranslate(element, dx, dy, animate = true) {
    if (!animate) {
      element.style.transition = 'none';
    }
    element.style.transform = `translate(${dx}px, ${dy}px)`;
    if (!animate) {
      void element.offsetHeight; // force reflow
      element.style.transition = '';
    }
  }

  /**
   * Creates a chibi element for a user in a given slot.
   * If the element already exists, it is shown and returned.
   * @param {string} userId - The user ID.
   * @param {string} slotId - The slot ID.
   * @param {boolean} [isGM=false] - Whether this is the GM chibi.
   * @param {boolean} [isNPC=false] - Whether this is an NPC chibi.
   * @returns {HTMLElement|null} The created or existing chibi element, or `null` if the container is missing.
   */
  createChibiElement(userId, slotId, isGM = false, isNPC = false) {
    const container = document.getElementById('chibi-slot-' + slotId);
    if (!container) return null;

    if (!isGM && !isNPC) {
      // Remove other chibis in the container (should only happen when slot is reused)
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

  /**
   * Updates the appearance (image, companion, mirroring) of a player chibi based on current data.
   * @param {string} userId - The user ID.
   * @param {HTMLElement} element - The chibi DOM element.
   * @param {string} slotId - The current slot ID.
   */
  updateChibiAppearance(userId, element, slotId) {
    const player = this.dataManager.getPlayerByUserId(userId);
    if (!player) return;

    const img = element.querySelector('img');
    const compDiv = element.querySelector('.companion');
    const compImg = compDiv.querySelector('img');

    let imgSrc = player.chibiImg;
    const alternates = [{ id: 'combat', name: 'Combat', img: player.combatImg || player.chibiImg }, { id: 'downed', name: 'Downed', img: player.downedImg }].concat(player.alternates || []);
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

  /**
   * Updates the GM chibi appearance from the GM data.
   * @param {HTMLElement} element - The GM chibi DOM element.
   */
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

  /**
   * Updates the NPC chibi appearance from the NPC data.
   * @param {HTMLElement} element - The NPC chibi DOM element.
   * @param {string} npcId - The NPC ID.
   */
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

  /**
   * Moves a chibi from its current container to a new slot, animating the transition.
   * @param {Object} item - The chibi item object.
   * @param {string} newSlotId - The target slot ID.
   * @param {boolean} animate - Whether to animate the movement.
   */
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

  /**
   * Flips a player's chibi image or companion image, or switches to an alternate chibi set.
   * @param {string} userId - The user ID.
   * @param {boolean} [isCompanion=false] - If `true`, flips the companion image; otherwise changes the main chibi.
   * @param {string|null} [alternateId=null] - The alternate set ID (e.g., 'combat', 'downed'). Ignored if `isCompanion` is `true`.
   */
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

  /**
   * Flips the GM chibi image or companion.
   * @param {boolean} [isCompanion=false] - If `true`, flips the companion; otherwise changes the main chibi.
   * @param {string|null} [alternateId=null] - Alternate set ID (e.g., 'combat', 'downed').
   */
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

  /**
   * Shows or hides the GM chibi.
   * @param {boolean} show - `true` to show, `false` to hide.
   */
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

  /**
   * Shows or hides the NPC chibi.
   * @param {boolean} show - `true` to show, `false` to hide.
   * @param {string} [npcId] - The NPC ID to display (required when showing).
   */
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

  /**
   * Clears all player chibis and resets the slot manager.
   */
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

  /**
   * Cancels a pending removal of a chibi, restoring it to visible state.
   * @param {string} userId - The user ID.
   * @returns {boolean} `true` if a removal was cancelled, otherwise `false`.
   */
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

  /**
   * Initiates removal of a chibi with a fade‑out animation, then frees its slot and triggers a reflow.
   * @param {string} userId - The user ID.
   * @param {Function} [callback] - Optional callback invoked after removal and reflow are complete.
   */
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

  /**
   * Returns the chibi DOM element for a given user, if it exists.
   * @param {string} userId - The user ID.
   * @returns {HTMLElement|null} The chibi element, or `null`.
   */
  getChibiElement(userId) {
    const item = this.chibiItems[userId];
    return item ? item.element : null;
  }

  /**
   * Clears all chibis (players, GM, NPC) and resets the slot manager.
   */
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


/**
 * ============================================================
 * 4. EFFECT MANAGER
 * ============================================================
 */

/**
 * Manages the display of visual effects (animations) on predefined overlay slots.
 * Effects can be triggered, automatically removed after a duration, and support stacking with replacement.
 */
class EffectManager {
  /**
   * Creates a new EffectManager.
   * Initialises the mapping of effect slot identifiers to container element IDs.
   */
  constructor() {
    /**
     * Mapping of effect slot names to their corresponding DOM element IDs.
     * @type {Object<string, string>}
     */
    this.effectSlotMap = {
      'left': 'chibi-over-effect-left',
      'right': 'chibi-over-effect-right',
      'main': 'chibi-slot-effect',
      'under': 'chibi-under-bar'
    };

    /**
     * Active effects by slot name.
     * @type {Object<string, {element: HTMLElement, timeout: number}>}
     */
    this.activeEffects = {};
  }

  /**
   * Triggers a visual effect in a specified slot, replacing any existing effect in that slot.
   * @param {Object} effect - The effect data object (must contain `slot`, `image`, and optionally `name`).
   * @param {number} duration - The duration in seconds for which the effect should be displayed.
   */
  triggerEffect(effect, duration) {
    const actualId = this.effectSlotMap[effect.slot];
    if (!actualId) return;

    // Remove any existing effect in the same slot
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
    img.alt = effect.name || 'effect';
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

  /**
   * Clears all currently active effects.
   */
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


/**
 * ============================================================
 * 5. ANIMATION MANAGER
 * ============================================================
 */

/**
 * Manages CSS animation classes for chibi elements (speaking, melee, ranged, etc.).
 * Applies an animation class to a chibi element and removes it after the animation ends.
 */
class AnimationManager {
  /**
   * Creates a new AnimationManager.
   * @param {ChibiManager} chibiManager - Reference to the chibi manager.
   * @param {DataManager} dataManager - Reference to the data manager.
   */
  constructor(chibiManager, dataManager) {
    this.chibiManager = chibiManager;
    this.dataManager = dataManager;
  }

  /**
   * Plays a named CSS animation on a character's chibi element.
   * @param {string} userId - The user ID, or 'gm'/'npc' for special characters.
   * @param {string} animationName - The animation name (must correspond to a CSS class `anim-<name>`).
   */
  playAnimation(userId, animationName) {
    let element = null;

    // Handle GM and NPC
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
      // First try to find a combat chibi wrapper
      const combatEl = document.querySelector(`.combat-chibi[data-userid="${userId}"] .combat-chibi-inner`);
      if (combatEl) {
        element = combatEl;
      } else {
        // Fallback to scenic chibi
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
      // Remove any existing animation classes
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


/**
 * ============================================================
 * 6. OVERLAY MANAGER
 * ============================================================
 */

/**
 * The central controller for the overlay UI.
 * Manages scenic/combat modes, background images, chibi placement, effect triggering, and user commands.
 * Handles speaking events, NPC display, impersonation, muting, and attack animations.
 */
class OverlayManager {
  /**
   * Creates a new OverlayManager.
   * @param {DataManager} dataManager - Reference to the data manager.
   * @param {SlotManager} slotManager - Reference to the slot manager.
   * @param {ChibiManager} chibiManager - Reference to the chibi manager.
   * @param {EffectManager} effectManager - Reference to the effect manager.
   * @param {AnimationManager} animationManager - Reference to the animation manager.
   */
  constructor(dataManager, slotManager, chibiManager, effectManager, animationManager) {
    this.dataManager = dataManager;
    this.slotManager = slotManager;
    this.chibiManager = chibiManager;
    this.effectManager = effectManager;
    this.animationManager = animationManager;

    /**
     * Whether the overlay is currently enabled (visible).
     * @type {boolean}
     */
    this.overlayEnabled = false;

    /**
     * Whether combat mode is active.
     * @type {boolean}
     */
    this.combatMode = false;

    /**
     * The overlay container DOM element.
     * @type {HTMLElement}
     */
    this.overlayEl = document.getElementById('chibi-overlay');

    /**
     * The NPC slot container DOM element.
     * @type {HTMLElement}
     */
    this.npcSlot = document.getElementById('chibi-slot-npc');

    /**
     * Timeout for auto‑hiding the GM chibi after speaking ends.
     * @type {number|null}
     */
    this.gmTimeout = null;

    /**
     * Timeout for removing the GM chibi after a delay.
     * @type {number|null}
     */
    this.gmRemovalTimer = null;

    /**
     * ID of the currently active NPC, if any.
     * @type {string|null}
     */
    this.activeNPC = null;

    /**
     * Whether the NPC is muted (prevents auto‑appearance).
     * @type {boolean}
     */
    this.npcMuted = false;

    /**
     * Combat chibi wrapper elements keyed by user ID.
     * @type {Object<string, HTMLElement>}
     */
    this.combatChibiWrappers = {};

    /**
     * Companion image elements in combat mode, keyed by user ID.
     * @type {Object<string, HTMLImageElement>}
     */
    this.combatCompanionElements = {};

    /**
     * Timeouts for removing the 'chibi-speaking' class after speech ends.
     * @type {Object<string, number>}
     */
    this.speakingTimeouts = {};

    /**
     * Timeouts for removing a chibi after speech timeout.
     * @type {Object<string, number>}
     */
    this.removalTimeouts = {};

    /**
     * The last set background ID (used when switching back from combat to scenic).
     * @type {string}
     */
    this.lastBackgroundId = "default";
  }

  /**
   * Enables the overlay in scenic mode, sets the default background, and shows the overlay.
   */
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

  /**
   * Disables the overlay, clears all chibis and effects, and hides the overlay.
   */
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

  /**
   * Switches to combat mode: clears scenic chibis, hides GM, renders combat chibis, and shows NPC as enemy.
   */
  setCombatMode() {
    if (!this.overlayEnabled) return;
    this.overlayEl.style.backgroundImage = '';
    this.combatMode = true;
    this.overlayEl.classList.remove('scenic-mode');

    const npcId = this.activeNPC;

    this.chibiManager.clearPlayerChibis();
    this.chibiManager.showGM(false);
    this.dataManager.gmData.alternateSet = 'combat';

    this.renderCombatChibis();
    this.npcSlot.classList.add('enemy');

    if (npcId) {
      this.activeNPC = npcId;
      this.chibiManager.showNPC(true, npcId);
    }
  }

  /**
   * Switches back to scenic mode: clears combat chibis, shows GM, and restores the last background.
   */
  setScenicMode() {
    if (!this.overlayEnabled) return;
    this.combatMode = false;

    const npcId = this.activeNPC;

    this.clearCombatChibis();
    this.dataManager.gmData.alternateSet = 'default';
    this.chibiManager.showGM(false);
    this.overlayEl.classList.add('scenic-mode');

    const defaultBg = this.dataManager.getBackground(this.lastBackgroundId || 'default');
    this.overlayEl.style.backgroundImage = defaultBg ? `url('${defaultBg.image}')` : '';

    this.npcSlot.classList.remove('enemy');

    if (npcId) {
      this.activeNPC = npcId;
      this.chibiManager.showNPC(true, npcId);
    }
  }

  /**
   * Sets the overlay background to a specific background ID (scenic mode only).
   * @param {string} bgId - The background ID, or 'clear'/'c' to clear the background.
   */
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

  /**
   * Renders the combat chibis for all players in the combat bar.
   * Uses player data to set images and companions, and mirrors right‑side chibis.
   */
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
        wrapper.classList.add('combat-mirrored');
      }
      playerIndex++;

      const inner = document.createElement('div');
      inner.className = 'combat-chibi-inner';
      let imgSrc = player.combatImg || player.chibiImg;
      if (player.alternateSet == 'downed') {
        imgSrc = player.downedImg;
      }
      if (player.alternateSet?.startsWith('combat-override-')) {
        const alt = player.alternates?.find(alt => alt.id === player.alternateSet);
        if (alt) {
          imgSrc = alt.img;
        }
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

  /**
   * Clears all combat chibis from the combat bar.
   */
  clearCombatChibis() {
    const chibiBar = document.getElementById('chibi-player-bar');
    if (chibiBar) {
      chibiBar.querySelectorAll('.combat-chibi').forEach(el => el.remove());
    }
    this.combatChibiWrappers = {};
    this.combatCompanionElements = {};
  }

  /**
   * Fills the scenic slots with a shuffled selection of players and shows GM and NPC.
   */
  fillTestSlots() {
    const savedNPC = this.activeNPC;
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
    if (savedNPC) {
      this.activeNPC = savedNPC;
      this.chibiManager.showNPC(true, savedNPC);
    }
  }

  /**
   * Clears all test slots (players, GM, NPC) and resets related state.
   */
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

  /**
   * Handles the start of a speaking event for a user.
   * Shows their chibi (or flashes it in combat mode), assigns a slot if needed, and starts the speak animation.
   * @param {string} userId - The user ID.
   */
  handleSpeakingStart(userId) {
    // GM handling
    if (userId === this.dataManager.gmData.userId) {
      if (!this.dataManager.gmData.muted) {
        if (this.gmTimeout) {
          clearTimeout(this.gmTimeout);
          this.gmTimeout = null;
        }
        if (this.gmRemovalTimer) {
          clearTimeout(this.gmRemovalTimer);
          this.gmRemovalTimer = null;
        }
        this.chibiManager.showGM(true);
  
        if (this.chibiManager.gmChibiElement) {
          this.chibiManager.gmChibiElement.classList.add('chibi-speaking');
        }
      }
      if (this.activeNPC && !this.npcMuted) {
        this.chibiManager.showNPC(true, this.activeNPC);
        if (this.chibiManager.npcChibiElement) {
          this.chibiManager.npcChibiElement.classList.add('chibi-speaking');
        }
      }
      return;
    }

    const player = this.dataManager.getPlayerByUserId(userId);
    if (!player || player.muted) return;

    // Combat mode: just toggle speaking class on combat wrapper
    if (this.combatMode) {
      const wrapper = this.combatChibiWrappers[userId];
      if (wrapper) {
        const inner = wrapper.querySelector('.combat-chibi-inner');
        if (inner) inner.classList.add('chibi-speaking');
      }
      return;
    }

    // Scenic mode: force any pending move to complete, then show/create chibi
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

  /**
   * Handles the end of a speaking event for a user.
   * Removes the speaking class and schedules removal of the chibi after a delay.
   * @param {string} userId - The user ID.
   */
  handleSpeakingEnd(userId) {
    // GM handling
    if (userId === this.dataManager.gmData.userId) {
      if (!this.dataManager.gmData.muted) {
        if (this.gmTimeout) {
          clearTimeout(this.gmTimeout);
          this.gmTimeout = null;
        }
        if (this.chibiManager.gmChibiElement) {
          this.chibiManager.gmChibiElement.classList.remove('chibi-speaking');
        }
        this.gmTimeout = setTimeout(() => {
          this.chibiManager.showGM(false);
          if (!this.npcMuted) {
            this.chibiManager.showNPC(false);
          }
          this.gmTimeout = null;
        }, 3000);
      }
      if (this.chibiManager.npcChibiElement && !this.npcMuted) {
        this.chibiManager.npcChibiElement.classList.remove('chibi-speaking');
      }
      return;
    }

    const player = this.dataManager.getPlayerByUserId(userId);
    if (!player || player.muted) return;

    // Combat mode: remove speaking class
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

  /**
   * Immediately removes a speaking user's chibi (after speech timeout).
   * @param {string} userId - The user ID.
   */
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

  /**
   * Shows an NPC by ID or clears the NPC display.
   * @param {string} npcId - The NPC ID or 'clear' to hide.
   */
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

  /**
   * Impersonates a character by forcing their chibi to appear and speak briefly.
   * @param {string} charName - The character name (player, 'gm', or NPC).
   */
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

  /**
   * Mutes a character or all characters.
   * @param {string} charName - Character name, 'gm', 'npc', or 'all'.
   */
  mute(charName) {
    if (charName === 'all') {
      this.handleSpeakingEnd(this.dataManager.gmData.userId);
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
      return;
    }
    const resolved = this.dataManager.resolveCharacter(charName);
    if (resolved && resolved.type === 'player') {
      const userId = resolved.data.userId;
      this.removeSpeakingUser(userId);
      resolved.data.muted = true;
    }
  }

  /**
   * Unmutes a character or all characters.
   * @param {string} charName - Character name, 'gm', 'npc', or 'all'.
   */
  unmute(charName) {
    if (charName === 'gm') {
      this.dataManager.gmData.muted = false;
      return;
    }
    if (charName === 'npc') {
      this.npcMuted = false;
      return;
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

  /**
   * Removes a character's chibi immediately.
   * @param {string} charName - Character name, 'gm', or player name.
   */
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

  /**
   * Flips a player's chibi to an alternate set or the GM's chibi.
   * @param {string} charName - Character name or 'gm'.
   * @param {string} [alternateId] - The alternate set ID (e.g., 'combat', 'downed').
   */
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

  /**
   * Flips the companion image of a character (or GM).
   * @param {string} charName - Character name or 'gm'.
   */
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

  /**
   * Triggers an effect by name with an optional duration.
   * @param {string} effectName - The effect ID or group name.
   * @param {number} [duration] - Duration in seconds (overrides effect default).
   */
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

  /**
   * Triggers multiple effects from a comma‑separated list.
   * @param {Array<string>} names - Array of effect IDs or group names.
   */
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

  /**
   * Clears all active effects.
   */
  clearEffects() {
    this.effectManager.clearAllEffects();
  }

  /**
   * Plays an animation on a character.
   * @param {string} charName - Character name, 'gm', or 'npc'.
   * @param {string} animName - Animation name (must correspond to a CSS class).
   */
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

  /**
   * Performs a melee attack animation from a player toward the active NPC.
   * @param {string} charName - The attacking player's name.
   */
  performMeleeAttack(charName) {
    const resolved = this.dataManager.resolveCharacter(charName);
    if (!resolved || resolved.type !== 'player') {
      console.warn(`Melee attack: player "${charName}" not found.`);
      return;
    }
    const userId = resolved.data.userId;
    const attackerEl = this._getCharacterElement(charName, userId);
    if (!attackerEl) {
      console.warn(`Melee attack: no chibi element for "${charName}"`);
      return;
    }

    const npcEl = this.chibiManager.npcChibiElement;
    if (!npcEl || !npcEl.parentNode) {
      this.animationManager.playAnimation(userId, 'melee');
      return;
    }

    this._performMeleeMovement(attackerEl, npcEl, userId);
  }

  /**
   * Performs a ranged attack animation from a player toward the active NPC.
   * @param {string} charName - The attacking player's name.
   * @param {string} [projectileId] - The projectile image ID (or 'default').
   */
  performRangedAttack(charName, projectileId) {
    const resolved = this.dataManager.resolveCharacter(charName);
    if (!resolved || resolved.type !== 'player') {
      console.warn(`Ranged attack: player "${charName}" not found.`);
      return;
    }
    const userId = resolved.data.userId;
    const player = resolved.data;
    const attackerEl = this._getCharacterElement(charName, userId);
    if (!attackerEl) {
      console.warn(`Ranged attack: no chibi element for "${charName}"`);
      return;
    }

    const npcEl = this.chibiManager.npcChibiElement;
    if (!npcEl || !npcEl.parentNode) {
      this.animationManager.playAnimation(userId, 'ranged');
      return;
    }

    const attackerRect = attackerEl.getBoundingClientRect();
    const npcRect = npcEl.getBoundingClientRect();
    const startX = attackerRect.left + attackerRect.width / 2;
    const startY = attackerRect.top + attackerRect.height / 2;
    const endX = npcRect.left + npcRect.width / 2;
    const endY = npcRect.top + npcRect.height / 2;

    let imageUrl = null;
    if (projectileId !== 'default') {
      const projectileImg = player.projectileImgs?.find(img => img.id === projectileId);
      if (projectileImg) imageUrl = projectileImg.img;
    }

    this.animationManager.playAnimation(userId, 'ranged');

    setTimeout(() => {
      this._createProjectile(startX, startY, endX, endY, imageUrl);
    }, 400);
  }

  /**
   * Performs a melee attack from the active NPC toward a target player.
   * @param {string} targetPlayerName - The target player's name.
   */
  performNPCMeleeAttack(targetPlayerName) {
    const npcEl = this.chibiManager.npcChibiElement;
    if (!npcEl) {
      console.warn('No NPC is currently displayed. Use /npc <name> first.');
      return;
    }
    if (!this.activeNPC) {
      console.warn('Active NPC not set.');
      return;
    }

    const targetResolved = this.dataManager.resolveCharacter(targetPlayerName);
    if (!targetResolved || targetResolved.type !== 'player') {
      console.warn(`Target player "${targetPlayerName}" not found.`);
      return;
    }
    const targetUserId = targetResolved.data.userId;
    const targetEl = this._getTargetElement(targetPlayerName, targetUserId);
    if (!targetEl) {
      console.warn(`Target chibi for "${targetPlayerName}" not found.`);
      return;
    }

    this._performMeleeMovement(npcEl, targetEl, 'npc');
  }

  /**
   * Performs a ranged attack from the active NPC toward a target player.
   * @param {string} targetPlayerName - The target player's name.
   */
  performNPCRangedAttack(targetPlayerName) {
    const npcEl = this.chibiManager.npcChibiElement;
    if (!npcEl) {
      console.warn('No NPC is currently displayed. Use /npc <name> first.');
      return;
    }
    if (!this.activeNPC) {
      console.warn('Active NPC not set.');
      return;
    }

    const targetResolved = this.dataManager.resolveCharacter(targetPlayerName);
    if (!targetResolved || targetResolved.type !== 'player') {
      console.warn(`Target player "${targetPlayerName}" not found.`);
      return;
    }
    const targetUserId = targetResolved.data.userId;
    const targetEl = this._getTargetElement(targetPlayerName, targetUserId);
    if (!targetEl) {
      console.warn(`Target chibi for "${targetPlayerName}" not found.`);
      return;
    }

    const npc = this.dataManager.getNPC(this.activeNPC);
    if (!npc) {
      console.warn('Active NPC data not found.');
      return;
    }

    const npcRect = npcEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const startX = npcRect.left + npcRect.width / 2;
    const startY = npcRect.top + npcRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const imageUrl = npc.projectileImg || null;

    this.animationManager.playAnimation('npc', 'ranged');

    setTimeout(() => {
      this._createProjectile(startX, startY, endX, endY, imageUrl);
    }, 400);
  }

  /**
   * Internal helper: returns the chibi DOM element for a character.
   * @param {string} charName - Character name.
   * @param {string} userId - User ID (for players).
   * @returns {HTMLElement|null} The chibi element, or `null`.
   * @private
   */
  _getCharacterElement(charName, userId) {
    if (charName === 'npc') {
      return this.chibiManager.npcChibiElement;
    }
    if (charName === 'gm') {
      return this.chibiManager.gmChibiElement;
    }
    if (this.combatMode) {
      const wrapper = this.combatChibiWrappers[userId];
      return wrapper ? wrapper : null;
    } else {
      const item = this.chibiManager.chibiItems[userId];
      if (item && !item.removing) return item.element;
      return null;
    }
  }

  /**
   * Internal helper: returns the target chibi element for a target name.
   * @param {string} targetName - Target name (player or 'npc').
   * @param {string} targetUserId - User ID (for players).
   * @returns {HTMLElement|null} The chibi element, or `null`.
   * @private
   */
  _getTargetElement(targetName, targetUserId) {
    if (targetName === 'npc') {
      return this.chibiManager.npcChibiElement;
    }
    if (this.combatMode) {
      const wrapper = this.combatChibiWrappers[targetUserId];
      return wrapper ? wrapper : null;
    } else {
      const item = this.chibiManager.chibiItems[targetUserId];
      if (item && !item.removing) return item.element;
      return null;
    }
  }

  /**
   * Internal helper: performs a melee movement animation (lunge) between two chibi elements.
   * @param {HTMLElement} attackerEl - The attacker's chibi element.
   * @param {HTMLElement} targetEl - The target's chibi element.
   * @param {string} [animUserId] - The user ID for the attack animation (optional).
   * @param {Function} [callback] - Optional callback after animation completes.
   * @private
   */
  _performMeleeMovement(attackerEl, targetEl, animUserId, callback) {
    if (!attackerEl || !targetEl) {
      if (animUserId) this.animationManager.playAnimation(animUserId, 'melee');
      if (callback) callback();
      return;
    }

    const attackerRect = attackerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const attackerCenter = {
      x: attackerRect.left + attackerRect.width / 2,
      y: attackerRect.top + attackerRect.height / 2
    };
    const targetCenter = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };

    const dx = targetCenter.x - attackerCenter.x;
    const dy = targetCenter.y - attackerCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 20) {
      if (animUserId) this.animationManager.playAnimation(animUserId, 'melee');
      if (callback) callback();
      return;
    }

    const factor = 0.9;
    const moveX = dx * factor;
    const moveY = dy * factor;

    let baseX = 0, baseY = 0;
    let baseTransform = '';
    const isMirrored = this.combatMode && attackerEl.classList.contains('combat-mirrored');

    if (this.combatMode) {
      baseTransform = isMirrored ? 'scaleX(-1)' : 'translate(0, 0)';
    } else {
      const transform = attackerEl.style.transform || '';
      const match = transform.match(/translate\(\s*([-0-9.]+)px\s*,\s*([-0-9.]+)px\s*\)/);
      if (match) {
        baseX = parseFloat(match[1]);
        baseY = parseFloat(match[2]);
        baseTransform = `translate(${baseX}px, ${baseY}px)`;
      } else {
        baseTransform = 'translate(0, 0)';
      }
    }

    let keyframes;
    if (isMirrored) {
      keyframes = [
        { transform: 'scaleX(-1)' },
        { transform: `translate(${moveX}px, ${moveY}px) scaleX(-1)` },
        { transform: `translate(${moveX + 10}px, ${moveY - 5}px) scaleX(-1)` },
        { transform: `translate(${moveX}px, ${moveY}px) scaleX(-1)` },
        { transform: 'scaleX(-1)' }
      ];
    } else {
      const start = baseTransform;
      const mid = `translate(${baseX + moveX}px, ${baseY + moveY}px)`;
      const impact = `translate(${baseX + moveX + 10}px, ${baseY + moveY - 5}px)`;
      keyframes = [
        { transform: start },
        { transform: mid },
        { transform: impact },
        { transform: mid },
        { transform: start }
      ];
    }

    const savedTransition = attackerEl.style.transition;
    attackerEl.style.transition = 'none';

    const animation = attackerEl.animate(keyframes, {
      duration: 600,
      easing: 'ease-in-out',
      fill: 'forwards'
    });

    if (animUserId) this.animationManager.playAnimation(animUserId, 'melee');

    animation.onfinish = () => {
      attackerEl.style.transition = savedTransition || '';
      if (isMirrored) {
        attackerEl.style.transform = 'scaleX(-1)';
      } else {
        attackerEl.style.transform = baseTransform;
      }
      if (callback) callback();
    };
  }

  /**
   * Internal helper: creates a projectile element that flies from start to end with an arc.
   * @param {number} startX - Start X coordinate (viewport).
   * @param {number} startY - Start Y coordinate (viewport).
   * @param {number} endX - End X coordinate (viewport).
   * @param {number} endY - End Y coordinate (viewport).
   * @param {string|null} imageUrl - Optional image URL for the projectile.
   * @param {Function} [onComplete] - Callback after projectile reaches target.
   * @private
   */
  _createProjectile(startX, startY, endX, endY, imageUrl, onComplete) {
    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.pointerEvents = 'none';
    projectile.style.zIndex = '999';
    projectile.style.left = '0px';
    projectile.style.top = '0px';

    const useImage = !!imageUrl;
    let offset = 15;
    if (useImage) {
      offset = 40;
      projectile.style.width = '80px';
      projectile.style.height = '80px';
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      projectile.appendChild(img);
      const angle = Math.atan2(endY - startY, endX - startX);
      projectile.style.transform = `rotate(${angle}rad)`;
      projectile.style.transformOrigin = 'center center';
    } else {
      projectile.style.width = '30px';
      projectile.style.height = '30px';
      projectile.style.borderRadius = '50%';
      projectile.style.background = 'radial-gradient(circle, #ffdd44, #ff8800)';
      projectile.style.boxShadow = '0 0 30px #ffaa00, 0 0 60px #ff8800';
      projectile.style.transform = 'translate(-50%, -50%)';
    }

    projectile.style.left = (startX - offset) + 'px';
    projectile.style.top = (startY - offset) + 'px';
    document.body.appendChild(projectile);

    const getArcHeight = (y1, y2) => Math.min(Math.abs(y1 - y2) * 0.03, 10);
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - getArcHeight(startY, endY);
    const quarterX = (startX + midX) / 2;
    const quarterY = (startY + midY) / 2 - getArcHeight(startY, midY) * 0.5;
    const threeQuarterX = (midX + endX) / 2;
    const threeQuarterY = (midY + endY) / 2 - getArcHeight(midY, endY) * 0.5;

    const keyframes = [
      { left: (startX - offset) + 'px', top: (startY - offset) + 'px' },
      { left: (quarterX - offset) + 'px', top: (quarterY - offset) + 'px' },
      { left: (midX - offset) + 'px', top: (midY - offset) + 'px' },
      { left: (threeQuarterX - offset) + 'px', top: (threeQuarterY - offset) + 'px' },
      { left: (endX - offset) + 'px', top: (endY - offset) + 'px' }
    ];

    const timing = {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    const anim = projectile.animate(keyframes, timing);
    anim.onfinish = () => {
      if (projectile.parentNode) projectile.remove();
      if (onComplete) onComplete();
    };

    setTimeout(() => {
      if (projectile.parentNode) projectile.remove();
    }, 1500);
  }
}


/**
 * ============================================================
 * 7. WEBSOCKET MANAGER
 * ============================================================
 */

/**
 * Manages the WebSocket connection to receive real‑time voice activity and commands.
 * Forwards speaking start/end events to the OverlayManager and processes command messages.
 */
class WebSocketManager {
  /**
   * Creates a new WebSocketManager and initiates the connection.
   * @param {OverlayManager} overlayManager - Reference to the overlay manager.
   */
  constructor(overlayManager) {
    this.overlayManager = overlayManager;
    this.ws = null;
    this.url = 'ws://127.0.0.1:8080';
    this.init();
  }

  /**
   * Initialises the connection (currently uses a fixed URL, but can be overridden).
   */
  init() {
    // Optionally use window.location to construct the URL for production.
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    this.url = wsUrl;
    this.connect();
  }

  /**
   * Establishes the WebSocket connection and sets up event handlers.
   * Automatically reconnects on close with a 3‑second delay.
   */
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

          // Update player cards in the UI (speaking indicator)
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

          // Only process overlay events if the overlay is enabled, except for commands.
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


/**
 * ============================================================
 * 8. COMMAND PROCESSOR
 * ============================================================
 */

/**
 * Parses and executes slash commands received from the WebSocket.
 * Dispatches commands to the OverlayManager with appropriate arguments.
 */
class CommandProcessor {
  /**
   * Creates a new CommandProcessor.
   * @param {OverlayManager} overlayManager - Reference to the overlay manager.
   */
  constructor(overlayManager) {
    this.overlayManager = overlayManager;
  }

  /**
   * Processes a raw command string.
   * @param {string} rawCommand - The full command line (e.g., `/chibi test`).
   */
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

  /**
   * Handles `/chibi` or `/c` command.
   * Supports subcommands: on, off, test, testoff, combat, scenic.
   * @param {Array<string>} args - Command arguments.
   */
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

  /**
   * Handles `/flip` or `/f` command.
   * Syntax: `/flip <character> [alternateId]`.
   * @param {Array<string>} args - Command arguments.
   */
  handleFlip(args) {
    if (args.length === 0) return;
    const charName = args[0];
    const alternateId = args[1] || 'default';
    this.overlayManager.flip(charName, alternateId);
  }

  /**
   * Handles `/compflip` or `/cf` command.
   * Syntax: `/compflip <character>`.
   * @param {Array<string>} args - Command arguments.
   */
  handleCompFlip(args) {
    if (args.length === 0) return;
    const charName = args.join(' ');
    this.overlayManager.compFlip(charName);
  }

  /**
   * Handles `/npc` or `/n` command.
   * Syntax: `/npc <npcName>` or `/npc clear`.
   * @param {Array<string>} args - Command arguments.
   */
  handleNPC(args) {
    if (args.length === 0) return;
    const npcName = args.join(' ');
    this.overlayManager.showNPC(npcName);
  }

  /**
   * Handles `/effect` or `/e` command.
   * Syntax: `/effect <effectName> [duration]`.
   * @param {Array<string>} args - Command arguments.
   */
  handleEffect(args) {
    if (args.length === 0) return;
    const effectName = args[0];
    let duration = parseInt(args[1]);
    this.overlayManager.triggerEffect(effectName, duration);
  }

  /**
   * Handles `/effects` or `/es` command.
   * Syntax: `/effects <effect1, effect2, ...>` or `/effects clear`.
   * @param {Array<string>} args - Command arguments.
   */
  handleEffects(args) {
    if (args.length === 0) return;
    if (args[0].toLowerCase() === 'clear' || args[0].toLowerCase() === 'c') {
      this.overlayManager.clearEffects();
      return;
    }
    this.overlayManager.triggerMultipleEffects(args);
  }

  /**
   * Handles `/background` or `/bg` command.
   * Syntax: `/background <bgId>` or `/background clear`.
   * @param {Array<string>} args - Command arguments.
   */
  handleBackground(args) {
    if (args.length === 0) {
      this.overlayManager.setBackground('clear');
      return;
    }
    const bgId = args[0];
    this.overlayManager.setBackground(bgId);
  }

  /**
   * Handles `/pop` or `/p` command.
   * Syntax: `/pop <character>`.
   * @param {Array<string>} args - Command arguments.
   */
  handlePop(args) {
    if (args.length === 0) return;
    const charName = args.join(' ');
    this.overlayManager.pop(charName);
  }

  /**
   * Handles `/impersonate` or `/i` command.
   * Syntax: `/impersonate <character>`.
   * @param {Array<string>} args - Command arguments.
   */
  handleImpersonate(args) {
    if (args.length === 0) return;
    const charName = args.join(' ');
    this.overlayManager.impersonate(charName);
  }

  /**
   * Handles `/mute` or `/m` command.
   * Syntax: `/mute <character|gm|npc|all>`.
   * @param {Array<string>} args - Command arguments.
   */
  handleMute(args) {
    if (args.length === 0) return;
    const charName = args.join(' ');
    this.overlayManager.mute(charName);
  }

  /**
   * Handles `/unmute` or `/um` command.
   * Syntax: `/unmute <character|gm|npc|all>`.
   * @param {Array<string>} args - Command arguments.
   */
  handleUnmute(args) {
    if (args.length === 0) return;
    const charName = args.join(' ');
    this.overlayManager.unmute(charName);
  }

  /**
   * Handles `/animation` or `/a` command.
   * Syntax: `/animation <name> <character> [target|projectileId]`.
   * Special attacks: 'melee' and 'ranged' require a target for NPCs.
   * @param {Array<string>} args - Command arguments.
   */
  handleAnimation(args) {
    if (args.length < 2) {
      console.warn('Usage: /animation <name> <character> [target|projectileId]');
      return;
    }
    const animName = args[0].toLowerCase();
    const charName = args[1].toLowerCase();
    const targetOrProjectile = args[2] || null;
    const combatAnim = animName === 'melee' || animName === 'ranged';

    if (combatAnim && charName === 'npc') {
      if (!targetOrProjectile) {
        console.warn('NPC attack requires a target player: /animation melee npc <targetPlayer>');
        return;
      }
      if (animName === 'melee') {
        this.overlayManager.performNPCMeleeAttack(targetOrProjectile);
      } else if (animName === 'ranged') {
        this.overlayManager.performNPCRangedAttack(targetOrProjectile);
      } else {
        this.overlayManager.playAnimationForChar('npc', animName);
      }
      return;
    }

    const resolved = this.overlayManager.dataManager.resolveCharacter(charName);
    if ((resolved && resolved.type === 'npc') || charName === 'npc') {
      if (combatAnim && !targetOrProjectile) {
        console.warn('NPC attack requires a target player.');
        return;
      }
      if (animName === 'melee') {
        this.overlayManager.performNPCMeleeAttack(targetOrProjectile);
      } else if (animName === 'ranged') {
        this.overlayManager.performNPCRangedAttack(targetOrProjectile);
      } else {
        this.overlayManager.playAnimationForChar('npc', animName);
      }
      return;
    }

    if (animName === 'melee') {
      this.overlayManager.performMeleeAttack(charName);
    } else if (animName === 'ranged') {
      const projectileId = targetOrProjectile || 'default';
      this.overlayManager.performRangedAttack(charName, projectileId);
    } else {
      this.overlayManager.playAnimationForChar(charName, animName);
    }
  }
}


/**
 * ============================================================
 * 9. UI HELPERS
 * ============================================================
 */

/**
 * Renders player cards in the UI bar from the data manager.
 * Each card shows the player's avatar, name, class skill, and a speaking indicator.
 * @param {DataManager} dataManager - The data manager instance.
 */
function renderPlayerCards(dataManager) {
  const playerBar = document.getElementById('player-bar');
  if (!playerBar) return;

  playerBar.querySelectorAll('.card.player').forEach(card => card.remove());

  dataManager.playersData.forEach(player => {
    const cardContainer = document.createElement('div');
    cardContainer.className = `card container player ${player.cssClass}`;
    cardContainer.style.backgroundSize = 'cover';
    cardContainer.style.backgroundRepeat = 'no-repeat';
    cardContainer.style.backgroundPosition = 'center';
    cardContainer.style.backdropFilter = 'blur(10px)';

    const card = document.createElement('div');
    card.className = `card player ${player.cssClass}`;
    card.setAttribute('data-userid', player.userId);
    card.style.backgroundImage = `url(${player.avatar})`;
    card.style.backgroundSize = 'contain';
    card.style.backgroundRepeat = 'no-repeat';
    card.style.backgroundPosition = 'center';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = player.name;

    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill';
    skillDiv.textContent = player.classSkill;

    card.appendChild(nameDiv);
    card.appendChild(skillDiv);
    playerBar.appendChild(card);
  });
  console.log('✅ Fantasy player cards dynamically generated (compact vertical layout)!');
}

/**
 * Adds ambient visual effects to the main content: occasional glowing particles and a pulse on the description border.
 */
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


/**
 * ============================================================
 * 10. INITIALISATION
 * ============================================================
 */

/**
 * Initialises the entire overlay system:
 * - Creates all managers and connects them.
 * - Renders player cards and ambient effects.
 * - Exposes the command processor globally.
 * - Starts the WebSocket connection.
 */
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

  // Fallback for GM avatar if it fails to load
  const gmImg = document.querySelector('.card.gm img');
  if (gmImg && gmImg.src.includes('poor.png')) {
    gmImg.onerror = function() {
      this.src = 'https://via.placeholder.com/180x180?text=Game+Master';
    };
  }

  console.log('✅ Overlay system initialized with synchronous test fill and race condition fixes.');
}

// Ensure initialisation occurs after the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}