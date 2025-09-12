const app = {
    allElements: null,
    colorModeCheckbox: null,
    currentFilter: null,
    currentSelection: null,
    currentSubclass: null, // Track subclass for auto-scrolling
    continentData: [],
    relationData: [],
    navigationHistory: [], // Track navigation history
    worldHistoryData: [], // World history timeline data
    guildData: null, // Guild information data
    guildStaffData: [], // Guild staff data
    guildMembersData: [], // Guild members data
    questReportsData: [], // Quest reports data
    currentGuildView: 'overview', // Track current guild view
    raceHierarchy: {
        "Aarakocra": [],
        "Aasimar": ["Fallen", "Protector", "Scourge"],
        "Autognome": [],
        "Bugbear": [],
        "Centaur": [],
        "Changeling": [],
        "Dhampir": [],
        "Dragonborn": {
            "Chromatic": ["Black", "Blue", "Green", "Red", "White"],
            "Metallic": ["Brass", "Bronze", "Copper", "Gold", "Silver"],
            "Gem": ["Amethyst", "Crystal", "Emerald", "Sapphire", "Topaz"]
        },
        "Dwarf": ["Hill", "Mountain", "Duergar"],
        "Elf": ["High", "Wood", "Dark (Drow)", "Sea", "Eladrin", "Shadar-kai", "Pallid", "Astral", "Mark of Shadow"],
        "Fairy": [],
        "Firbolg": [],
        "Genasi": ["Air", "Earth", "Fire", "Water"],
        "Giff": [],
        "Gith": ["Githyanki", "Githzerai"],
        "Goblin": [],
        "Goliath": [],
        "Hadozee": [],
        "Half-Elf": ["Aquatic", "Drow", "Moon", "Sun", "Wood"],
        "Half-Orc": [],
        "Halfling": ["Lightfoot", "Stout", "Ghostwise"],
        "Harengon": [],
        "Hexblood": [],
        "Hobgoblin": [],
        "Human": ["Variant", "Mark of Finding", "Mark of Handling", "Mark of Making", "Mark of Passage", "Mark of Sentinel"],
        "Kalashtar": [],
        "Kender": [],
        "Kenku": [],
        "Kobold": [],
        "Leonin": [],
        "Lizardfolk": [],
        "Loxodon": [],
        "Minotaur": [],
        "Orc": [],
        "Owlin": [],
        "Plasmoid": [],
        "Reborn": [],
        "Satyr": [],
        "Shifter": ["Beasthide", "Longtooth", "Swiftstride", "Wildhunt"],
        "Simic Hybrid": [],
        "Tabaxi": [],
        "Thri-kreen": [],
        "Tiefling": ["Asmodeus", "Baalzebul", "Dispater", "Fierna", "Glasya", "Levistus", "Mammon", "Mephistopheles", "Zariel"],
        "Tortle": [],
        "Triton": [],
        "Vedalken": [],
        "Warforged": [],
        "Yuan-ti": ["Pureblood"]
    },

    // Initialize the application
    async initializePage() {
        this.allElements = document.querySelectorAll('*');
        this.colorModeCheckbox = document.querySelector('#colorModeCheckbox');
        this.loadColorMode();
        await this.loadData();
        this.loadWorldDescription();
        this.loadWorldHistoryData();
        this.loadGuildData();
        await this.loadGuildStaffAndMembers();
        this.setupScrollListener();
        
        this.setupModalListeners();
        this.showSection('welcome-section');
    },

    // Setup scroll listener for jump-to-top button
    setupScrollListener() {
        window.addEventListener('scroll', () => {
            const jumpBtn = document.getElementById('jump-to-top');
            const detailsSection = document.getElementById('details-section');

            if (jumpBtn && detailsSection && detailsSection.classList.contains('active')) {
                // Show jump button when we've scrolled down significantly in the details section
                if (window.scrollY > 300) {
                    jumpBtn.style.display = 'block';
                } else {
                    jumpBtn.style.display = 'none';
                }
            } else if (jumpBtn) {
                jumpBtn.style.display = 'none';
            }
        });
    },

    

    // Setup modal event listeners
    setupModalListeners() {
        const modal = document.getElementById('timeline-modal');

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    // Jump to top function
    jumpToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    // Load world history data
    loadWorldHistoryData() {
        this.worldHistoryData = [
            {
                period: "0-100 Cycles",
                title: "The Bringing & First Settlements",
                summary: "The mysterious arrival of races from different realms and the desperate struggle for survival in a new world.",
                highlights: ["The Bringing Event", "Initial Settlements", "Plains Rebellion", "Resource Wars"],
                details: {
                    overview: "The most pivotal era in Alabastria's history, when countless races from different planes of existence suddenly found themselves in this strange new world. Confusion, desperation, and the will to survive drove the formation of the first settlements.",
                    events: [
                        {
                            name: "The Bringing",
                            description: "An unknown force or event simultaneously transported diverse races from their home realms to Alabastria. No records exist of what caused this phenomenon, leaving it as the greatest mystery of the world."
                        },
                        {
                            name: "Initial Settlements",
                            description: "Races scattered across the continents, settling where they could survive: Humans and halflings claimed Skratonia's fertile plains, hardy folk took to Bulsania's icy coasts, elves established coastal towns in Kuriguer while avoiding the dangerous forests, and mixed populations struggled in Kamalatman's varied terrain."
                        },
                        {
                            name: "Plains Rebellion",
                            description: "The first recorded major conflict, as humans and halflings in Skratonia united to defend their fertile lands from roaming beasts and desperate newcomers seeking resources."
                        },
                        {
                            name: "The Great Confusion",
                            description: "Many races initially attempted to return to their homelands, not understanding that The Bringing was permanent. This led to failed expeditions, wasted resources, and eventual acceptance of their new reality."
                        }
                    ],
                    continents: {
                        "Skratonia": "Became the most successful early settlement due to fertile plains. Humans, halflings, and half-orcs formed the first stable communities.",
                        "Bulsania": "Hardy races like dwarves, goliaths, and resilient humans carved out settlements in the icy coastal regions and mountain foothills.",
                        "Kuriguer": "Elves and gnomes established coastal towns but found the interior forests too dangerous to explore, leading to a cautious coastal civilization.",
                        "Kamalatman": "The most chaotic region, with mixed populations struggling across swamps, forests, and mountains. Early tribal formations began here.",
                        "Kantra": "Few dared explore this hellish landscape. Those who tried rarely returned, establishing its reputation as a forbidden land."
                    }
                }
            },
            {
                period: "100-300 Cycles",
                title: "Kingdom Formation & Early Wars",
                summary: "The rise of the first kingdoms and the conflicts that would shape continental politics for generations.",
                highlights: ["Skratonian Alliance", "Icebound Confederacy", "First Continental War", "Forest Clashes"],
                details: {
                    overview: "As populations stabilized and resources became more secure, the scattered settlements began to organize into larger political entities. This period saw the birth of the major kingdoms that still exist today, as well as the first large-scale wars between them.",
                    events: [
                        {
                            name: "Formation of the Skratonian Alliance",
                            description: "Multiple city-states across Skratonia's plains formed a council-based alliance, creating the first major democratic government in Alabastria. This system proved highly effective for managing the diverse populations."
                        },
                        {
                            name: "Rise of the Icebound Confederacy",
                            description: "The harsh conditions of Bulsania forged its inhabitants into a militarized confederation of strongholds, each maintaining independence while providing mutual defense."
                        },
                        {
                            name: "First Continental War",
                            description: "A major conflict between Skratonia and Bulsania over control of northern trade routes. The war lasted 30 cycles and established many of the military traditions still seen today."
                        },
                        {
                            name: "Kuriguer Forest Clashes",
                            description: "Multiple attempts by human settlers to claim Kuriguer's interior forests were repelled by elven defenders and the forests' own magical dangers, establishing the current territorial boundaries."
                        },
                        {
                            name: "The Kamalatman Unification",
                            description: "The three regions of Kamalatman - Katman, Alatman, and Maltman - were unified under a single kingdom, though each maintained distinct cultural identities."
                        }
                    ],
                    continents: {
                        "Skratonia": "Evolved from scattered settlements into the Skratonian Alliance, a confederation of city-states governed by elected councils.",
                        "Bulsania": "Formed the Icebound Confederacy, a military alliance of strongholds designed for survival in harsh conditions.",
                        "Kuriguer": "Elven coastal towns declared independence and established clear boundaries, while the dangerous interior remained wild.",
                        "Kamalatman": "The Kingdom of Kamalatman was established, unifying the three distinct regions under royal rule with heavy taxation systems.",
                        "Kantra": "Remained unexplored and mysterious, with failed expeditions adding to its fearsome reputation."
                    }
                }
            },
            {
                period: "300-600 Cycles",
                title: "Expansion & The Great Alliances",
                summary: "A golden age of diplomacy, trade, and magical discovery, marked by unprecedented cooperation between kingdoms.",
                highlights: ["Trade Routes", "Wyvern Wars", "Magic Surge", "Alatman Rebellions"],
                details: {
                    overview: "This era marked Alabastria's transition from survival-focused kingdoms to thriving civilizations. Trade networks flourished, magical phenomena attracted scholars and adventurers, and the first truly international conflicts required unprecedented cooperation.",
                    events: [
                        {
                            name: "The Great Trade Expansion",
                            description: "Established trade routes connected all major kingdoms, with Skratonia becoming the central hub. This period saw the rise of merchant guilds and the first international currency systems."
                        },
                        {
                            name: "The Wyvern Wars",
                            description: "A massive migration of wyverns from unknown lands threatened all civilizations. For the first time, Skratonia, Bulsania, and Kamalatman formed a military alliance, successfully driving back the wyvern threat and establishing precedent for future cooperation."
                        },
                        {
                            name: "Kuriguer's Magic Surge",
                            description: "Magical anomalies began appearing throughout Kuriguer's forests, attracting wizards, scholars, and adventurers from across the world. This led to the first magical academies and research institutions."
                        },
                        {
                            name: "The Alatman Resource Struggle",
                            description: "Heavy royal taxation on Alatman's valuable resources sparked a series of rebellions and uprisings, leading to the current tense political climate in the region."
                        },
                        {
                            name: "The First Mercenary Guilds",
                            description: "As trade and exploration expanded, professional adventuring and mercenary companies formed, with the Huntbound Order becoming the most respected among them."
                        }
                    ],
                    continents: {
                        "Skratonia": "Became the undisputed trade center of Alabastria, with its council system proving adaptable to international diplomacy.",
                        "Bulsania": "Maintained its isolationist tendencies but proved willing to cooperate during major threats, establishing its military reputation.",
                        "Kuriguer": "Transformed into a center of magical learning while maintaining the mystery and danger of its interior forests.",
                        "Kamalatman": "Grew wealthy from resource extraction but faced internal strife due to taxation policies, particularly in Alatman.",
                        "Kantra": "Remained forbidden, though some scholars theorized that the wyverns originated from this mysterious continent."
                    }
                }
            },
            {
                period: "600-800 Cycles",
                title: "The Modern Era",
                summary: "The current age of established civilizations, complex politics, and the ongoing mysteries that define contemporary Alabastria.",
                highlights: ["Modern Cities", "Guild Systems", "Political Tensions", "Unexplored Mysteries"],
                details: {
                    overview: "The current era represents the culmination of 800 cycles of growth, conflict, and adaptation. Most races are now multiple generations deep in Alabastrian culture, having developed distinct identities separate from their original homelands. Cities have grown into major population centers, trade networks span the known world, and complex political relationships define international affairs.",
                    events: [
                        {
                            name: "The Great Urban Expansion",
                            description: "Towns evolved into major cities, with advanced infrastructure, specialized districts, and populations in the tens of thousands. Skratonia's capital cities became marvels of engineering and governance."
                        },
                        {
                            name: "Guild Consolidation",
                            description: "Mercenary guilds, trade organizations, and craft unions became major political forces. The Huntbound Order gained quasi-governmental status in some regions."
                        },
                        {
                            name: "The Taxation Wars",
                            description: "Ongoing conflicts in Kamalatman over resource taxation have created a complex web of rebellions, negotiations, and uneasy truces that continue to this day."
                        },
                        {
                            name: "Modern Exploration Attempts",
                            description: "Advanced expeditions to Kantra using better equipment and magical protection still fail to return, deepening the mystery of what lies in the hellish continent."
                        },
                        {
                            name: "Cultural Renaissance",
                            description: "Art, literature, and philosophy flourished as societies moved beyond mere survival. Distinct Alabastrian cultures emerged, separate from ancestral traditions."
                        }
                    ],
                    continents: {
                        "Skratonia": "The most populous and politically complex continent, with council-led city-states managing diverse populations and serving as the hub of international trade and diplomacy.",
                        "Bulsania": "Maintains its confederation of militarized strongholds, remaining isolationist but respected for their military prowess and harsh frontier lifestyle.",
                        "Kuriguer": "Balances autonomous coastal towns with wild magical forests, becoming a destination for adventurers and magical researchers while maintaining elven independence.",
                        "Kamalatman": "A kingdom of contrasts - wealthy from resources but politically unstable due to taxation disputes, with each region (Katman, Alatman, Maltman) developing distinct identities.",
                        "Kantra": "Remains the greatest mystery of the modern world, with its hellish reputation keeping even the most advanced expeditions at bay."
                    }
                }
            }
        ];
    },

    // Load guild data
    loadGuildData() {
        this.guildData = {
            name: "The Huntbound Order",
            emblem: {
                description: "A circular ouroboros formed by a lion and a wyvern locked in eternal struggle, biting each other's tails. At the center stands a massive greataxe over a radiant burst — the War God Tempus's blessing. Blue and silver are their heraldic colors, though many tattoos and carved marks are rendered in stark black.",
                image: "GuildEmblem.png"
            },
            motto: "Bound by oath, tempered by steel, we hunt so the realm endures.",
            overview: "The Huntbound Order is a monster-hunting guild that straddles the line between mercenary band and knightly order. They are famous across the kingdom for answering calls the crown's armies cannot — slaying rampaging wyverns, hunting nightstalkers through villages, or rooting out beasts that lurk too close to trade routes and farmland. Their reputation is built not only on their results, but on their camaraderie: taverns ring with laughter when the Huntbound arrive, and bards find endless stories in their bloody victories and rowdy celebrations.",

            philosophy: "Tharos understands that guild members may use methods that go against his personal morals or his own way of handling situations. However, he firmly believes that those putting their lives on the line in the moment should be the ones to determine how they accomplish their mission, so long as they work toward the ultimate goal of saving the innocent from monsters. This pragmatic philosophy is why the guild's core values are intentionally broad and flexible, allowing for diverse alignments and approaches while maintaining unity of purpose.",

            history: {
                founding: {
                    year: "755 Cycles After The Bringing (45 years ago)",
                    founder: "Tharos Raggenthraw",
                    founder_details: "A 45-year-old Veteran Leonin War Cleric of Tempus (War God)",
                    founding_story: "Tharos had fought in the king's armies for decades, but grew frustrated seeing villages abandoned to monsters while soldiers marched to foreign wars. The final straw came when he found a wyvern terrorizing a defenseless village. After slaying it alone, his armor torn and face scarred, he planted his banner and declared: 'If soldiers cannot answer the call, then we will. Any who would hunt the horrors of the dark — stand with me, and let us be bound by this oath.'"
                },
                timeline: [
                    {
                        period: "755-760 Cycles",
                        title: "The Founding Years",
                        events: ["Tharos slays the village wyvern", "First oath sworn", "Initial recruits gather", "Basic operations begin"]
                    },
                    {
                        period: "760-780 Cycles",
                        title: "Early Expansion",
                        events: ["Reputation spreads across Skratonia", "First major contracts", "Training protocols established", "Core values defined"]
                    },
                    {
                        period: "780-795 Cycles",
                        title: "Guild Establishment",
                        events: ["Fortress-tavern HQ built in Suetonon", "Rank structure formalized", "Operations expand to neighboring continents", "Legendary hunts begin"]
                    },
                    {
                        period: "795-800 Cycles",
                        title: "Modern Era",
                        events: ["Full operational control in Skratonia", "International recognition", "Elite hunters achieve legendary status", "Current prestigious standing"]
                    }
                ]
            },

            headquarters: {
                location: "Suetonon, Northeastern Skratonia",
                description: "A fortress-tavern hybrid built of stone and oak, with a tiled roof shaped like a dragon's tail. Located in a large trading hub on an ocean-fed river, providing access to extensive trade with other nations, plentiful recruits, and supply lines.",
                facilities: [
                    {
                        name: "Great Hall",
                        description: "Trophy-adorned, hearth-warmed, filled with music and storytelling. The heart of guild social life."
                    },
                    {
                        name: "Training Grounds",
                        description: "Sparring pits, archery ranges, and monster-tracking drills. Where recruits become hunters."
                    },
                    {
                        name: "Sanctuary",
                        description: "Every member has a place to rest, recover, and belong. Private quarters and healing facilities."
                    }
                ]
            },

            ranks: [
                {
                    name: "Coal",
                    level: "Staff",
                    description: "The most important rank because without it you're just stuck with a bunch of unusable ore. Non-adventuring staff who keep the guild running - blacksmiths, innkeepers, administrators, and support personnel.",
                    color: "#2c2c2c",
                    special: true
                },
                {
                    name: "Copper",
                    level: "1-5",
                    description: "New recruits and green adventurers. Assigned safer jobs, training, and guild duties.",
                    color: "#b87333"
                },
                {
                    name: "Iron",
                    level: "5-12",
                    description: "The backbone of the guild. Steady hunters who handle most jobs and keep the guild's wheels turning.",
                    color: "#708090"
                },
                {
                    name: "Silver",
                    level: "12-15",
                    description: "Battle-proven hunters trusted with serious contracts. Considered veterans, though many push for promotion.",
                    color: "#c0c0c0"
                },
                {
                    name: "Gold",
                    level: "15-18",
                    description: "Semi-independent. These hunters travel abroad often, gathering glory, wealth, and lore. Called back only for dire needs.",
                    color: "#ffd700"
                },
                {
                    name: "Platinum",
                    level: "19-20",
                    description: "Elite hunters, legends in their own right. Act with the authority of the guild wherever it is recognized. Rarely seen unless they choose to be.",
                    color: "#e5e4e2"
                },
                {
                    name: "Mithral",
                    level: "Guildmaster",
                    description: "The singular leader of the Huntbound Order. Currently Tharos Raggenthraw, the founder.",
                    color: "#b0e0e6"
                }
            ],

            operations: [
                {
                    zone: "Central Skratonia",
                    status: "Primary",
                    description: "Between the Otherworldly Wastes and The Farmlands. Regular patrols and monster hunting.",
                    activities: ["Village protection", "Trade route security", "Beast elimination"]
                },
                {
                    zone: "The Ashen City",
                    status: "Primary",
                    description: "Full of various monsters and spirits requiring specialized hunters.",
                    activities: ["Spirit banishment", "Monster extermination", "Supernatural investigations"]
                },
                {
                    zone: "The Otherworldly Wastes",
                    status: "Primary",
                    description: "Thinning beast numbers in lands close to civilized areas.",
                    activities: ["Population control", "Threat assessment", "Wasteland patrols"]
                },
                {
                    zone: "The Blood Badlands",
                    status: "Primary",
                    description: "Dangerous hunting grounds with valuable loot and materials.",
                    activities: ["High-risk hunts", "Resource recovery", "Elite training exercises"]
                },
                {
                    zone: "Bulsania",
                    status: "Expedition",
                    description: "Icebound Confederacy frontier expeditions targeting giants, titans, and frost beasts.",
                    activities: ["Giant hunting", "Frontier protection", "Cold weather operations"]
                },
                {
                    zone: "Kuriguer",
                    status: "Expedition",
                    description: "Magical coastal towns & nearby forests; magical anomalies and rare monsters.",
                    activities: ["Magical creature hunting", "Anomaly investigation", "Coastal protection"]
                },
                {
                    zone: "Kamalatman",
                    status: "Secondary",
                    description: "Operations across all three regions: Katman swamps, Alatman resources, Maltman mountains.",
                    activities: ["Swamp patrols", "Resource protection", "Mine security", "Multi-terrain operations"]
                },
                {
                    zone: "Kantra",
                    status: "Dangerous",
                    description: "Rare high-risk missions to the largely unexplored hellish continent.",
                    activities: ["Extreme expeditions", "Reconnaissance", "Survival missions"]
                }
            ],

            coreValues: [
                {
                    name: "The Hunt Comes First",
                    description: "Whatever you do along the way, the beast must fall."
                },
                {
                    name: "Protect the Realm",
                    description: "Our hunts are not for glory alone, but to keep the kingdom safe when others cannot."
                },
                {
                    name: "Respect the Oath",
                    description: "A Huntbound may fight in their own way, but never betray their comrades or the cause."
                },
                {
                    name: "Strength in Fellowship",
                    description: "No hunter stands alone; every blade, spell, and arrow has a place in the Order."
                },
                {
                    name: "Honor the Fallen, Celebrate the Living",
                    description: "The hunt is deadly. We mourn our dead and drink to their memory, but we do not waste the life still in us."
                }
            ],

            reputation: {
                "Common Folk": "Saviors and folk heroes, though sometimes viewed with awe or suspicion because of their wild personalities.",
                "Nobility": "Both an asset and a headache — their reliability is unmatched, but they answer to their Guildmaster, not directly to the crown.",
                "Adventurers": "The Huntbound Order is one of the most prestigious guilds to join; a name recognized across kingdoms, promising both glory and family."
            }
        };
    },

    // Load guild staff and members data
    async loadGuildStaffAndMembers() {
        try {
            const [staffResponse, membersResponse, questsResponse] = await Promise.all([
                fetch('json/guild_staff.json'),
                fetch('json/guild_members.json'),
                fetch('json/quest_reports.json')
            ]);

            this.guildStaffData = await staffResponse.json();
            this.guildMembersData = await membersResponse.json();
            this.questReportsData = await questsResponse.json();
        } catch (error) {
            console.error('Error loading guild data:', error);
        }
    },

    // Load data from JSON files
    async loadData() {
        try {
            const [continentResponse, relationResponse] = await Promise.all([
                fetch('json/continent_data.json'),
                fetch('json/relation_data.json')
            ]);

            this.continentData = await continentResponse.json();
            this.relationData = await relationResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    // Load world description from continent data
    loadWorldDescription() {
        const worldData = this.continentData.find(item => item.world);
        if (worldData) {
            document.getElementById('world-description').textContent = worldData.description;
        }
    },

    // Color mode functionality
    changeColorMode() {
        this.allElements.forEach(element => {
            element.classList.toggle('lightMode');
            element.classList.toggle('darkMode');
        });

        const pageState = {
            colorMode: this.colorModeCheckbox.classList.contains('darkMode') ? 'darkMode' : 'lightMode',
            checked: this.colorModeCheckbox.checked,
        };
        localStorage.setItem("alabastriaColorMode", JSON.stringify(pageState));
    },

    loadColorMode() {
        if (localStorage.getItem("alabastriaColorMode")) {
            const savedState = JSON.parse(localStorage.getItem("alabastriaColorMode"));
            this.colorModeCheckbox.checked = savedState.checked;
            this.allElements.forEach(element => {
                element.classList.add(savedState.colorMode);
            });
        } else {
            this.allElements.forEach(elm => {
                elm.classList.add('lightMode');
            });
        }
    },

    // Navigation
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Scroll to top when showing a new section
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    setFilter(filterType) {
        this.currentFilter = filterType;
        this.navigationHistory = []; // Clear history when starting fresh
        this.currentSubclass = null;
        this.showSelectionSection();
    },

    goBack() {
        if (document.getElementById('details-section').classList.contains('active')) {
            this.showSelectionSection();
        } else {
            this.currentFilter = null;
            this.currentSelection = null;
            this.navigationHistory = [];
            this.currentSubclass = null;
            this.showSection('welcome-section');
        }
    },

    // New navigation history back function
    goBackToHistory() {
        if (this.navigationHistory.length > 0) {
            const previousState = this.navigationHistory.pop();
            this.currentFilter = previousState.filter;
            this.currentSelection = previousState.selection;
            this.currentSubclass = previousState.subclass || null;
            this.showDetailsSection();

            // Restore opened sections state after a delay
            if (previousState.openedSections) {
                setTimeout(() => {
                    this.restoreOpenedSectionsState(previousState.openedSections);
                }, 400);
            }
        } else {
            this.goBack();
        }
    },

    // Helper function to normalize race names for lookup
    normalizeRaceName(raceName) {
        // Handle complex Dragonborn names
        if (raceName.includes('Dragonborn')) {
            return 'Dragonborn';
        }

        // Handle Genasi subraces
        if (raceName.includes('Genasi')) {
            if (raceName.includes('Air')) return 'Air Genasi';
            if (raceName.includes('Fire')) return 'Fire Genasi';
            if (raceName.includes('Earth')) return 'Earth Genasi';
            if (raceName.includes('Water')) return 'Water Genasi';
            return 'Genasi';
        }

        // Handle Shifter subraces
        if (raceName.includes('Shifter')) {
            if (raceName.includes('Beasthide')) return 'Beasthide Shifter';
            if (raceName.includes('Longtooth')) return 'Longtooth Shifter';
            if (raceName.includes('Swiftstride')) return 'Swiftstride Shifter';
            if (raceName.includes('Wildhunt')) return 'Wildhunt Shifter';
            return 'Shifter';
        }

        // Handle Aasimar subraces
        if (raceName.includes('Aasimar')) {
            if (raceName.includes('Fallen')) return 'Fallen Aasimar';
            if (raceName.includes('Protector')) return 'Protector Aasimar';
            if (raceName.includes('Scourge')) return 'Scourge Aasimar';
            return 'Aasimar';
        }

        return raceName;
    },

    // Helper function to navigate to related items
    navigateToRelated(type, name, subclass = null) {
        // Save current state to history including opened sections
        this.navigationHistory.push({
            filter: this.currentFilter,
            selection: this.currentSelection,
            subclass: this.currentSubclass,
            openedSections: this.saveOpenedSectionsState()
        });

        this.currentFilter = type;
        this.currentSelection = name;
        this.currentSubclass = subclass;
        this.showDetailsSection();
    },

    // Helper function to create navigation button (simplified)
    createNavButton(type, name, text = null, subclass = null) {
        const displayText = text || name;
        if (subclass) {
            // Only subclass button needed
            return `<button class="nav-btn subclass-btn" onclick="app.navigateToRelated('${type}', '${name}', '${subclass}')" title="Go to ${subclass} details">${displayText}</button>`;
        } else {
            // Regular navigation button
            return `<button class="nav-btn" onclick="app.navigateToRelated('${type}', '${name}')" title="Go to ${name} details">${displayText}</button>`;
        }
    },

    // Scroll to subclass after page load with improved targeting
    scrollToSubclass() {
        if (this.currentSubclass) {
            setTimeout(() => {
                // Create a safe ID for the subclass
                const subclassId = `subclass-${this.currentSubclass.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
                const targetElement = document.getElementById(subclassId);

                if (targetElement) {
                    // Open all parent details elements
                    let parent = targetElement.parentElement;
                    while (parent) {
                        if (parent.tagName === 'DETAILS') {
                            parent.open = true;
                        }
                        parent = parent.parentElement;
                    }

                    // Also open the target element itself if it's a details element
                    if (targetElement.tagName === 'DETAILS') {
                        targetElement.open = true;
                    }

                    // Scroll to the element
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Add highlight class temporarily
                    targetElement.classList.add('highlighted-subclass');
                    setTimeout(() => {
                        targetElement.classList.remove('highlighted-subclass');
                    }, 3000);
                }
            }, 200);
        }
    },

    // Save the current state of opened details sections
    saveOpenedSectionsState() {
        const openedSections = [];
        const allDetails = document.querySelectorAll('#relationships-table details');
        allDetails.forEach((detail, index) => {
            if (detail.open) {
                openedSections.push(index);
            }
        });
        return openedSections;
    },

    // Restore the state of opened details sections
    restoreOpenedSectionsState(openedSections) {
        const allDetails = document.querySelectorAll('#relationships-table details');
        allDetails.forEach((detail, index) => {
            detail.open = openedSections.includes(index);
        });
    },

    // Open relevant sections when navigating to specific content
    openRelevantSections() {
        setTimeout(() => {
            // If we're looking at a class and have a current subclass, open the subclass section
            if (this.currentFilter === 'class' && this.currentSubclass) {
                const subclassId = `subclass-${this.currentSubclass.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
                const targetElement = document.getElementById(subclassId);

                if (targetElement) {
                    // Open all parent details elements including the target
                    let current = targetElement;
                    while (current) {
                        if (current.tagName === 'DETAILS') {
                            current.open = true;
                        }
                        current = current.parentElement;
                    }
                }
            }

            // For race or continent views, open the first level of details by default
            if (this.currentFilter === 'race' || this.currentFilter === 'continent') {
                const firstLevelDetails = document.querySelectorAll('#relationships-table > details');
                firstLevelDetails.forEach(detail => {
                    detail.open = true;
                });
            }
        }, 300);
    },

    // Selection section
    showSelectionSection() {
        const title = document.getElementById('selection-title');
        const grid = document.getElementById('selection-grid');

        switch (this.currentFilter) {
            case 'continent':
                title.textContent = 'The Lands found across Alabastria';
                break;
            case 'race':
                title.textContent = 'Races that have made new homes in Alabastria';
                break;
            case 'class':
                title.textContent = 'Skills passed down throughout Alabastria';
                break;
        }
        grid.innerHTML = '';

        if (this.currentFilter === 'continent') {
            this.renderContinents(grid);
        } else if (this.currentFilter === 'race') {
            this.renderRaces(grid);
        } else if (this.currentFilter === 'class') {
            this.renderClasses(grid);
        }

        this.showSection('selection-section');
    },

    renderContinents(container) {
        // Filter out the world entry and render continents
        const continents = this.continentData.filter(item => item.continent);

        continents.forEach(continent => {
            const card = document.createElement('div');
            card.className = 'selection-card continent-card';
            // Store the full continent name for lookup
            card.onclick = () => this.selectItem(continent.continent);

            card.innerHTML = `
                <img src="continent_images/${continent.continent.split(" ")[0]}.png" 
                     alt="${continent.continent}" 
                     class="continent-image"
                     onerror="this.style.display='none'">
                <h3>${continent.continent}</h3>
                <p>${continent.description}</p>
            `;

            container.appendChild(card);
        });
    },

    renderRaces(container) {
        Object.entries(this.raceHierarchy).forEach(([mainRace, subraces]) => {
            if (Array.isArray(subraces) && subraces.length === 0) {
                // Simple race with no subraces
                const card = document.createElement('div');
                card.className = 'selection-card';
                card.onclick = () => this.selectItem(mainRace);

                card.innerHTML = `
                    <h3>${mainRace}</h3>
                    <p>A versatile race found across the lands of Alabastria</p>
                `;

                container.appendChild(card);
            } else if (Array.isArray(subraces)) {
                // Race with simple subraces
                const card = document.createElement('div');
                card.className = 'selection-card race-hierarchy-card';

                card.innerHTML = `
                    <details>
                        <summary class="race-main-summary">
                            <h3>${mainRace}</h3>
                            <p>A diverse race with ${subraces.length} distinct subraces</p>
                        </summary>
                        <div class="subrace-list">
                            ${subraces.map(subrace => `
                                <div class="subrace-item" onclick="app.selectItem('${subrace} ${mainRace}')">
                                    <h4>${subrace} ${mainRace}</h4>
                                    <p>A specialized variant of the ${mainRace} race</p>
                                </div>
                            `).join('')}
                            <div class="subrace-item" onclick="app.selectItem('${mainRace}')">
                                <h4>General ${mainRace}</h4>
                                <p>The base ${mainRace} without specific subrace traits</p>
                            </div>
                        </div>
                    </details>
                `;

                container.appendChild(card);
            } else {
                // Complex hierarchy (like Dragonborn)
                const card = document.createElement('div');
                card.className = 'selection-card race-hierarchy-card';

                const totalSubraces = Object.values(subraces).reduce((sum, arr) => sum + arr.length, 0);

                card.innerHTML = `
                    <details>
                        <summary class="race-main-summary">
                            <h3>${mainRace}</h3>
                            <p>A diverse race with ${Object.keys(subraces).length} categories and ${totalSubraces} variants</p>
                        </summary>
                        <div class="subrace-list">
                            ${Object.entries(subraces).map(([category, variants]) => `
                                <details class="subrace-category">
                                    <summary class="subrace-category-summary">
                                        <h4>${category} ${mainRace}</h4>
                                        <p>${variants.length} variants</p>
                                    </summary>
                                    <div class="subrace-variants">
                                        ${variants.map(variant => `
                                            <div class="subrace-item" onclick="app.selectItem('${variant} ${category} ${mainRace}')">
                                                <h5>${variant} ${category} ${mainRace}</h5>
                                                <p>A ${variant.toLowerCase()} ${category.toLowerCase()} variant</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </details>
                            `).join('')}
                            <div class="subrace-item" onclick="app.selectItem('${mainRace}')">
                                <h4>General ${mainRace}</h4>
                                <p>The base ${mainRace} without specific heritage</p>
                            </div>
                        </div>
                    </details>
                `;

                container.appendChild(card);
            }
        });
    },

    renderClasses(container) {
        this.relationData.forEach(classData => {
            const card = document.createElement('div');
            card.className = 'selection-card';
            card.onclick = () => this.selectItem(classData.class);

            card.innerHTML = `
                <h3>${classData.class}</h3>
                <p>${classData.suitability_reason}</p>
            `;

            container.appendChild(card);
        });
    },

    // Details section
    selectItem(itemName) {
        this.currentSelection = itemName;
        this.showDetailsSection();
    },

    showDetailsSection() {
        const title = document.getElementById('details-title');
        const info = document.getElementById('details-info');
        const relationships = document.getElementById('relationships-table');

        title.textContent = this.currentSelection;

        // Update section header with navigation buttons
        this.updateSectionHeader();

        if (this.currentFilter === 'continent') {
            this.renderContinentDetails(info, relationships);
        } else if (this.currentFilter === 'race') {
            this.renderRaceDetails(info, relationships);
        } else if (this.currentFilter === 'class') {
            this.renderClassDetails(info, relationships);
        }

        this.showSection('details-section');

        // Scroll to subclass if specified and open relevant sections
        this.scrollToSubclass();
        this.openRelevantSections();
    },

    // Update section header with navigation buttons
    updateSectionHeader() {
        const header = document.querySelector('#details-section .section-header');
        const hasHistory = this.navigationHistory.length > 0;

        header.innerHTML = `
            <button class="back-btn" onclick="app.goBack()">← Back</button>
            ${hasHistory ? '<button class="back-btn history-btn" onclick="app.goBackToHistory()">↶ Return to Previous</button>' : ''}
            <h2 id="details-title">${this.currentSelection}</h2>
        `;
    },

    // Helper function to render language information
    renderLanguageInfo(languages) {
        return `
         <details class="language-info language-details">
            <summary class="language-summary">
               Common Languages (${languages.primary.length + languages.secondary.length + languages.rare.length} total)
            </summary>
            <div class="language-content">
               <div class="language-category">
                  <strong>Primary:</strong> ${languages.primary.join(', ')}
               </div>
               <div class="language-category">
                  <strong>Secondary:</strong> ${languages.secondary.join(', ')}
               </div>
               <div class="language-category">
                  <strong>Rare:</strong> ${languages.rare.join(', ')}
               </div>
               <div class="language-description">
                  ${languages.description}
               </div>
            </div>
         </details>
      `;
    },

    // Helper function to render political information
    renderPoliticalInfo(politics) {
        return `
         <details class="language-info language-details">
            <summary class="language-summary">
               Political Information & Settlements
            </summary>
            <div class="language-content">
               <div class="language-category">
                  <strong>Kingdoms/Governments:</strong> ${politics.kingdoms.join(', ')}
               </div>
               <div class="language-category">
                  <strong>Major Settlements:</strong> ${politics.settlements.join(', ')}
               </div>
               <div class="language-category">
                  <strong>Dominant Races:</strong> ${politics.dominant_races.join(', ')}
               </div>
               <div class="language-category">
                  <strong>Notes:</strong> ${politics.notes}
               </div>
               <div class="language-description">
                  <strong>Current Political Climate:</strong><br>
                  ${politics.political_climate}
               </div>
            </div>
         </details>
      `;
    },

    // Show world history timeline
    showWorldHistory() {
        this.showSection('world-history-section');
        this.renderTimeline();
    },

    // Show guild history
    showGuildHistory() {
        this.currentGuildView = 'overview';
        this.showSection('guild-history-section');
        this.renderGuildHistory();
    },

    // Show specific guild view
    showGuildView(viewType) {
        this.currentGuildView = viewType;
        this.updateGuildNavButtons();
        this.renderGuildHistory();
    },

    // Update guild navigation button states
    updateGuildNavButtons() {
        document.querySelectorAll('.guild-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`guild-${this.currentGuildView}-btn`).classList.add('active');
    },

    // Render the timeline
    renderTimeline() {
        const timelineContent = document.getElementById('timeline-content');

        timelineContent.innerHTML = `
         <div class="timeline-line"></div>
         ${this.worldHistoryData.map(period => `
            <div class="timeline-period" onclick="app.showPeriodModal('${period.period}')">
               <div class="timeline-card">
                  <h3>${period.period}: ${period.title}</h3>
                  <p>${period.summary}</p>
                  <div class="timeline-highlights">
                     ${period.highlights.map(highlight => `
                        <span class="timeline-highlight">${highlight}</span>
                     `).join('')}
                  </div>
               </div>
            </div>
         `).join('')}
      `;
    },

    // Render guild history
    renderGuildHistory() {
        const guildContent = document.getElementById('guild-content');
        const guild = this.guildData;

        this.updateGuildNavButtons();

        if (this.currentGuildView === 'staff') {
            this.renderGuildStaff(guildContent);
            return;
        }

        if (this.currentGuildView === 'members') {
            this.renderGuildMembers(guildContent);
            return;
        }

        if (this.currentGuildView === 'quests') {
            this.renderQuestReports(guildContent);
            return;
        }

        // Default overview view
        guildContent.innerHTML = `
         <div class="guild-info">
            <div class="guild-emblem">
               <img src="${guild.emblem.image}" alt="Huntbound Order Emblem" onerror="this.style.display='none'">
            </div>
            
            <h3>${guild.name}</h3>
            <div class="guild-motto">"${guild.motto}"</div>
            
            <details class="language-info language-details">
               <summary class="language-summary">Guild Overview</summary>
               <div class="language-content">
                  <p>${guild.overview}</p>
               </div>
            </details>

            <details class="language-info language-details">
               <summary class="language-summary">Guild Philosophy</summary>
               <div class="language-content">
                  <p style="font-style: italic; line-height: 1.8; color: var(--gold-accent); border-left: 4px solid var(--gold-accent); padding-left: 1rem; background: rgba(184, 134, 11, 0.1);">${guild.philosophy}</p>
               </div>
            </details>

            <details class="language-info language-details">
               <summary class="language-summary">Emblem & Symbolism</summary>
               <div class="language-content">
                  <p>${guild.emblem.description}</p>
               </div>
            </details>

            <details class="language-info language-details">
               <summary class="language-summary">Headquarters</summary>
               <div class="language-content">
                  <div class="language-category">
                     <strong>Location:</strong> ${guild.headquarters.location}
                  </div>
                  <p style="margin: 1rem 0;">${guild.headquarters.description}</p>
                  <div style="margin-top: 1rem;">
                     <strong>Facilities:</strong>
                     ${guild.headquarters.facilities.map(facility => `
                        <div style="margin: 0.5rem 0; padding: 0.5rem; border-left: 3px solid var(--forest-green); background: rgba(139, 69, 19, 0.1);">
                           <strong>${facility.name}:</strong> ${facility.description}
                        </div>
                     `).join('')}
                  </div>
               </div>
            </details>

            <details class="language-info language-details">
               <summary class="language-summary">Core Values</summary>
               <div class="language-content">
                  ${guild.coreValues.map(value => `
                     <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--mountain-brown); border-radius: 6px; background: rgba(44, 79, 107, 0.1);">
                        <strong style="color: var(--gold-accent);">${value.name}</strong><br>
                        <span style="font-style: italic;">${value.description}</span>
                     </div>
                  `).join('')}
               </div>
            </details>

            <details class="language-info language-details">
               <summary class="language-summary">Reputation</summary>
               <div class="language-content">
                  ${Object.entries(guild.reputation).map(([group, rep]) => `
                     <div class="language-category">
                        <strong>${group}:</strong> ${rep}
                     </div>
                  `).join('')}
               </div>
            </details>
         </div>

         <div class="guild-details">
            <div class="guild-section">
               <h3>Guild Timeline</h3>
               <div style="border-left: 4px solid var(--gold-accent); padding-left: 1rem; margin: 1rem 0;">
                  <h4 style="color: var(--volcanic-red); margin-bottom: 0.5rem;">Founding Story</h4>
                  <div style="margin-bottom: 1rem;">
                     <strong>Founded:</strong> ${guild.history.founding.year}<br>
                     <strong>Founder:</strong> ${guild.history.founding.founder} (${guild.history.founding.founder_details})
                  </div>
                  <p style="font-style: italic; line-height: 1.8;">${guild.history.founding.founding_story}</p>
               </div>
               
               ${guild.history.timeline.map(period => `
                  <details style="margin: 1rem 0; border: 2px solid var(--mountain-brown); border-radius: 6px;">
                     <summary style="padding: 1rem; background: rgba(44, 79, 107, 0.1); cursor: pointer; font-weight: 600;">
                        ${period.period}: ${period.title}
                     </summary>
                     <div style="padding: 1rem;">
                        <ul style="margin: 0; padding-left: 1.5rem;">
                           ${period.events.map(event => `<li style="margin: 0.5rem 0; line-height: 1.6;">${event}</li>`).join('')}
                        </ul>
                     </div>
                  </details>
               `).join('')}
            </div>

            <div class="guild-section">
               <h3>Rank Structure</h3>
               <p style="margin-bottom: 1.5rem; font-style: italic;">The Order uses a tiered ranking system, reflecting both skill and responsibility. Once the required level is met, members may apply for rank promotion.</p>
               <div class="rank-grid">
                  ${guild.ranks.map(rank => `
                     <div class="rank-card ${rank.special ? 'coal-rank' : ''}" style="border-left: 4px solid ${rank.color};">
                        <h4>${rank.name}</h4>
                        <div class="rank-level">Level ${rank.level}</div>
                        <p>${rank.description}</p>
                     </div>
                  `).join('')}
               </div>
            </div>

            <div class="guild-section">
               <h3>Operational Zones</h3>
               <p style="margin-bottom: 1.5rem;">The Huntbound Order operates across multiple continents, with varying levels of presence and authority.</p>
               <div class="operations-grid">
                  ${guild.operations.map(op => `
                     <div class="operation-card">
                        <h4>${op.zone}</h4>
                        <div class="operation-status status-${op.status.toLowerCase()}">${op.status} Operations</div>
                        <p style="margin: 0.5rem 0;">${op.description}</p>
                        <div style="margin-top: 1rem;">
                           <strong>Activities:</strong>
                           <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                              ${op.activities.map(activity => `<li>${activity}</li>`).join('')}
                           </ul>
                        </div>
                     </div>
                  `).join('')}
               </div>
            </div>
         </div>
      `;
    },

    // Helper function to get member's quest participation
    getMemberQuestParticipation(memberName) {
        return this.questReportsData.filter(quest =>
            quest.party_members.some(member => member.name === memberName)
        );
    },

    // Helper function to calculate quest statistics
    calculateQuestStatistics() {
        const stats = {
            totalQuests: this.questReportsData.length,
            questRanks: {},
            averagePartySize: 0,
            mostCommonRank: ''
        };

        // Calculate quest rank distribution
        this.questReportsData.forEach(quest => {
            stats.questRanks[quest.quest_rank] = (stats.questRanks[quest.quest_rank] || 0) + 1;
        });

        // Find most common rank
        let maxCount = 0;
        Object.entries(stats.questRanks).forEach(([rank, count]) => {
            if (count > maxCount) {
                maxCount = count;
                stats.mostCommonRank = rank;
            }
        });

        // Calculate average party size
        const totalPartyMembers = this.questReportsData.reduce((sum, quest) =>
            sum + quest.party_members.length, 0
        );
        stats.averagePartySize = this.questReportsData.length > 0 ?
            (totalPartyMembers / this.questReportsData.length).toFixed(1) : 0;

        return stats;
    },

    // Render guild staff view
    renderGuildStaff(container) {
        container.innerHTML = `
         <div class="guild-info">
            <div class="guild-emblem">
               <img src="${this.guildData.emblem.image}" alt="Huntbound Order Emblem" onerror="this.style.display='none'">
            </div>
            <h3>Guild Staff</h3>
            <p style="margin-bottom: 1rem;">The dedicated individuals who keep the Huntbound Order running smoothly, from administrative duties to essential services.</p>
         </div>

         <div class="guild-details">
            <div class="guild-section">
               <h3>Current Staff Members</h3>
               <div class="staff-grid">
                  ${this.guildStaffData.map(staff => `
                     <div class="staff-card">
                        <img src="staffImages/${staff.image}" alt="${staff.name}" class="staff-image" onerror="this.style.display='none'">
                        <div class="staff-info">
                           <h3>${staff.name}</h3>
                           <div class="staff-role">${staff.guild_role}</div>
                           <div class="staff-rank rank-${staff.rank.toLowerCase()}">${staff.rank} Rank</div>
                           <div style="margin-bottom: 1rem;">
                              <strong>Race/Class:</strong> ${staff.race}, ${staff.class}
                           </div>
                           
                           <details style="margin: 1rem 0;">
                              <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Appearance</summary>
                              <p style="margin: 0.5rem 0; font-style: italic; line-height: 1.6;">${staff.appearance}</p>
                           </details>
                           
                           <details style="margin: 1rem 0;">
                              <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Personality</summary>
                              <p style="margin: 0.5rem 0; line-height: 1.6;">${staff.personality}</p>
                           </details>
                           
                           ${staff.faith ? `
                              <details style="margin: 1rem 0;">
                                 <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Faith</summary>
                                 <p style="margin: 0.5rem 0; line-height: 1.6;">${staff.faith}</p>
                              </details>
                           ` : ''}
                           
                           <details style="margin: 1rem 0;">
                              <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Background</summary>
                              <p style="margin: 0.5rem 0; line-height: 1.6;">${staff.background}</p>
                           </details>
                        </div>
                     </div>
                  `).join('')}
               </div>
            </div>
         </div>
      `;
    },

    // Render guild members view
    renderGuildMembers(container) {
        container.innerHTML = `
         <div class="guild-info">
            <div class="guild-emblem">
               <img src="${this.guildData.emblem.image}" alt="Huntbound Order Emblem" onerror="this.style.display='none'">
            </div>
            <h3>Guild Members</h3>
            <p style="margin-bottom: 1rem;">The brave adventurers who take on quests and hunt the monsters that threaten the realm.</p>
         </div>

         <div class="guild-details">
            <div class="guild-section">
               <h3>Active Members</h3>
               <div class="members-grid">
                  ${this.guildMembersData.map(member => {
            const memberQuests = this.getMemberQuestParticipation(member.name);
            return `
                        <div class="member-card">
                           <img src="memberImages/${member.image}" alt="${member.name}" class="member-image" onerror="this.style.display='none'">
                           <div class="member-info">
                              <h3>${member.name}</h3>
                              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                 <div class="member-rank rank-${member.rank.toLowerCase()}">${member.rank} Rank</div>
                                 <div class="member-rank rank-${member.rank.toLowerCase()}" style="background: var(--forest-green);">${memberQuests.length} Quest${memberQuests.length !== 1 ? 's' : ''}</div>
                              </div>
                              <div class="member-class">Level ${member.level} ${member.class}</div>
                              <div class="member-managed">${member.managed_by}</div>
                              
                              <div style="margin: 1rem 0;">
                                 <strong>Status:</strong> ${member.status}
                              </div>
                              
                              <div style="margin: 1rem 0;">
                                 <strong>Specialization:</strong> ${member.specialization}
                              </div>
                              
                              ${memberQuests.length > 0 ? `
                                 <details style="margin: 1rem 0;">
                                    <summary style="cursor: pointer; font-weight: 600; color: var(--forest-green);">Quest Participation (${memberQuests.length})</summary>
                                    <div style="margin: 0.5rem 0;">
                                       ${memberQuests.map(quest => `
                                          <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--forest-green); border-radius: 4px; background: rgba(74, 93, 35, 0.1);">
                                             <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span><strong>${quest.quest_name}</strong> [${quest.quest_rank}]</span>
                                                <button class="nav-btn" onclick="app.jumpToQuestReport('${quest.quest_name}')" style="margin: 0;">View Report</button>
                                             </div>
                                             <div style="font-size: 0.9rem; color: var(--forest-green); margin-top: 0.3rem;">
                                                Role: ${quest.party_members.find(p => p.name === member.name)?.role || 'Unknown'}
                                             </div>
                                          </div>
                                       `).join('')}
                                    </div>
                                 </details>
                              ` : ''}
                              
                              ${member.notable_achievements ? `
                                 <details style="margin: 1rem 0;">
                                    <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Notable Achievements</summary>
                                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                                       ${member.notable_achievements.map(achievement => `<li style="margin: 0.3rem 0;">${achievement}</li>`).join('')}
                                    </ul>
                                 </details>
                              ` : ''}
                           </div>
                        </div>
                     `;
        }).join('')}
               </div>
            </div>
         </div>
      `;
    },

    // Render quest reports view
    renderQuestReports(container) {
        container.innerHTML = `
         <div class="guild-info">
            <div class="guild-emblem">
               <img src="${this.guildData.emblem.image}" alt="Huntbound Order Emblem" onerror="this.style.display='none'">
            </div>
            <h3>Quest Reports</h3>
            <p style="margin-bottom: 1rem;">Official records of completed guild missions, legendary hunts, and notable expeditions.</p>
            
            <details class="language-info language-details">
               <summary class="language-summary">Report Statistics</summary>
               <div class="language-content">
                  ${(() => {
                const stats = this.calculateQuestStatistics();
                return `
                        <div class="language-category">
                           <strong>Total Quests:</strong> ${stats.totalQuests}
                        </div>
                        <div class="language-category">
                           <strong>Most Common Rank:</strong> ${stats.mostCommonRank} (${stats.questRanks[stats.mostCommonRank]} quests)
                        </div>
                        <div class="language-category">
                           <strong>Average Party Size:</strong> ${stats.averagePartySize} members
                        </div>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--mountain-brown);">
                           <strong>Quest Ranks:</strong><br>
                           ${Object.entries(stats.questRanks).map(([rank, count]) => `
                              <span style="display: inline-block; margin: 0.2rem 0.5rem 0.2rem 0; padding: 0.2rem 0.5rem; background: var(--forest-green); color: var(--parchment-light); border-radius: 10px; font-size: 0.8rem;">
                                 ${rank}: ${count}
                              </span>
                           `).join('')}
                        </div>
                     `;
            })()}
               </div>
            </details>
         </div>

         <div class="guild-details">
            <div class="guild-section">
               <h3>Completed Quests</h3>
               <div style="margin-bottom: 1rem;">
                  ${this.questReportsData.map(quest => `
                     <details style="margin: 1.5rem 0; border: 2px solid var(--mountain-brown); border-radius: var(--border-radius); overflow: hidden;">
                        <summary style="padding: 1.5rem; background: rgba(44, 79, 107, 0.1); cursor: pointer; font-weight: 600; font-family: 'Cinzel Decorative', serif; font-size: 1.2rem; color: var(--ocean-blue);">
                           ${quest.quest_name} <span style="font-size: 0.8rem; color: var(--gold-accent);">[${quest.quest_rank}]</span>
                        </summary>
                        <div style="padding: 1.5rem; background: rgba(139, 69, 19, 0.05);">
                           <div style="margin-bottom: 1.5rem; padding: 1rem; border-left: 4px solid var(--gold-accent); background: rgba(184, 134, 11, 0.1);">
                              <p style="font-style: italic; margin: 0; line-height: 1.6;">${quest.quest_summary}</p>
                           </div>

                           <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                              <div style="border: 1px solid var(--mountain-brown); border-radius: 6px; padding: 1rem; background: rgba(44, 79, 107, 0.1);">
                                 <h4 style="color: var(--ocean-blue); margin-bottom: 0.8rem; font-family: 'Cinzel Decorative', serif;">Quest Details</h4>
                                 <div style="margin-bottom: 0.5rem;"><strong>Date:</strong> ${quest.date}</div>
                                 <div style="margin-bottom: 0.5rem;"><strong>Location:</strong> ${quest.location}</div>
                                 <div style="margin-bottom: 0.5rem;"><strong>Duration:</strong> ${quest.duration}</div>
                                 <div style="margin-bottom: 0.5rem;"><strong>Commissioned by:</strong> ${quest.commissioned_by}</div>
                                 <div style="margin-bottom: 0.5rem;"><strong>Outcome:</strong> ${quest.outcome}</div>
                              </div>

                              <div style="border: 1px solid var(--mountain-brown); border-radius: 6px; padding: 1rem; background: rgba(74, 93, 35, 0.1);">
                                 <h4 style="color: var(--forest-green); margin-bottom: 0.8rem; font-family: 'Cinzel Decorative', serif;">Party Members</h4>
                                 ${quest.party_members.map(member => `
                                    <div style="margin-bottom: 0.5rem; padding: 0.5rem; border-left: 3px solid var(--forest-green); background: rgba(74, 93, 35, 0.1);">
                                       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                                          <strong>${member.name}</strong>
                                          <button class="nav-btn" onclick="app.jumpToGuildMember('${member.name}')" style="margin: 0; font-size: 0.7rem;">View Member</button>
                                       </div>
                                       <span style="font-size: 0.9rem; color: var(--forest-green);">${member.rank_at_time} - ${member.role}</span>
                                    </div>
                                 `).join('')}
                              </div>
                           </div>

                           <div style="margin: 1.5rem 0;">
                              <details style="border: 1px solid var(--volcanic-red); border-radius: 6px; margin-bottom: 1rem;">
                                 <summary style="padding: 1rem; background: rgba(139, 38, 53, 0.1); cursor: pointer; font-weight: 600; color: var(--volcanic-red);">Enemies Encountered</summary>
                                 <div style="padding: 1rem;">
                                    ${quest.enemies.map(enemy => `
                                       <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--volcanic-red); border-radius: 6px; background: rgba(139, 38, 53, 0.05);">
                                          <h5 style="color: var(--volcanic-red); margin-bottom: 0.5rem;">${enemy.name} (${enemy.type})</h5>
                                          <div style="margin-bottom: 0.5rem;"><strong>Threat Level:</strong> ${enemy.threat_level}</div>
                                          <p style="margin: 0; line-height: 1.6;">${enemy.description}</p>
                                       </div>
                                    `).join('')}
                                 </div>
                              </details>
                           </div>

                           ${quest.special_awards_promotions.length > 0 ? `
                              <div style="margin: 1.5rem 0;">
                                 <details style="border: 1px solid var(--gold-accent); border-radius: 6px; margin-bottom: 1rem;">
                                    <summary style="padding: 1rem; background: rgba(184, 134, 11, 0.1); cursor: pointer; font-weight: 600; color: var(--gold-accent);">Special Awards & Promotions</summary>
                                    <div style="padding: 1rem;">
                                       ${quest.special_awards_promotions.map(award => `
                                          <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--gold-accent); border-radius: 6px; background: rgba(184, 134, 11, 0.05);">
                                             <h5 style="color: var(--gold-accent); margin-bottom: 0.5rem;">${award.recipient}</h5>
                                             <div style="margin-bottom: 0.5rem;"><strong>Award:</strong> ${award.award}</div>
                                             <p style="margin: 0; line-height: 1.6;">${award.description}</p>
                                          </div>
                                       `).join('')}
                                    </div>
                                 </details>
                              </div>
                           ` : ''}

                           ${quest.notable_loot_decor.length > 0 ? `
                              <div style="margin: 1.5rem 0;">
                                 <details style="border: 1px solid var(--desert-tan); border-radius: 6px; margin-bottom: 1rem;">
                                    <summary style="padding: 1rem; background: rgba(210, 180, 140, 0.1); cursor: pointer; font-weight: 600; color: var(--desert-tan);">Notable Loot & Guild Hall Additions</summary>
                                    <div style="padding: 1rem;">
                                       ${quest.notable_loot_decor.map(item => `
                                          <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--desert-tan); border-radius: 6px; background: rgba(210, 180, 140, 0.05);">
                                             <h5 style="color: var(--desert-tan); margin-bottom: 0.5rem;">${item.item}</h5>
                                             <div style="margin-bottom: 0.5rem;"><strong>Significance:</strong> ${item.significance}</div>
                                             <p style="margin: 0; line-height: 1.6;">${item.description}</p>
                                          </div>
                                       `).join('')}
                                    </div>
                                 </details>
                              </div>
                           ` : ''}

                           ${quest.fallen_members.length > 0 ? `
                              <div style="margin: 1.5rem 0;">
                                 <details style="border: 2px solid var(--ink-dark); border-radius: 6px; margin-bottom: 1rem;">
                                    <summary style="padding: 1rem; background: rgba(26, 26, 13, 0.1); cursor: pointer; font-weight: 600; color: var(--ink-dark);">Fallen Heroes</summary>
                                    <div style="padding: 1rem;">
                                       ${quest.fallen_members.map(fallen => `
                                          <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--ink-dark); border-radius: 6px; background: rgba(26, 26, 13, 0.05);">
                                             <h5 style="color: var(--ink-dark); margin-bottom: 0.5rem;">${fallen.name}</h5>
                                             <div style="margin-bottom: 0.5rem;"><strong>Rank:</strong> ${fallen.rank}</div>
                                             <p style="margin: 0; line-height: 1.6; font-style: italic;">${fallen.memorial}</p>
                                          </div>
                                       `).join('')}
                                    </div>
                                 </details>
                              </div>
                           ` : ''}

                           ${quest.extra_notes ? `
                              <div style="margin: 1.5rem 0; padding: 1rem; border: 1px solid var(--mountain-brown); border-radius: 6px; background: rgba(139, 69, 19, 0.1);">
                                 <h4 style="color: var(--mountain-brown); margin-bottom: 0.8rem; font-family: 'Cinzel Decorative', serif;">Additional Notes</h4>
                                 <p style="margin: 0; line-height: 1.8; font-style: italic;">${quest.extra_notes}</p>
                              </div>
                           ` : ''}
                        </div>
                     </details>
                  `).join('')}
               </div>
            </div>
         </div>
      `;
    },

    // Jump to specific quest report
    jumpToQuestReport(questName) {
        // Switch to quest reports view
        this.currentGuildView = 'quests';
        this.renderGuildHistory();

        // Wait for render, then find and open the specific quest
        setTimeout(() => {
            const questElements = document.querySelectorAll('#guild-content details');
            questElements.forEach(element => {
                const summary = element.querySelector('summary');
                if (summary && summary.textContent.includes(questName)) {
                    element.open = true;
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Add temporary highlight
                    element.style.border = '3px solid var(--gold-accent)';
                    setTimeout(() => {
                        element.style.border = '';
                    }, 3000);
                }
            });
        }, 200);
    },

    // Jump to specific guild member
    jumpToGuildMember(memberName) {
        // Switch to guild members view
        this.currentGuildView = 'members';
        this.renderGuildHistory();

        // Wait for render, then find and highlight the specific member
        setTimeout(() => {
            const memberCards = document.querySelectorAll('.member-card');
            memberCards.forEach(card => {
                const nameElement = card.querySelector('h3');
                if (nameElement && nameElement.textContent.trim() === memberName) {
                    card.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Add temporary highlight
                    card.style.border = '3px solid var(--gold-accent)';
                    card.style.boxShadow = '0 0 20px rgba(184, 134, 11, 0.5)';
                    setTimeout(() => {
                        card.style.border = '';
                        card.style.boxShadow = '';
                    }, 3000);
                }
            });
        }, 200);
    },

    // Show period details in modal
    showPeriodModal(periodKey) {
        const period = this.worldHistoryData.find(p => p.period === periodKey);
        if (!period) return;

        const modal = document.getElementById('timeline-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = `${period.period}: ${period.title}`;

        modalBody.innerHTML = `
         <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--ocean-blue); font-family: 'Cinzel Decorative', serif; margin-bottom: 1rem;">Overview</h3>
            <p style="line-height: 1.8; margin-bottom: 2rem;">${period.details.overview}</p>
         </div>

         <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--ocean-blue); font-family: 'Cinzel Decorative', serif; margin-bottom: 1rem;">Major Events</h3>
            ${period.details.events.map(event => `
               <div style="margin-bottom: 1.5rem; padding: 1rem; border-left: 4px solid var(--forest-green); background: rgba(139, 69, 19, 0.1); border-radius: 4px;">
                  <h4 style="color: var(--volcanic-red); font-weight: 600; margin-bottom: 0.5rem;">${event.name}</h4>
                  <p style="line-height: 1.6;">${event.description}</p>
               </div>
            `).join('')}
         </div>

         <div>
            <h3 style="color: var(--ocean-blue); font-family: 'Cinzel Decorative', serif; margin-bottom: 1rem;">Continental Developments</h3>
            ${Object.entries(period.details.continents).map(([continent, description]) => `
               <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--mountain-brown); border-radius: 6px; background: rgba(44, 79, 107, 0.1);">
                  <h4 style="color: var(--gold-accent); font-weight: 600; margin-bottom: 0.5rem;">${continent}</h4>
                  <p style="line-height: 1.6;">${description}</p>
               </div>
            `).join('')}
         </div>
      `;

        modal.style.display = 'block';
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('timeline-modal');
        modal.style.display = 'none';
    },

    renderContinentDetails(infoContainer, relationshipsContainer) {
        // Find continent data using full name
        const continent = this.continentData.find(c => c.continent === this.currentSelection);

        infoContainer.innerHTML = `
            <div class="sticky-info">
                <h3>About ${this.currentSelection}</h3>
                <p>${continent.description}</p>
                <img src="continent_images/${this.currentSelection.split(" ")[0]}.png" 
                     alt="${this.currentSelection}" 
                     style="width: 100%; max-width: 300px; border-radius: 8px; margin-top: 1rem; border: 2px solid var(--mountain-brown);"
                     onerror="this.style.display='none'">
                ${continent.languages ? this.renderLanguageInfo(continent.languages) : ''}
                ${continent.politics ? this.renderPoliticalInfo(continent.politics) : ''}
                <button id="jump-to-top" class="jump-btn" onclick="app.jumpToTop()" style="display: none;">↑ Top</button>
            </div>
        `;

        // Find only races and classes that actually exist in this continent
        const raceRelations = new Map();
        const classRelations = new Map();

        this.relationData.forEach(classData => {
            classData.subclasses.forEach(subclass => {
                // Check prominent continents
                const prominentContinent = subclass.prominent_continents?.find(pc =>
                    pc.continent === this.currentSelection ||
                    pc.continent.split(" ")[0] === this.currentSelection.split(" ")[0]
                );
                if (prominentContinent) {
                    if (!classRelations.has(classData.class)) {
                        classRelations.set(classData.class, []);
                    }
                    classRelations.get(classData.class).push({
                        subclass: subclass.subclass,
                        reason: prominentContinent.reason,
                        isProminent: true
                    });
                }

                // Check races in this continent
                subclass.races.forEach(race => {
                    const isFromThisContinent = race.continent === this.currentSelection ||
                        race.continent.split(" ")[0] === this.currentSelection.split(" ")[0];

                    if (isFromThisContinent) {
                        if (!raceRelations.has(race.name)) {
                            raceRelations.set(race.name, []);
                        }

                        raceRelations.get(race.name).push({
                            class: classData.class,
                            subclass: subclass.subclass,
                            reason: race.continent_reason,
                            subclassReason: race.subclass_reason,
                            isFromThisContinent: true
                        });
                    }
                });
            });
        });

        relationshipsContainer.innerHTML = `
            <h3>Races & Classes in ${this.currentSelection}</h3>
            <details>
                <summary>Native Races (${raceRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(raceRelations.entries()).map(([race, relations]) => `
                        <details>
                            <summary class="relationship-item emphasized">
                                <div class="relationship-header">
                                    <span class="relationship-name">${race}</span>
                                    <div class="nav-buttons">
                                        ${this.createNavButton('race', race, '→')}
                                        <small>(${relations.length} specialization${relations.length > 1 ? 's' : ''})</small>
                                    </div>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    <strong>Native to ${this.currentSelection} because:</strong> ${relations[0].reason}<br><br>
                                    <strong>Class Specializations:</strong><br>
                                    ${relations.map(rel => `
                                        <div class="relationship-item emphasized">
                                            <div class="relationship-header">
                                                <span><strong>${rel.class} (${rel.subclass})</strong>: ${rel.subclassReason}</span>
                                                ${this.createNavButton('class', rel.class, rel.subclass, rel.subclass)}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
            <details>
                <summary>Prominent Classes (${classRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(classRelations.entries()).map(([className, subclasses]) => `
                        <details>
                            <summary class="relationship-item emphasized">
                                <div class="relationship-header">
                                    <span class="relationship-name">${className}</span>
                                    <div class="nav-buttons">
                                        ${this.createNavButton('class', className, '→')}
                                        <small>(${subclasses.length} subclass${subclasses.length > 1 ? 'es' : ''})</small>
                                    </div>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    ${subclasses.map(sc => `
                                        <div class="relationship-item emphasized">
                                            <div class="relationship-header">
                                                <span><strong>${sc.subclass}:</strong> ${sc.reason}</span>
                                                ${this.createNavButton('class', className, sc.subclass, sc.subclass)}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
    },

    renderRaceDetails(infoContainer, relationshipsContainer) {
        // Normalize the race name for data lookup
        const normalizedRaceName = this.normalizeRaceName(this.currentSelection);

        infoContainer.innerHTML = `
            <div class="sticky-info">
                <h3>About ${this.currentSelection}</h3>
                <p>The ${this.currentSelection} race has adapted to various continents across Alabastria, developing unique relationships with different classes and specializations.</p>
                <button id="jump-to-top" class="jump-btn" onclick="app.jumpToTop()" style="display: none;">↑ Top</button>
            </div>
        `;

        // Find class and continent relationships for this race
        const classRelations = new Map();
        const continentRelations = new Map();

        this.relationData.forEach(classData => {
            classData.subclasses.forEach(subclass => {
                // Look for exact match first, then try normalized name
                let raceData = subclass.races.find(r => r.name === this.currentSelection);
                if (!raceData) {
                    raceData = subclass.races.find(r => r.name === normalizedRaceName);
                }

                if (raceData) {
                    if (!classRelations.has(classData.class)) {
                        classRelations.set(classData.class, []);
                    }
                    classRelations.get(classData.class).push({
                        subclass: subclass.subclass,
                        reason: raceData.subclass_reason,
                        continent: raceData.continent,
                        continentReason: raceData.continent_reason
                    });

                    if (!continentRelations.has(raceData.continent)) {
                        continentRelations.set(raceData.continent, []);
                    }
                    continentRelations.get(raceData.continent).push({
                        class: classData.class,
                        subclass: subclass.subclass,
                        reason: raceData.continent_reason
                    });
                }
            });
        });

        relationshipsContainer.innerHTML = `
            <h3>${this.currentSelection} Relationships</h3>
            <details>
                <summary>Suitable Classes (${classRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(classRelations.entries()).map(([className, subclasses]) => `
                        <details>
                            <summary class="relationship-item">
                                <div class="relationship-header">
                                    <span class="relationship-name">${className}</span>
                                    <div class="nav-buttons">
                                        ${this.createNavButton('class', className, '→')}
                                        <small>(${subclasses.length} subclass${subclasses.length > 1 ? 'es' : ''})</small>
                                    </div>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    ${subclasses.map(sc => `
                                        <div class="relationship-item">
                                            <div class="relationship-header">
                                                <span><strong>${sc.subclass}:</strong> ${sc.reason} <em>(in ${sc.continent})</em></span>
                                                <div class="nav-buttons">
                                                    ${this.createNavButton('continent', sc.continent, '→')}
                                                    ${this.createNavButton('class', className, sc.subclass, sc.subclass)}
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
            <details>
                <summary>Found in Continents (${continentRelations.size})</summary>
                <div class="details-content-inner">
                    ${Array.from(continentRelations.entries()).map(([continent, classes]) => `
                        <details>
                            <summary class="relationship-item">
                                <div class="relationship-header">
                                    <span class="relationship-name">${continent}</span>
                                    <div class="nav-buttons">
                                        ${this.createNavButton('continent', continent, '→')}
                                        <small>(${classes.length} specialization${classes.length > 1 ? 's' : ''})</small>
                                    </div>
                                </div>
                            </summary>
                            <div class="details-content-inner">
                                <div class="relationship-reason">
                                    <strong>Why they're here:</strong> ${classes[0].reason}<br><br>
                                    <strong>Specializations:</strong><br>
                                    ${classes.map(c => `
                                        <div class="relationship-item">
                                            <div class="relationship-header">
                                                <span>${c.class} (${c.subclass})</span>
                                                ${this.createNavButton('class', c.class, c.subclass, c.subclass)}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
    },

    renderClassDetails(infoContainer, relationshipsContainer) {
        const classData = this.relationData.find(c => c.class === this.currentSelection);

        infoContainer.innerHTML = `
            <div class="sticky-info">
                <h3>About ${this.currentSelection}</h3>
                <p>${classData.suitability_reason}</p>
                <button id="jump-to-top" class="jump-btn" onclick="app.jumpToTop()" style="display: none;">↑ Top</button>
            </div>
        `;

        // Organize subclasses and their relationships
        relationshipsContainer.innerHTML = `
            <h3>${this.currentSelection} Subclasses & Relationships</h3>
            <details>
                <summary>Subclasses (${classData.subclasses.length})</summary>
                <div class="details-content-inner">
                    ${classData.subclasses.map(subclass => {
            const subclassId = `subclass-${subclass.subclass.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
            return `
                        <details id="${subclassId}">
                            <summary class="subclass-section">
                                <h4>${subclass.subclass}</h4>
                            </summary>
                            <div class="details-content-inner">
                                <details>
                                    <summary>Suitable Races (${subclass.races.length})</summary>
                                    <div class="details-content-inner">
                                        ${subclass.races.map(race => `
                                            <details>
                                                <summary class="relationship-item">
                                                    <div class="relationship-header">
                                                        <span class="relationship-name">${race.name}</span>
                                                        <div class="nav-buttons">
                                                            ${this.createNavButton('race', race.name, '→')}
                                                            ${this.createNavButton('continent', race.continent, race.continent.split(' ')[0])}
                                                            <small>(${race.continent})</small>
                                                        </div>
                                                    </div>
                                                </summary>
                                                <div class="details-content-inner">
                                                    <div class="relationship-reason">
                                                        <strong>Why suitable:</strong> ${race.subclass_reason}<br>
                                                        <strong>Continental context:</strong> ${race.continent_reason}
                                                    </div>
                                                </div>
                                            </details>
                                        `).join('')}
                                    </div>
                                </details>
                                ${subclass.prominent_continents ? `
                                    <details>
                                        <summary>Prominent Continents (${subclass.prominent_continents.length})</summary>
                                        <div class="details-content-inner">
                                            ${subclass.prominent_continents.map(continent => `
                                                <details>
                                                    <summary class="relationship-item emphasized">
                                                        <div class="relationship-header">
                                                            <span class="relationship-name">${continent.continent}</span>
                                                            ${this.createNavButton('continent', continent.continent, '→')}
                                                        </div>
                                                    </summary>
                                                    <div class="details-content-inner">
                                                        <div class="relationship-reason">
                                                            ${continent.reason}
                                                        </div>
                                                    </div>
                                                </details>
                                            `).join('')}
                                        </div>
                                    </details>
                                ` : ''}
                            </div>
                        </details>
                    `}).join('')}
                </div>
            </details>
        `;
    }
};
