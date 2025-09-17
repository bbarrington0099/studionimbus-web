const app = {
    allElements: null,
    colorModeCheckbox: null,
    currentFilter: null,
    currentSelection: null,
    currentSubclass: null, // Track subclass for auto-scrolling
    continentData: [],
    relationData: [],
    classInformationData: [], // Comprehensive class information
    raceInformationData: [], // Comprehensive race information
    playstyleGuideData: null, // Player selection guide
    navigationHistory: [], // Track navigation history
    worldHistoryData: [], // World history timeline data
    guildData: null, // Guild information data
    guildStaffData: [], // Guild staff data
    guildMembersData: [], // Guild members data
    questReportsData: [], // Quest reports data
    currentGuildView: 'overview', // Track current guild view
    pantheonData: [], // Pantheon and deity data
    deityRelationshipsData: [], // Deity relationships data
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
        await this.loadPantheonData();
        this.setupModalListeners();
        this.showSection('welcome-section');
    },

    // Setup modal event listeners
    setupModalListeners() {
        const modal = document.getElementById('timeline-modal');
        const deityModal = document.getElementById('deity-modal');

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.closeModal();
            }
            if (event.target === deityModal) {
                this.closeDeityModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
                this.closeDeityModal();
                this.closeImageFullscreen();
            }
        });

        // Setup image click listeners for fullscreen viewing
        this.setupImageFullscreen();
    },

    // Setup image fullscreen functionality
    setupImageFullscreen() {
        // Add click listeners to all images
        document.addEventListener('click', (event) => {
            if (event.target.tagName === 'IMG' && !event.target.classList.contains('no-fullscreen')) {
                // Check if this is a staff image and get additional info
                let additionalCaption = '';
                if (event.target.classList.contains('staff-image')) {
                    const staffName = event.target.alt;
                    const staffMember = this.guildStaffData.find(staff => staff.name === staffName);
                    if (staffMember) {
                        additionalCaption = staffMember.guild_role;
                    }
                }
                this.showImageFullscreen(event.target.src, event.target.alt, additionalCaption);
            }
        });
    },

    // Show image in fullscreen modal
    showImageFullscreen(imageSrc, imageAlt, additionalCaption = '') {
        // Create fullscreen image modal if it doesn't exist
        let imageModal = document.getElementById('image-fullscreen-modal');
        if (!imageModal) {
            imageModal = document.createElement('div');
            imageModal.id = 'image-fullscreen-modal';
            imageModal.className = 'image-fullscreen-modal';
            imageModal.innerHTML = `
                <div class="image-fullscreen-content">
                    <span class="image-fullscreen-close">&times;</span>
                    <img class="image-fullscreen-img" src="" alt="">
                    <div class="image-fullscreen-caption"></div>
                </div>
            `;
            document.body.appendChild(imageModal);

            // Add event listeners
            imageModal.querySelector('.image-fullscreen-close').addEventListener('click', () => {
                this.closeImageFullscreen();
            });

            imageModal.addEventListener('click', (event) => {
                if (event.target === imageModal) {
                    this.closeImageFullscreen();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && imageModal.style.display === 'block') {
                    this.closeImageFullscreen();
                }
            });
        }

        // Set image source and alt text
        const img = imageModal.querySelector('.image-fullscreen-img');
        const caption = imageModal.querySelector('.image-fullscreen-caption');

        img.src = imageSrc;
        img.alt = imageAlt;

        // Display name and guild role if available
        if (additionalCaption) {
            caption.innerHTML = `<div style="font-weight: bold; margin-bottom: 0.5rem;">${imageAlt}</div><div style="font-style: italic; color: var(--ocean-blue);">${additionalCaption}</div>`;
        } else {
            caption.textContent = imageAlt;
        }

        // Show modal
        imageModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    // Close image fullscreen modal
    closeImageFullscreen() {
        const imageModal = document.getElementById('image-fullscreen-modal');
        if (imageModal) {
            imageModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    },

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyNotification(text);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    },

    // Fallback copy method for older browsers
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showCopyNotification(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }

        document.body.removeChild(textArea);
    },

    // Show copy notification
    showCopyNotification(text) {
        // Remove existing notification if any
        const existingNotification = document.getElementById('copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'copy-notification';
        notification.className = 'copy-notification';
        notification.innerHTML = `
            <div class="copy-notification-content">
                <span class="copy-icon">✓</span>
                <span class="copy-text">"${text}" copied to clipboard!</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide notification after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    },

    // Jump to top function
    jumpToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    // Jump to deity search function
    jumpToDeitySearch() {
        // Switch to the pantheon section
        this.showSection('pantheon');

        // Scroll to the deity relationships section
        setTimeout(() => {
            const deitySection = document.querySelector('.pantheon-section');
            if (deitySection) {
                deitySection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
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

    // Load pantheon and deity data
    async loadPantheonData() {
        try {
            const [pantheonResponse, pantheonPart2Response, pantheonPart3Response, pantheonPart4Response, relationshipsResponse] = await Promise.all([
                fetch('json/pantheon_data.json'),
                fetch('json/pantheon_data_part2.json'),
                fetch('json/pantheon_data_part3.json'),
                fetch('json/pantheon_data_part4.json'),
                fetch('json/deity_relationships.json')
            ]);

            const pantheonData1 = await pantheonResponse.json();
            const pantheonData2 = await pantheonPart2Response.json();
            const pantheonData3 = await pantheonPart3Response.json();
            const pantheonData4 = await pantheonPart4Response.json();
            this.pantheonData = [...pantheonData1, ...pantheonData2, ...pantheonData3, ...pantheonData4];
            this.deityRelationshipsData = await relationshipsResponse.json();
            this.filteredDeityRelationships = [...this.deityRelationshipsData];
        } catch (error) {
            console.error('Error loading pantheon data:', error);
        }
    },

    // Load data from JSON files
    async loadData() {
        try {
            const [continentResponse, relationResponse, classInfoResponse, raceInfoResponse, playstyleResponse] = await Promise.all([
                fetch('json/continent_data.json'),
                fetch('json/relation_data.json'),
                fetch('json/class_information.json'),
                fetch('json/race_information.json'),
                fetch('json/playstyle_guide.json')
            ]);

            this.continentData = await continentResponse.json();
            this.relationData = await relationResponse.json();
            this.classInformationData = await classInfoResponse.json();
            this.raceInformationData = await raceInfoResponse.json();
            this.playstyleGuideData = await playstyleResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    // Load world description from continent data
    loadWorldDescription() {
        const worldData = this.continentData.find(item => item.world);
        if (worldData) {
            document.getElementById('world-description').innerHTML = worldData.description;
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
        // Close any open modals
        this.closeModal();
        this.closeDeityModal();
        this.closeBackupModals();

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
            case 'playstyle':
                title.textContent = 'Find Your Perfect Class';
                break;
        }
        grid.innerHTML = '';

        if (this.currentFilter === 'continent') {
            this.renderContinents(grid);
        } else if (this.currentFilter === 'race') {
            this.renderRaces(grid);
        } else if (this.currentFilter === 'class') {
            this.renderClasses(grid);
        } else if (this.currentFilter === 'playstyle') {
            this.renderPlaystyleGuide(grid);
        }

        this.showSection('selection-section');
    },

    renderContinents(container) {
        // Filter out the world entry and Kingdom of Kamalatman, render continents
        const continents = this.continentData.filter(item => item.continent && item.continent !== 'Kingdom of Kamalatman');

        continents.forEach(continent => {
            const card = document.createElement('div');
            card.className = 'selection-card continent-card';
            // Store the full continent name for lookup
            card.onclick = () => this.selectItem(continent.continent);

            // Apply continent gradient background
            const gradient = this.getContinentGradient(continent.continent);
            card.style.background = gradient;

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
        // Add search bar
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-bar">
                <input type="text" id="race-search" placeholder="Search races and subraces..." 
                       onkeyup="app.filterRaces()" class="search-input">
                <select id="race-ability-filter" onchange="app.filterRaces()" class="filter-select">
                    <option value="">All Ability Scores</option>
                    <option value="any">Any Ability Increase</option>
                    <option value="str">Strength (+1 or +2)</option>
                    <option value="dex">Dexterity (+1 or +2)</option>
                    <option value="con">Constitution (+1 or +2)</option>
                    <option value="int">Intelligence (+1 or +2)</option>
                    <option value="wis">Wisdom (+1 or +2)</option>
                    <option value="cha">Charisma (+1 or +2)</option>
                    <option value="plus2">+2 Ability Increase</option>
                </select>
                <button onclick="app.clearRaceSearch()" class="clear-search-btn">Clear</button>
            </div>
        `;
        container.appendChild(searchContainer);

        // Add results container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'race-results';
        resultsContainer.className = 'results-container selection-results-grid';
        container.appendChild(resultsContainer);

        // Store original data for filtering
        this.originalRaceData = [...this.raceInformationData];
        this.filteredRaceData = [...this.raceInformationData];

        this.renderRaceResults();
    },

    renderRaceResults() {
        const resultsContainer = document.getElementById('race-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        this.filteredRaceData.forEach(raceData => {
            const card = document.createElement('div');
            card.className = 'selection-card race-card';
            card.onclick = () => this.selectItem(raceData.race);

            card.innerHTML = `
                <h3>${raceData.race}</h3>
                <p class="race-description">${raceData.description}</p>
                <div class="race-info">
                    <div class="race-stat">
                        <strong>Size:</strong> ${raceData.size}
                    </div>
                    <div class="race-stat">
                        <strong>Speed:</strong> ${raceData.speed}
                    </div>
                    <div class="race-stat">
                        <strong>Ability Scores:</strong> ${Object.entries(raceData.ability_score_increase).map(([ability, value]) => `${ability} +${value}`).join(', ')}
                    </div>
                </div>
                <p class="race-playstyle">${raceData.playstyle}</p>
                ${raceData.subraces && raceData.subraces.length > 0 ? `<div class="subrace-count">${raceData.subraces.length} subraces available</div>` : ''}
            `;

            resultsContainer.appendChild(card);
        });
    },

    filterRaces() {
        const searchTerm = document.getElementById('race-search').value.toLowerCase();
        const abilityFilter = document.getElementById('race-ability-filter').value;

        if (searchTerm === '' && abilityFilter === '') {
            this.filteredRaceData = [...this.originalRaceData];
        } else {
            this.filteredRaceData = this.originalRaceData.filter(raceData => {
                // Search term filtering - only search names
                if (searchTerm !== '') {
                    let matchesSearch = false;

                    // Search in race name
                    if (raceData.race.toLowerCase().includes(searchTerm)) matchesSearch = true;

                    // Special case: If searching for Dragonborn colors, always show Dragonborn
                    if (raceData.race.toLowerCase() === 'dragonborn') {
                        const dragonbornColors = ['black', 'blue', 'green', 'red', 'white', 'brass', 'bronze', 'copper', 'gold', 'silver', 'amethyst', 'crystal', 'emerald', 'sapphire', 'topaz', 'chromatic', 'metallic', 'gem'];
                        // Check if search term matches any Dragonborn color (partial or exact)
                        if (dragonbornColors.some(color => color.includes(searchTerm) || searchTerm.includes(color))) {
                            matchesSearch = true;
                        }
                    }

                    // Search in subraces (including Dragonborn colors)
                    if (raceData.subraces) {
                        if (raceData.subraces.some(subrace => {
                            const subraceName = subrace.name.toLowerCase();
                            const subraceDesc = subrace.description ? subrace.description.toLowerCase() : '';

                            return subraceName.includes(searchTerm) ||
                                // Dragonborn color matching (partial)
                                (subraceName.includes('chromatic') && 'chromatic'.includes(searchTerm)) ||
                                (subraceName.includes('metallic') && 'metallic'.includes(searchTerm)) ||
                                (subraceName.includes('gem') && 'gem'.includes(searchTerm)) ||
                                // Individual color matching in descriptions (partial)
                                (['black', 'blue', 'green', 'red', 'white'].some(color => color.includes(searchTerm) && subraceDesc.includes(color))) ||
                                (['brass', 'bronze', 'copper', 'gold', 'silver'].some(color => color.includes(searchTerm) && subraceDesc.includes(color))) ||
                                (['amethyst', 'crystal', 'emerald', 'sapphire', 'topaz'].some(color => color.includes(searchTerm) && subraceDesc.includes(color)));
                        })) {
                            matchesSearch = true;
                        }
                    }

                    if (!matchesSearch) return false;
                }

                // Ability score filtering
                if (abilityFilter !== '') {
                    const abilityScores = raceData.ability_score_increase;
                    const hasAbilityIncrease = Object.values(abilityScores).some(value => value > 0);

                    if (abilityFilter === 'any' && !hasAbilityIncrease) return false;
                    if (abilityFilter === 'str' && (!abilityScores.Strength || abilityScores.Strength === 0)) return false;
                    if (abilityFilter === 'dex' && (!abilityScores.Dexterity || abilityScores.Dexterity === 0)) return false;
                    if (abilityFilter === 'con' && (!abilityScores.Constitution || abilityScores.Constitution === 0)) return false;
                    if (abilityFilter === 'int' && (!abilityScores.Intelligence || abilityScores.Intelligence === 0)) return false;
                    if (abilityFilter === 'wis' && (!abilityScores.Wisdom || abilityScores.Wisdom === 0)) return false;
                    if (abilityFilter === 'cha' && (!abilityScores.Charisma || abilityScores.Charisma === 0)) return false;
                    if (abilityFilter === 'plus2' && !Object.values(abilityScores).some(value => value === 2)) return false;
                }

                return true;
            });
        }

        this.renderRaceResults();
    },

    clearRaceSearch() {
        document.getElementById('race-search').value = '';
        document.getElementById('race-ability-filter').value = '';
        this.filteredRaceData = [...this.originalRaceData];
        this.renderRaceResults();
    },

    renderClasses(container) {
        // Add search bar
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-bar">
                <input type="text" id="class-search" placeholder="Search classes and subclasses..." 
                       onkeyup="app.filterClasses()" class="search-input">
                <select id="class-ability-filter" onchange="app.filterClasses()" class="filter-select">
                    <option value="">All Primary Abilities</option>
                    <option value="Strength">Strength</option>
                    <option value="Dexterity">Dexterity</option>
                    <option value="Constitution">Constitution</option>
                    <option value="Intelligence">Intelligence</option>
                    <option value="Wisdom">Wisdom</option>
                    <option value="Charisma">Charisma</option>
                </select>
                <button onclick="app.clearClassSearch()" class="clear-search-btn">Clear</button>
            </div>
        `;
        container.appendChild(searchContainer);

        // Add results container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'class-results';
        resultsContainer.className = 'results-container selection-results-grid';
        container.appendChild(resultsContainer);

        // Store original data for filtering
        this.originalClassData = [...this.classInformationData];
        this.filteredClassData = [...this.classInformationData];

        this.renderClassResults();
    },

    renderClassResults() {
        const resultsContainer = document.getElementById('class-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        this.filteredClassData.forEach(classData => {
            const card = document.createElement('div');
            card.className = 'selection-card class-card';
            card.onclick = () => this.selectItem(classData.class);

            card.innerHTML = `
                <h3>${classData.class}</h3>
                <p class="class-description">${classData.description}</p>
                <div class="class-info">
                    <span class="class-role">${classData.role}</span>
                    <span class="class-ability">Primary: ${classData.primary_ability}</span>
                    <span class="class-hit-die">Hit Die: ${classData.hit_die}</span>
                </div>
                <p class="class-playstyle">${classData.playstyle}</p>
            `;

            resultsContainer.appendChild(card);
        });
    },

    filterClasses() {
        const searchTerm = document.getElementById('class-search').value.toLowerCase();
        const abilityFilter = document.getElementById('class-ability-filter').value;

        if (searchTerm === '' && abilityFilter === '') {
            this.filteredClassData = [...this.originalClassData];
        } else {
            this.filteredClassData = this.originalClassData.filter(classData => {
                // Search term filtering - only search names
                if (searchTerm !== '') {
                    let matchesSearch = false;

                    // Search in class name
                    if (classData.class.toLowerCase().includes(searchTerm)) matchesSearch = true;

                    // Search in subclasses
                    if (classData.subclasses) {
                        if (classData.subclasses.some(subclass =>
                            subclass.name && subclass.name.toLowerCase().includes(searchTerm)
                        )) matchesSearch = true;
                    }

                    if (!matchesSearch) return false;
                }

                // Primary ability filtering - loose search
                if (abilityFilter !== '') {
                    const primaryAbility = classData.primary_ability.toLowerCase();
                    const filterAbility = abilityFilter.toLowerCase();

                    // Check if the filter ability is contained in the primary ability string
                    if (!primaryAbility.includes(filterAbility)) {
                        return false;
                    }
                }

                return true;
            });
        }

        this.renderClassResults();
    },

    clearClassSearch() {
        document.getElementById('class-search').value = '';
        document.getElementById('class-ability-filter').value = '';
        this.filteredClassData = [...this.originalClassData];
        this.renderClassResults();
    },

    renderPlaystyleGuide(container) {
        if (!this.playstyleGuideData) {
            container.innerHTML = '<p>Playstyle guide not available.</p>';
            return;
        }

        const guide = this.playstyleGuideData;

        // Render playstyle categories
        guide.playstyle_categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'selection-card playstyle-card';
            card.onclick = () => this.selectItem(category.name);

            card.innerHTML = `
                <h3>${category.name}</h3>
                <p class="playstyle-description">${category.description}</p>
                <div class="recommended-classes">
                    <strong>Recommended Classes:</strong>
                    <div class="class-list">
                        ${category.recommended_classes.map(rec => `
                            <span class="class-tag">${rec.class} (${rec.subclass})</span>
                        `).join('')}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        // Add ability score priorities section
        const abilityCard = document.createElement('div');
        abilityCard.className = 'selection-card ability-scores-card';
        abilityCard.onclick = () => this.selectItem('Ability Scores');

        abilityCard.innerHTML = `
            <h3>Ability Score Priorities</h3>
            <p>Understanding which abilities are most important for each class</p>
            <div class="ability-info">
                <strong>Click to explore ability score details and class recommendations</strong>
            </div>
        `;

        container.appendChild(abilityCard);

        // Add complexity levels section
        const complexityCard = document.createElement('div');
        complexityCard.className = 'selection-card complexity-card';
        complexityCard.onclick = () => this.selectItem('Complexity Levels');

        complexityCard.innerHTML = `
            <h3>Class Complexity Levels</h3>
            <p>Find classes that match your experience level and preferred complexity</p>
            <div class="complexity-info">
                <strong>Click to explore complexity levels and class recommendations</strong>
            </div>
        `;

        container.appendChild(complexityCard);
    },

    // Details section
    selectItem(itemName) {
        this.currentSelection = itemName;
        this.showDetailsSection();
    },

    showDetailsSection() {
        const title = document.getElementById('details-title');
        const info = document.getElementById('details-info');

        title.textContent = this.currentSelection;

        // Update section header with navigation buttons
        this.updateSectionHeader();

        if (this.currentFilter === 'continent') {
            this.renderContinentDetails(info);
        } else if (this.currentFilter === 'race') {
            this.renderRaceDetails(info);
        } else if (this.currentFilter === 'class') {
            this.renderClassDetails(info);
        } else if (this.currentFilter === 'playstyle') {
            this.renderPlaystyleDetails(info);
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

    // Show pantheon and deities
    showPantheon() {
        this.showSection('pantheon-section');
        this.renderPantheon();
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
                        <div style="margin: 0.5rem 0; padding: 0.5rem; border-left: 3px solid var(--glass-bg); background: rgba(139, 69, 19, 0.1);">
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
                        <div class="rank-header">
                           <img src="rankImages/${rank.name.toLowerCase()}_rank.png" alt="${rank.name} Rank" class="rank-image" onerror="this.style.display='none'">
                           <div class="rank-title">
                              <h4>${rank.name}</h4>
                              <div class="rank-level">Level ${rank.level}</div>
                           </div>
                        </div>
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
               
               <div class="search-container">
                   <div class="search-bar">
                       <input type="text" id="staff-search" placeholder="Search by staff name..." 
                              onkeyup="app.filterGuildStaff()" class="search-input">
                       <select id="staff-role-filter" onchange="app.filterGuildStaff()" class="filter-select">
                           <option value="">All Roles</option>
                           ${[...new Set(this.guildStaffData.map(s => s.guild_role))].map(role =>
            `<option value="${role}">${role}</option>`
        ).join('')}
                       </select>
                       <button onclick="app.clearGuildStaffFilters()" class="clear-search-btn">Clear All</button>
                   </div>
               </div>
               
               <div id="staff-results" class="staff-grid">
                  ${this.renderGuildStaffResults()}
               </div>
            </div>
         </div>
      `;
    },

    renderGuildStaffResults() {
        if (!this.filteredGuildStaffData) {
            this.filteredGuildStaffData = [...this.guildStaffData];
        }

        return this.filteredGuildStaffData.map(staff => `
                     <div class="staff-card">
                        <img src="staffImages/${staff.image}" alt="${staff.name}" class="staff-image" onerror="this.style.display='none'">
                        <div class="staff-info">
                           <div class="member-header">
                              <img src="rankImages/${staff.rank.toLowerCase()}_rank.png" alt="${staff.rank} Rank" class="member-rank-image" onerror="this.style.display='none'">
                              <div class="member-title">
                                 <h3>${staff.name}</h3>
                                 <div class="staff-role">${staff.guild_role}</div>
                                 <div class="staff-rank rank-${staff.rank.toLowerCase()}">${staff.rank} Rank</div>
                              </div>
                           </div>
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
                                 <p style="margin: 0.5rem 0; line-height: 1.6;">${this.makeDeityNamesClickable(staff.faith)}</p>
                              </details>
                           ` : ''}
                           
                           <details style="margin: 1rem 0;">
                              <summary style="cursor: pointer; font-weight: 600; color: var(--ocean-blue);">Background</summary>
                              <p style="margin: 0.5rem 0; line-height: 1.6;">${staff.background}</p>
                           </details>
                        </div>
                     </div>
                  `).join('');
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
               
               <div class="search-container">
                   <div class="search-bar">
                       <input type="text" id="member-search" placeholder="Search by member name..." 
                              onkeyup="app.filterGuildMembers()" class="search-input">
                       <select id="member-manager-filter" onchange="app.filterGuildMembers()" class="filter-select">
                           <option value="">All Managers</option>
                           ${[...new Set(this.guildMembersData.map(m => m.managed_by))].map(manager =>
            `<option value="${manager}">${manager}</option>`
        ).join('')}
                       </select>
                       <select id="member-rank-filter" onchange="app.filterGuildMembers()" class="filter-select">
                           <option value="">All Ranks</option>
                           ${[...new Set(this.guildMembersData.map(m => m.rank))].map(rank =>
            `<option value="${rank}">${rank}</option>`
        ).join('')}
                       </select>
                       <button onclick="app.clearGuildMemberFilters()" class="clear-search-btn">Clear All</button>
                   </div>
               </div>
               
               <div id="member-results" class="members-grid">
                  ${this.renderGuildMemberResults()}
               </div>
            </div>
         </div>
      `;
    },

    renderGuildMemberResults() {
        if (!this.filteredGuildMembersData) {
            this.filteredGuildMembersData = [...this.guildMembersData];
        }

        return this.filteredGuildMembersData.map(member => {
            const memberQuests = this.getMemberQuestParticipation(member.name);
            return `
                        <div class="member-card">
                           <img src="memberImages/${member.image}" alt="${member.name}" class="member-image" onerror="this.style.display='none'">
                           <div class="member-info">
                              <div class="member-header">
                                 <img src="rankImages/${member.rank.toLowerCase()}_rank.png" alt="${member.rank} Rank" class="member-rank-image" onerror="this.style.display='none'">
                                 <div class="member-title">
                                    <h3>${member.name}</h3>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                       <div class="member-rank rank-${member.rank.toLowerCase()}">${member.rank} Rank</div>
                                       <div class="member-rank rank-${member.rank.toLowerCase()}" style="background: var(--glass-bg);">${memberQuests.length} Quest${memberQuests.length !== 1 ? 's' : ''}</div>
                                    </div>
                                 </div>
                              </div>
                              <div class="member-class">Level ${member.level} ${member.class}</div>
                              <div class="member-managed">${member.managed_by}</div>
                              
                              <div class="guild-member-description">
                                 <strong>Status:</strong> ${member.status}
                              </div>
                              
                              <div class="guild-member-description">
                                 <strong>Specialization:</strong> ${member.specialization}
                              </div>
                              
                              ${member.deity ? `
                                 <div class="guild-member-description">
                                    <strong>Deity:</strong> 
                                    <button class="deity-button" onclick="app.showDeityDetails('${member.deity}')" style="
                                       background: var(--gold-accent);
                                       color: var(--parchment-dark);
                                       border: none;
                                       padding: 0.3rem 0.6rem;
                                       border-radius: 4px;
                                       cursor: pointer;
                                       font-weight: 600;
                                       margin-left: 0.5rem;
                                       transition: var(--transition);
                                    " onmouseover="this.style.background='var(--ocean-blue)'" onmouseout="this.style.background='var(--gold-accent)'">
                                       ${member.deity}
                                    </button>
                                 </div>
                                 ${member.deity_reasoning ? `
                                    <div style="margin: 0.5rem 0; font-style: italic; color: var(--text-muted); font-size: 0.9rem;">
                                       ${member.deity_reasoning}
                                    </div>
                                 ` : ''}
                              ` : ''}
                              
                              ${memberQuests.length > 0 ? `
                                 <details style="margin: 1rem 0;">
                                    <summary class="quest-participation-summary">Quest Participation (${memberQuests.length})</summary>
                                    <div style="margin: 0.5rem 0;">
                                       ${memberQuests.map(quest => `
                                          <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--glass-bg); border-radius: 4px; background: rgba(74, 93, 35, 0.1);">
                                             <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span><strong>${quest.quest_name}</strong> [${quest.quest_rank}]</span>
                                                <button class="nav-btn" onclick="app.jumpToQuestReport('${quest.quest_name}')" style="margin: 0;">View Report</button>
                                             </div>
                                             <div class="quest-participation-role">
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
        }).join('');
    },

    filterGuildMembers() {
        const searchTerm = document.getElementById('member-search').value.toLowerCase();
        const managerFilter = document.getElementById('member-manager-filter').value;
        const rankFilter = document.getElementById('member-rank-filter').value;

        this.filteredGuildMembersData = this.guildMembersData.filter(member => {
            // Name search
            if (searchTerm && !member.name.toLowerCase().includes(searchTerm)) return false;

            // Manager filter
            if (managerFilter && member.managed_by !== managerFilter) return false;

            // Rank filter
            if (rankFilter && member.rank !== rankFilter) return false;

            return true;
        });

        // Update the results
        const resultsContainer = document.getElementById('member-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderGuildMemberResults();
        }
    },

    clearGuildMemberFilters() {
        document.getElementById('member-search').value = '';
        document.getElementById('member-manager-filter').value = '';
        document.getElementById('member-rank-filter').value = '';
        this.filteredGuildMembersData = [...this.guildMembersData];

        const resultsContainer = document.getElementById('member-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderGuildMemberResults();
        }
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
                              <span style="display: inline-block; margin: 0.2rem 0.5rem 0.2rem 0; padding: 0.2rem 0.5rem; background: var(--ocean-blue); color: var(--parchment-light); border-radius: 10px; font-size: 0.8rem;">
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
               
               <div class="search-container">
                   <div class="search-bar">
                       <input type="text" id="quest-search" placeholder="Search by quest name or member..." 
                              onkeyup="app.filterQuestReports()" class="search-input">
                       <select id="quest-rank-filter" onchange="app.filterQuestReports()" class="filter-select">
                           <option value="">All Ranks</option>
                           ${[...new Set(this.questReportsData.map(q => q.quest_rank))].map(rank =>
                `<option value="${rank}">${rank}</option>`
            ).join('')}
                       </select>
                       <button onclick="app.clearQuestFilters()" class="clear-search-btn">Clear All</button>
                   </div>
               </div>
               
               <div id="quest-results" style="margin-bottom: 1rem;">
                  ${this.renderQuestResults()}
               </div>
            </div>
         </div>
      `;
    },

    renderQuestResults() {
        if (!this.filteredQuestReportsData) {
            this.filteredQuestReportsData = [...this.questReportsData];
        }

        return this.filteredQuestReportsData.map(quest => `
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
                                 <h4 class="party-member-header">Party Members</h4>
                                 ${quest.party_members.map(member => `
                                    <div style="margin-bottom: 0.5rem; padding: 0.5rem; border-left: 3px solid var(--glass-bg); background: rgba(74, 93, 35, 0.1);">
                                       <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                                          <strong>${member.name}</strong>
                                          <button class="nav-btn" onclick="app.jumpToGuildMember('${member.name}')" style="margin: 0; font-size: 0.7rem;">View Member</button>
                                       </div>
                                       <span class="party-member-details">${member.rank_at_time} - ${member.role}</span>
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
                  `).join('');
    },

    filterQuestReports() {
        const searchTerm = document.getElementById('quest-search').value.toLowerCase();
        const rankFilter = document.getElementById('quest-rank-filter').value;

        this.filteredQuestReportsData = this.questReportsData.filter(quest => {
            // Quest name search
            if (searchTerm && !quest.quest_name.toLowerCase().includes(searchTerm)) {
                // Check if any party member matches the search
                const memberMatch = quest.party_members.some(member =>
                    member.name.toLowerCase().includes(searchTerm)
                );
                if (!memberMatch) return false;
            }

            // Rank filter
            if (rankFilter && quest.quest_rank !== rankFilter) return false;

            return true;
        });

        // Update the results
        const resultsContainer = document.getElementById('quest-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderQuestResults();
        }
    },

    clearQuestFilters() {
        document.getElementById('quest-search').value = '';
        document.getElementById('quest-rank-filter').value = '';
        this.filteredQuestReportsData = [...this.questReportsData];

        const resultsContainer = document.getElementById('quest-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderQuestResults();
        }
    },

    filterGuildStaff() {
        const searchTerm = document.getElementById('staff-search').value.toLowerCase();
        const roleFilter = document.getElementById('staff-role-filter').value;

        this.filteredGuildStaffData = this.guildStaffData.filter(staff => {
            // Name search
            if (searchTerm && !staff.name.toLowerCase().includes(searchTerm)) return false;

            // Role filter
            if (roleFilter && staff.guild_role !== roleFilter) return false;

            return true;
        });

        // Update the results
        const resultsContainer = document.getElementById('staff-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderGuildStaffResults();
        }
    },

    clearGuildStaffFilters() {
        document.getElementById('staff-search').value = '';
        document.getElementById('staff-role-filter').value = '';
        this.filteredGuildStaffData = [...this.guildStaffData];

        const resultsContainer = document.getElementById('staff-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderGuildStaffResults();
        }
    },

    // Jump to specific quest report
    jumpToQuestReport(questName) {
        // Close any open modals
        this.closeModal();
        this.closeDeityModal();
        this.closeBackupModals();

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
        // Close any open modals
        this.closeModal();
        this.closeDeityModal();
        this.closeBackupModals();

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

        this.createTimelineBackupModal(period);
    },

    // Create timeline backup modal
    createTimelineBackupModal(period) {
        // Remove any existing backup modal
        const existingBackup = document.getElementById('backup-timeline-modal');
        if (existingBackup) {
            existingBackup.remove();
        }

        // Create new backup modal
        const backupModal = document.createElement('div');
        backupModal.id = 'backup-timeline-modal';
        backupModal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            z-index: 99999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        `;

        backupModal.innerHTML = `
            <div class="deity-modal-content">
                <div class="deity-modal-header">
                    <h2>
                        <span class="deity-modal-icon">📜</span> ${period.period}: ${period.title}
                    </h2>
                    <button class="deity-modal-close" onclick="document.getElementById('backup-timeline-modal').remove()">&times;</button>
         </div>

                <div class="deity-modal-body">
                    <div class="deity-history-section">
                        <h3>Overview</h3>
                        <p>${period.details.overview}</p>
                    </div>

                    <div class="deity-history-section">
                        <h3>Major Events</h3>
            ${period.details.events.map(event => `
                           <div class="deity-history-period">
                              <h4>${event.name}</h4>
                              <p>${event.description}</p>
               </div>
            `).join('')}
         </div>

                    <div class="deity-history-section">
                        <h3>Continental Developments</h3>
            ${Object.entries(period.details.continents).map(([continent, description]) => `
                           <div class="deity-info-card">
                              <h4>${continent}</h4>
                              <p>${description}</p>
               </div>
            `).join('')}
                    </div>
                </div>
         </div>
      `;

        document.body.appendChild(backupModal);
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('timeline-modal');
        modal.style.display = 'none';
    },

    // Close backup modals
    closeBackupModals() {
        const backupTimelineModal = document.getElementById('backup-timeline-modal');
        const backupDeityModal = document.getElementById('backup-deity-modal');

        if (backupTimelineModal) {
            backupTimelineModal.remove();
        }
        if (backupDeityModal) {
            backupDeityModal.remove();
        }
    },

    adjustFlagHeights() {
        // Get the continent map image
        const mapImage = document.getElementById('continent-map');
        if (!mapImage) {
            return;
        }

        // Get the actual height of the map image
        const mapHeight = mapImage.offsetHeight;

        if (mapHeight === 0) {
            setTimeout(() => this.adjustFlagHeights(), 50);
            return;
        }

        // Calculate the size for flags and ruler portraits (should be square and fit with the map)
        // With 4 images max (map + kingdom flag + continent flag + ruler), each should be roughly equal
        const flagSize = Math.min(mapHeight, 200); // Cap at 200px to ensure they fit in the row

        // Find all flag images and ruler portraits, set their height to match the calculated size
        const flagImages = document.querySelectorAll('.flag-image');

        flagImages.forEach(flag => {
            flag.style.height = flagSize + 'px';
            flag.style.width = flagSize + 'px'; // Make them square
            flag.style.objectFit = 'cover';
        });
    },

    // Render pantheon and deities
    renderPantheon() {
        const pantheonContent = document.getElementById('pantheon-content');
        if (!pantheonContent) return;

        pantheonContent.innerHTML = `
            <div class="pantheon-info">
                <h3>The Pantheons of Alabastria</h3>
                <p style="margin-bottom: 1rem;">Since The Bringing 800 cycles ago, the gods of various races have found new followers and established their influence across the continents of Alabastria. Each pantheon represents the core values and beliefs of their respective peoples.</p>
            </div>

            <div class="pantheon-details">
                <div class="pantheon-section">
                    <h3>Pantheons & Deities</h3>
                    <div class="pantheon-grid">
                        ${this.pantheonData.map(pantheon => `
                            <div class="pantheon-card">
                                <div class="pantheon-header">
                                    <i class="${pantheon.symbol} pantheon-icon"></i>
                                    <h4>${pantheon.pantheon}</h4>
                                </div>
                                <p class="pantheon-description">${pantheon.description}</p>
                                <div class="deities-list">
                                    <strong>Deities (${pantheon.deities.length}):</strong>
                                    <div class="deity-tags">
                                        ${pantheon.deities.map(deity => `
                                            <span class="deity-tag" onclick="app.showDeityDetails('${deity.name}')" title="Click to view details">
                                                <i class="${deity.symbol}" style="color: ${this.getDeityFirstColor(deity.name)};"></i> ${deity.name}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="pantheon-section">
                    <h3>Deity Relationships</h3>
                    <p style="margin-bottom: 1rem;">Understanding which deities are favored by different races, classes, and continents can help you choose the right patron for your character.</p>
                    
                    <div class="search-container">
                        <div class="search-bar">
                            <select id="deity-alignment-filter" onchange="app.filterDeityRelationships()" class="filter-select">
                                <option value="">All Alignments</option>
                                <option value="Lawful Good">Lawful Good</option>
                                <option value="Neutral Good">Neutral Good</option>
                                <option value="Chaotic Good">Chaotic Good</option>
                                <option value="Lawful Neutral">Lawful Neutral</option>
                                <option value="True Neutral">True Neutral</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Chaotic Neutral">Chaotic Neutral</option>
                                <option value="Lawful Evil">Lawful Evil</option>
                                <option value="Neutral Evil">Neutral Evil</option>
                                <option value="Chaotic Evil">Chaotic Evil</option>
                            </select>
                            <button onclick="app.clearDeityFilters()" class="clear-search-btn">Clear</button>
                        </div>
                    </div>
                    
                    <div id="deity-relationships-results" class="deity-relationships-grid">
                        ${this.renderDeityRelationships()}
                    </div>
                </div>
            </div>
        `;
    },

    // Render deity relationships
    renderDeityRelationships() {
        // Get current alignment filter
        const alignmentFilterElement = document.getElementById('deity-alignment-filter');
        const alignmentFilter = alignmentFilterElement ? alignmentFilterElement.value : '';

        // Group relationships by deity
        const deityGroups = {};

        this.filteredDeityRelationships.forEach(relationship => {
            [...relationship.primary_deities, ...relationship.secondary_deities].forEach(deity => {
                // If there's an alignment filter, only include deities with that alignment
                if (alignmentFilter && this.getDeityAlignment(deity) !== alignmentFilter) {
                    return;
                }

                if (!deityGroups[deity]) {
                    deityGroups[deity] = {
                        deity: deity,
                        pantheon: this.getDeityPantheon(deity),
                        symbol: this.getDeitySymbol(deity),
                        primaryRelationships: [],
                        secondaryRelationships: []
                    };
                }

                const isPrimary = relationship.primary_deities.includes(deity);
                if (isPrimary) {
                    deityGroups[deity].primaryRelationships.push(relationship);
                } else {
                    deityGroups[deity].secondaryRelationships.push(relationship);
                }
            });
        });

        return Object.values(deityGroups).map(deityGroup => `
            <div class="deity-summary-card">
                <details class="deity-details">
                    <summary class="deity-summary">
                        <div class="deity-header">
                            <i class="${deityGroup.symbol} deity-icon" style="color: ${this.getDeityFirstColor(deityGroup.deity)};"></i>
                            <h4>${deityGroup.deity}</h4>
                            <span class="pantheon-tag">${deityGroup.pantheon}</span>
                        </div>
                    </summary>
                    <div class="deity-details-content">
                        <div class="deity-info-section">
                            <button class="nav-btn deity-info-btn" onclick="app.showDeityDetails('${deityGroup.deity}')">
                                <i class="fas fa-info-circle"></i> View Full Deity Information
                            </button>
                        </div>
                        
                        <div class="deity-relationships-section">
                            ${this.renderDeityCategory('Popular Among Races', deityGroup, 'race')}
                            ${this.renderDeityCategory('Popular in the Lands of', deityGroup, 'continent')}
                            ${this.renderDeityCategory('Known to Aid these Warriors', deityGroup, 'class')}
                        </div>
                    </div>
                </details>
            </div>
        `).join('');
    },

    // Get deity pantheon
    getDeityPantheon(deityName) {
        for (const pantheon of this.pantheonData) {
            const deity = pantheon.deities.find(d => d.name === deityName);
            if (deity) {
                return pantheon.pantheon;
            }
        }
        return 'Unknown Pantheon';
    },

    // Render deity category
    renderDeityCategory(title, deityGroup, type) {
        const allRelationships = [...deityGroup.primaryRelationships, ...deityGroup.secondaryRelationships];
        const categoryRelationships = allRelationships.filter(rel => rel[type]);

        if (categoryRelationships.length === 0) {
            return '';
        }

        // Group by the type (race, continent, or class)
        const grouped = {};
        categoryRelationships.forEach(rel => {
            const key = rel[type];
            if (!grouped[key]) {
                grouped[key] = {
                    name: key,
                    subclass: rel.subclass,
                    relationships: []
                };
            }
            grouped[key].relationships.push(rel);
        });

        return `
            <details class="relationship-category">
                <summary class="category-summary">
                    <strong>${title} (${Object.keys(grouped).length})</strong>
                </summary>
                <div class="relationship-list">
                    ${Object.values(grouped).map(group => `
                        <div class="relationship-item">
                            <div class="relationship-header">
                                <span class="relationship-name">${group.name}</span>
                                ${group.subclass ? `<span class="subclass-tag">${group.subclass}</span>` : ''}
                                <div class="nav-buttons">
                                    <button class="nav-btn" onclick="app.navigateToRelated('${type}', '${group.name}')" title="Go to ${type} details">→ ${type.charAt(0).toUpperCase() + type.slice(1)}</button>
                                </div>
                            </div>
                            <div class="relationship-reasoning">
                                ${group.relationships.map(rel => `
                                    <p><strong>${rel.primary_deities.includes(deityGroup.deity) ? 'Primary' : 'Secondary'}:</strong> ${rel.reasoning}</p>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </details>
        `;
    },

    // Get deity symbol
    getDeitySymbol(deityName) {
        for (const pantheon of this.pantheonData) {
            const deity = pantheon.deities.find(d => d.name === deityName);
            if (deity) {
                return deity.symbol;
            }
        }
        return 'fas fa-question';
    },

    // Get deity symbol with fallback
    getDeitySymbolWithFallback(deityName) {
        const symbol = this.getDeitySymbol(deityName);
        // Add a fallback text in case the icon doesn't load
        return `<i class="${symbol} deity-icon" title="${deityName}"></i><span class="deity-fallback" style="display: none;">${deityName.charAt(0)}</span>`;
    },

    // Map deity color names to CSS colors
    getDeityColorCSS(colorName) {
        const colorMap = {
            // Primary colors
            'Red': '#dc2626',
            'Blue': '#2563eb',
            'Green': '#16a34a',
            'Yellow': '#eab308',
            'Purple': '#9333ea',
            'Orange': '#ea580c',
            'Pink': '#ec4899',
            'Brown': '#8b4513',
            'Black': '#000000',
            'White': '#ffffff',
            'Gray': '#6b7280',
            'Silver': '#9ca3af',
            'Gold': '#fbbf24',

            // Extended colors
            'Crimson': '#dc2626',
            'Crimson red': '#dc2626',
            'Deep blue': '#1e40af',
            'Light blue': '#3b82f6',
            'Steel gray': '#4b5563',
            'Dark': '#1f2937',
            'Light': '#f9fafb',
            'Bright': '#fbbf24',
            'Dark blue': '#1e40af',
            'Dark green': '#166534',
            'Dark red': '#991b1b',
            'Dark purple': '#7c2d12',
            'Dark gray': '#374151',
            'Light gray': '#d1d5db',
            'Bright red': '#ef4444',
            'Bright blue': '#3b82f6',
            'Bright green': '#22c55e',
            'Bright yellow': '#facc15',
            'Bright purple': '#a855f7',
            'Bright orange': '#f97316',
            'Bright pink': '#f472b6',
            'Bright gold': '#fbbf24',
            'Bright silver': '#e5e7eb',
            'Bright white': '#ffffff',
            'Bright black': '#000000',
            'Bright brown': '#cd853f',
            'Bright gray': '#6b7280',
            'Bright crimson': '#dc2626',
            'Bright steel': '#4b5563',
            'Bright dark': '#1f2937',
            'Bright light': '#f9fafb',
            'Bright deep': '#1e40af',
            'Bright light blue': '#3b82f6',
            'Bright steel gray': '#4b5563',
            'Bright dark blue': '#1e40af',
            'Bright dark green': '#166534',
            'Bright dark red': '#991b1b',
            'Bright dark purple': '#7c2d12',
            'Bright dark gray': '#374151',
            'Bright light gray': '#d1d5db'
        };

        return colorMap[colorName] || '#6b7280'; // Default to gray if color not found
    },

    // Get deity's first color for styling
    getDeityFirstColor(deityName) {
        const deity = this.findDeityByName(deityName);
        if (deity && deity.colors && deity.colors.length > 0) {
            return this.getDeityColorCSS(deity.colors[0]);
        }
        return '#6b7280'; // Default gray
    },

    // Get continent's colors for styling
    getContinentColors(continentName) {
        const continent = this.continentData.find(c => c.continent === continentName);
        if (continent && continent.colors && continent.colors.length >= 2) {
            return {
                primary: this.getDeityColorCSS(continent.colors[0]),
                secondary: this.getDeityColorCSS(continent.colors[1])
            };
        }
        return {
            primary: '#6b7280',
            secondary: '#9ca3af'
        };
    },

    // Get continent gradient CSS
    getContinentGradient(continentName) {
        const colors = this.getContinentColors(continentName);
        return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
    },

    // Get most revered deity for a continent
    getMostReveredDeity(continentName) {
        const continent = this.continentData.find(c => c.continent === continentName);
        if (!continent) return null;

        // Check if pantheon data is loaded
        if (!this.pantheonData || this.pantheonData.length === 0) {
            return null;
        }

        // Find deities whose context mentions this continent or whose domains match continent characteristics
        const deityScores = new Map();

        // Use the loaded pantheon data
        const allPantheons = this.pantheonData;

        allPantheons.forEach(pantheon => {
            pantheon.deities?.forEach(deity => {
                let score = 0;

                // Check if deity's context mentions this continent
                if (deity.alabastria_context && deity.alabastria_context.toLowerCase().includes(continentName.toLowerCase())) {
                    score += 5; // Direct mention gets highest score
                }

                // Check if deity's followers match continent characteristics
                if (deity.followers) {
                    deity.followers.forEach(follower => {
                        // Check for general matches based on continent characteristics
                        const followerLower = follower.toLowerCase();
                        const continentDesc = continent.description.toLowerCase();

                        // Match based on continent themes
                        if (continentDesc.includes('magic') && (followerLower.includes('mage') || followerLower.includes('wizard') || followerLower.includes('sorcerer'))) {
                            score += 2;
                        }
                        if (continentDesc.includes('war') && (followerLower.includes('warrior') || followerLower.includes('soldier') || followerLower.includes('fighter'))) {
                            score += 2;
                        }
                        if (continentDesc.includes('nature') && (followerLower.includes('druid') || followerLower.includes('ranger') || followerLower.includes('nature'))) {
                            score += 2;
                        }
                        if ((continentDesc.includes('mining') || continentDesc.includes('volcanic') || continentDesc.includes('forge') || continentDesc.includes('resource')) && (followerLower.includes('dwarf') || followerLower.includes('miner') || followerLower.includes('smith') || followerLower.includes('forge'))) {
                            score += 2;
                        }
                        if (continentDesc.includes('agriculture') && (followerLower.includes('farmer') || followerLower.includes('peasant') || followerLower.includes('commoner'))) {
                            score += 2;
                        }
                        if (continentDesc.includes('ice') && (followerLower.includes('giant') || followerLower.includes('barbarian'))) {
                            score += 2;
                        }
                        if (continentDesc.includes('swamp') && (followerLower.includes('druid') || followerLower.includes('ranger') || followerLower.includes('nature'))) {
                            score += 2;
                        }
                    });
                }

                // Check if deity's domains match continent characteristics
                if (deity.domains) {
                    deity.domains.forEach(domain => {
                        const domainLower = domain.toLowerCase();
                        const continentDesc = continent.description.toLowerCase();

                        if (continentDesc.includes('magic') && (domainLower.includes('magic') || domainLower.includes('arcana'))) {
                            score += 1;
                        }
                        if (continentDesc.includes('war') && domainLower.includes('war')) {
                            score += 1;
                        }
                        if (continentDesc.includes('nature') && (domainLower.includes('nature') || domainLower.includes('life'))) {
                            score += 1;
                        }
                        if ((continentDesc.includes('mining') || continentDesc.includes('volcanic') || continentDesc.includes('forge') || continentDesc.includes('resource')) && (domainLower.includes('forge') || domainLower.includes('craft') || domainLower.includes('war'))) {
                            score += 1;
                        }
                        if (continentDesc.includes('agriculture') && (domainLower.includes('life') || domainLower.includes('nature'))) {
                            score += 1;
                        }
                        if (continentDesc.includes('swamp') && (domainLower.includes('nature') || domainLower.includes('life'))) {
                            score += 1;
                        }
                    });
                }

                if (score > 0) {
                    deityScores.set(deity.name, {
                        deity: deity,
                        pantheon: pantheon.pantheon,
                        score: score
                    });
                }
            });
        });

        // Return the deity with the highest score
        let mostRevered = null;
        let highestScore = 0;

        deityScores.forEach((data, deityName) => {
            if (data.score > highestScore) {
                highestScore = data.score;
                mostRevered = data;
            }
        });

        // If no matches found, return the first deity from the first pantheon as a fallback
        if (!mostRevered && allPantheons.length > 0 && allPantheons[0].deities && allPantheons[0].deities.length > 0) {
            mostRevered = {
                deity: allPantheons[0].deities[0],
                pantheon: allPantheons[0].pantheon,
                score: 0
            };
        }

        return mostRevered;
    },

    // Show deity details
    showDeityDetails(deityName) {
        const deity = this.findDeityByName(deityName);
        if (!deity) {
            return;
        }

        const modal = document.getElementById('deity-modal');
        const modalTitle = document.getElementById('deity-modal-title');
        const modalBody = document.getElementById('deity-modal-body');

        if (!modal) {
            return;
        }

        const deityIcon = this.getDeitySymbol(deity.name);
        const pantheon = this.getDeityPantheon(deity.name);

        modalTitle.innerHTML = `<i class="${deityIcon} deity-modal-icon" style="color: ${this.getDeityFirstColor(deity.name)};"></i> <span>${deity.name} - ${deity.title}</span>`;

        modalBody.innerHTML = `
            <div class="deity-details">
                <div class="deity-info-grid">
                    <div class="deity-info-card">
                        <h4>Pantheon</h4>
                        <p>${pantheon}</p>
                    </div>
                    <div class="deity-info-card">
                        <h4>Alignment</h4>
                        <p>${deity.alignment}</p>
                    </div>
                    <div class="deity-info-card">
                        <h4>Domains</h4>
                        <p>${deity.domains.join(', ')}</p>
                    </div>
                    <div class="deity-info-card">
                        <h4>Followers</h4>
                        <p>${deity.followers.join(', ')}</p>
                    </div>
                    <div class="deity-info-card">
                        <h4>Holy Days</h4>
                        <p>${deity.holy_days.join(', ')}</p>
                    </div>
                    <div class="deity-info-card">
                        <h4>Temples</h4>
                        <p>${deity.temple_type || deity.temples || 'Various locations'}</p>
                    </div>
                </div>
                
                <div class="deity-info-section">
                    <h3>In Alabastria</h3>
                    <p>${deity.alabastria_context}</p>
                </div>
                
                <div class="deity-history-section">
                    <h3>800-Year History in Alabastria</h3>
                    ${Object.entries(deity.history_800_years).map(([period, description]) => `
                        <div class="deity-history-period">
                            <h4>${period.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                            <p>${description}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="deity-allies-conflicts-section">
                    <h3>Divine Relationships</h3>
                    <div class="deity-relationships-grid">
                        <div class="deity-relationship-group">
                            <h4>Allies</h4>
                            <div class="deity-relationship-content">
                                ${deity.allies && deity.allies.length > 0 ?
                deity.allies.map(ally => `
                                        <div class="deity-relationship-item">
                                            <span class="deity-relationship-name">${ally}</span>
                                            <span class="deity-relationship-reasoning">${this.getRelationshipReasoning(deityName, ally, 'ally')}</span>
                                        </div>
                                    `).join('') :
                '<p class="no-relationships">No known allies</p>'
            }
                            </div>
                        </div>
                        <div class="deity-relationship-group">
                            <h4>Conflicts</h4>
                            <div class="deity-relationship-content">
                                ${deity.conflicts && deity.conflicts.length > 0 ?
                deity.conflicts.map(conflict => `
                                        <div class="deity-relationship-item">
                                            <span class="deity-relationship-name">${conflict}</span>
                                            <span class="deity-relationship-reasoning">${this.getRelationshipReasoning(deityName, conflict, 'conflict')}</span>
                                        </div>
                                    `).join('') :
                '<p class="no-relationships">No known conflicts</p>'
            }
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="deity-symbols-colors-section">
                    <h3>Symbols & Colors</h3>
                    <div class="deity-symbols-colors-grid">
                        <div class="deity-symbols-group">
                            <h4>Symbols</h4>
                            <div class="deity-symbols-content">
                                ${deity.symbols && deity.symbols.length > 0 ?
                deity.symbols.map(symbol => `
                                        <div class="deity-symbol-item">
                                            <span class="deity-symbol-name">${symbol}</span>
                                        </div>
                                    `).join('') :
                '<p class="no-symbols">No known symbols</p>'
            }
                            </div>
                        </div>
                        <div class="deity-colors-group">
                            <h4>Colors</h4>
                            <div class="deity-colors-content">
                                ${deity.colors && deity.colors.length > 0 ?
                deity.colors.map(color => `
                                        <div class="deity-color-item">
                                            <div class="color-swatch" style="background-color: ${this.getDeityColorCSS(color)}; width: 20px; height: 20px; border-radius: 50%; display: inline-block; margin-right: 10px; border: 2px solid var(--mountain-brown);"></div>
                                            <span class="deity-color-name">${color}</span>
                                        </div>
                                    `).join('') :
                '<p class="no-colors">No known colors</p>'
            }
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="deity-relationships-section">
                    <h3>Relationships in Alabastria</h3>
                    ${this.renderDeityModalRelationships(deityName)}
                </div>
            </div>
        `;

        // Style the content div to ensure visibility
        const modalContent = modal.querySelector('.deity-modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = 'white';
            modalContent.style.margin = '50px auto';
            modalContent.style.borderRadius = '8px';
            modalContent.style.maxWidth = '500px';
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '10000000';
        }

        // Force the modal to be visible with inline styles
        modal.style.display = 'block !important';
        modal.style.position = 'fixed';
        modal.style.zIndex = '9999999';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

        // Check if modal is actually visible after a short delay
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(modal);
            if (computedStyle.display === 'none' || modal.offsetWidth === 0) {
                this.createSimpleBackupModal(deity, pantheon, this.getDeitySymbol(deity.name));
            }
        }, 100);
    },

    // Render deity modal relationships
    renderDeityModalRelationships(deityName) {
        const relationships = this.deityRelationshipsData.filter(rel =>
            rel.primary_deities.includes(deityName) || rel.secondary_deities.includes(deityName)
        );

        if (relationships.length === 0) {
            return `<p>No specific relationships recorded for this deity in Alabastria.</p>`;
        }

        // Group relationships by type
        const races = [...new Set(relationships.map(rel => rel.race).filter(race => race))];
        const subraces = [...new Set(relationships.map(rel => rel.subrace).filter(subrace => subrace))];
        const classes = [...new Set(relationships.map(rel => rel.class).filter(cls => cls))];
        const subclasses = [...new Set(relationships.map(rel => rel.subclass).filter(subclass => subclass))];
        const continents = [...new Set(relationships.map(rel => rel.continent).filter(continent => continent))];

        return `
            <div class="deity-relationships-grid">
                ${races.length > 0 ? `
                    <details class="relationship-group">
                        <summary class="relationship-summary">
                            <h4>Races (${races.length})</h4>
                        </summary>
                        <div class="relationship-content">
                            ${races.map(race => {
            const raceRels = relationships.filter(rel => rel.race === race);
            const isPrimary = raceRels.some(rel => rel.primary_deities.includes(deityName));
            const reasoning = raceRels.find(rel => rel.reasoning)?.reasoning || 'Cultural and environmental factors influence deity preferences.';
            return `
                                    <div class="relationship-item">
                                        <div class="relationship-header">
                                            <span class="relationship-name ${isPrimary ? 'primary' : 'secondary'}">${race}</span>
                                            <button class="jump-button" onclick="app.navigateToRelated('race', '${race}')" title="View race details">
                                                <i class="fas fa-external-link-alt"></i> View Race
                                            </button>
                                        </div>
                                        <p class="relationship-reasoning">${reasoning}</p>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </details>
                ` : ''}
                
                ${subraces.length > 0 ? `
                    <details class="relationship-group">
                        <summary class="relationship-summary">
                            <h4>Subraces (${subraces.length})</h4>
                        </summary>
                        <div class="relationship-content">
                            ${subraces.map(subrace => {
            const subraceRels = relationships.filter(rel => rel.subrace === subrace);
            const isPrimary = subraceRels.some(rel => rel.primary_deities.includes(deityName));
            const reasoning = subraceRels.find(rel => rel.reasoning)?.reasoning || 'Cultural and environmental factors influence deity preferences.';
            return `
                                    <div class="relationship-item">
                                        <div class="relationship-header">
                                            <span class="relationship-name ${isPrimary ? 'primary' : 'secondary'}">${subrace}</span>
                                            <button class="jump-button" onclick="app.navigateToRelated('race', '${subraceRels[0].race}')" title="View race details">
                                                <i class="fas fa-external-link-alt"></i> View Race
                                            </button>
                                        </div>
                                        <p class="relationship-reasoning">${reasoning}</p>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </details>
                ` : ''}
                
                ${classes.length > 0 ? `
                    <details class="relationship-group">
                        <summary class="relationship-summary">
                            <h4>Classes (${classes.length})</h4>
                        </summary>
                        <div class="relationship-content">
                            ${classes.map(cls => {
            const classRels = relationships.filter(rel => rel.class === cls);
            const isPrimary = classRels.some(rel => rel.primary_deities.includes(deityName));
            const reasoning = classRels.find(rel => rel.reasoning)?.reasoning || 'Class abilities and philosophical alignment influence deity preferences.';
            return `
                                    <div class="relationship-item">
                                        <div class="relationship-header">
                                            <span class="relationship-name ${isPrimary ? 'primary' : 'secondary'}">${cls}</span>
                                            <button class="jump-button" onclick="app.navigateToRelated('class', '${cls}')" title="View class details">
                                                <i class="fas fa-external-link-alt"></i> View Class
                                            </button>
                                        </div>
                                        <p class="relationship-reasoning">${reasoning}</p>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </details>
                ` : ''}
                
                ${subclasses.length > 0 ? `
                    <details class="relationship-group">
                        <summary class="relationship-summary">
                            <h4>Subclasses (${subclasses.length})</h4>
                        </summary>
                        <div class="relationship-content">
                            ${subclasses.map(subclass => {
            const subclassRels = relationships.filter(rel => rel.subclass === subclass);
            const isPrimary = subclassRels.some(rel => rel.primary_deities.includes(deityName));
            const reasoning = subclassRels.find(rel => rel.reasoning)?.reasoning || 'Class abilities and philosophical alignment influence deity preferences.';
            return `
                                    <div class="relationship-item">
                                        <div class="relationship-header">
                                            <span class="relationship-name ${isPrimary ? 'primary' : 'secondary'}">${subclass}</span>
                                            <button class="jump-button" onclick="app.navigateToRelated('class', '${subclassRels[0].class}', '${subclass}')" title="View class details">
                                                <i class="fas fa-external-link-alt"></i> View Class
                                            </button>
                                        </div>
                                        <p class="relationship-reasoning">${reasoning}</p>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </details>
                ` : ''}
                
                ${continents.length > 0 ? `
                    <details class="relationship-group">
                        <summary class="relationship-summary">
                            <h4>Continents (${continents.length})</h4>
                        </summary>
                        <div class="relationship-content">
                            ${continents.map(continent => {
            const continentRels = relationships.filter(rel => rel.continent === continent);
            const isPrimary = continentRels.some(rel => rel.primary_deities.includes(deityName));
            const reasoning = continentRels.find(rel => rel.reasoning)?.reasoning || 'Geographic and cultural factors influence deity preferences.';
            return `
                                    <div class="relationship-item">
                                        <div class="relationship-header">
                                            <span class="relationship-name ${isPrimary ? 'primary' : 'secondary'}">${continent}</span>
                                            <button class="jump-button" onclick="app.navigateToRelated('continent', '${continent}')" title="View continent details">
                                                <i class="fas fa-external-link-alt"></i> View Continent
                                            </button>
                                        </div>
                                        <p class="relationship-reasoning">${reasoning}</p>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </details>
                ` : ''}
            </div>
        `;
    },

    // Close deity modal
    closeDeityModal() {
        const modal = document.getElementById('deity-modal');
        modal.style.display = 'none';
    },

    // Create simple backup modal
    createSimpleBackupModal(deity, pantheon, deityIcon) {
        // Remove any existing backup modal
        const existingBackup = document.getElementById('backup-deity-modal');
        if (existingBackup) {
            existingBackup.remove();
        }

        // Create new backup modal
        const backupModal = document.createElement('div');
        backupModal.id = 'backup-deity-modal';
        backupModal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            z-index: 99999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        `;

        backupModal.innerHTML = `
            <div class="deity-modal-content">
                <div class="deity-modal-header">
                    <h2>
                        <i class="${deityIcon} deity-modal-icon" style="color: ${this.getDeityFirstColor(deity.name)};"></i> <span>${deity.name} - ${deity.title}</span>
                    </h2>
                    <button class="deity-modal-close" onclick="document.getElementById('backup-deity-modal').remove()">&times;</button>
                </div>
                
                <div class="deity-modal-body">
                    <div class="deity-info-grid">
                        <div class="deity-info-card">
                            <h4>Pantheon</h4>
                            <p>${pantheon}</p>
                        </div>
                        <div class="deity-info-card">
                            <h4>Alignment</h4>
                            <p>${deity.alignment}</p>
                        </div>
                        <div class="deity-info-card">
                            <h4>Domains</h4>
                            <p>${deity.domains.join(', ')}</p>
                        </div>
                        <div class="deity-info-card">
                            <h4>Followers</h4>
                            <p>${deity.followers.join(', ')}</p>
                        </div>
                        <div class="deity-info-card">
                            <h4>Holy Days</h4>
                            <p>${deity.holy_days.join(', ')}</p>
                        </div>
                        <div class="deity-info-card">
                            <h4>Temples</h4>
                            <p>${deity.temple_type || deity.temples || 'Various locations'}</p>
                        </div>
                    </div>
                    
                    <div class="deity-history-section">
                        <h3>In Alabastria</h3>
                        <p>${deity.alabastria_context}</p>
                    </div>
                    
                    <div class="deity-history-section">
                        <h3>800-Year History in Alabastria</h3>
                        ${Object.entries(deity.history_800_years).map(([period, description]) => `
                            <div class="deity-history-period">
                                <h4>${period.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                <p>${description}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="deity-allies-conflicts-section">
                        <h3>Divine Relationships</h3>
                        <div class="deity-relationships-grid">
                            <div class="deity-relationship-group">
                                <h4>Allies</h4>
                                <div class="deity-relationship-content">
                                    ${deity.allies && deity.allies.length > 0 ?
                deity.allies.map(ally => `
                                            <div class="deity-relationship-item">
                                                <span class="deity-relationship-name">${ally}</span>
                                                <span class="deity-relationship-reasoning">${this.getRelationshipReasoning(deity.name, ally, 'ally')}</span>
                                            </div>
                                        `).join('') :
                '<p class="no-relationships">No known allies</p>'
            }
                                </div>
                            </div>
                            <div class="deity-relationship-group">
                                <h4>Conflicts</h4>
                                <div class="deity-relationship-content">
                                    ${deity.conflicts && deity.conflicts.length > 0 ?
                deity.conflicts.map(conflict => `
                                            <div class="deity-relationship-item">
                                                <span class="deity-relationship-name">${conflict}</span>
                                                <span class="deity-relationship-reasoning">${this.getRelationshipReasoning(deity.name, conflict, 'conflict')}</span>
                                            </div>
                                        `).join('') :
                '<p class="no-relationships">No known conflicts</p>'
            }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="deity-symbols-colors-section">
                        <h3>Symbols & Colors</h3>
                        <div class="deity-symbols-colors-grid">
                            <div class="deity-symbols-group">
                                <h4>Symbols</h4>
                                <div class="deity-symbols-content">
                                    ${deity.symbols && deity.symbols.length > 0 ?
                deity.symbols.map(symbol => `
                                            <div class="deity-symbol-item">
                                                <span class="deity-symbol-name">${symbol}</span>
                                            </div>
                                        `).join('') :
                '<p class="no-symbols">No known symbols</p>'
            }
                                </div>
                            </div>
                            <div class="deity-colors-group">
                                <h4>Colors</h4>
                                <div class="deity-colors-content">
                                    ${deity.colors && deity.colors.length > 0 ?
                deity.colors.map(color => `
                                            <div class="deity-color-item">
                                                <div class="color-swatch" style="background-color: ${this.getDeityColorCSS(color)}; width: 20px; height: 20px; border-radius: 50%; display: inline-block; margin-right: 10px; border: 2px solid var(--mountain-brown);"></div>
                                                <span class="deity-color-name">${color}</span>
                                            </div>
                                        `).join('') :
                '<p class="no-colors">No known colors</p>'
            }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="deity-relationships-section">
                        <h3>Relationships in Alabastria</h3>
                        ${this.renderDeityModalRelationships(deity.name)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backupModal);
    },



    // Find deity by name
    findDeityByName(deityName) {
        for (const pantheon of this.pantheonData) {
            const deity = pantheon.deities.find(d => d.name === deityName);
            if (deity) {
                return deity;
            }
        }
        return null;
    },

    // Filter deity relationships
    filterDeityRelationships() {
        const alignmentFilterElement = document.getElementById('deity-alignment-filter');
        if (!alignmentFilterElement) {
            return;
        }

        const alignmentFilter = alignmentFilterElement.value;

        if (!this.pantheonData || this.pantheonData.length === 0) {
            return;
        }

        if (!this.deityRelationshipsData || this.deityRelationshipsData.length === 0) {
            return;
        }

        // Always show all relationships - the deity filtering is handled in renderDeityRelationships()
        this.filteredDeityRelationships = [...this.deityRelationshipsData];

        // Update the results
        const resultsContainer = document.getElementById('deity-relationships-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderDeityRelationships();
        }
    },

    // Get deity alignment from pantheon data
    getDeityAlignment(deityName) {
        for (const pantheon of this.pantheonData) {
            const deity = pantheon.deities.find(d => d.name === deityName);
            if (deity) {
                return deity.alignment;
            }
        }
        return null;
    },

    // Make deity names clickable in text
    makeDeityNamesClickable(text) {
        if (!text) return text;

        // List of known deities
        const deities = [
            'Tempus', 'Mystra', 'Lathander', 'Selûne', 'Shar', 'Tymora', 'Bane', 'Cyric', 'Talona',
            'Corellon Larethian', 'Lolth', 'Moradin', 'Garl Glittergold', 'Yondalla', 'Gruumsh',
            'Maglubiyet', 'Kurtulmak', 'Asmodeus', 'Bahamut', 'Tiamat', 'Oghma', 'Kelemvor',
            'The Raven Queen', 'Arvoreen', 'Cyrrollalee', 'Urogalan', 'Baervan Wildwanderer',
            'Baravar Cloakshadow', 'Segojan Earthcaller', 'Khurgorbaeyag', 'Bargrivyek',
            'Nomog-Geaya', 'Gith', 'Vlaakith', 'Sseth', 'Merrshaulk', 'Umberlee', 'Valkur',
            'Deep Sashelas', 'Sekolah', 'Clangeddin Silverbeard', 'Berronar Truesilver',
            'Haela Brightaxe', 'Dugmaren Brightmantle', 'Nebelun'
        ];

        let result = text;
        deities.forEach(deity => {
            const regex = new RegExp(`\\b${deity}\\b`, 'gi');
            result = result.replace(regex, `<button class="deity-button" onclick="app.showDeityDetails('${deity}')" style="
                background: var(--gold-accent);
                color: var(--parchment-dark);
                border: none;
                padding: 0.2rem 0.4rem;
                border-radius: 3px;
                cursor: pointer;
                font-weight: 600;
                margin: 0 0.2rem;
                transition: var(--transition);
                display: inline;
                font-size: inherit;
            " onmouseover="this.style.background='var(--ocean-blue)'" onmouseout="this.style.background='var(--gold-accent)'">${deity}</button>`);
        });

        return result;
    },

    // Get relationship reasoning between deities
    getRelationshipReasoning(deity1, deity2, relationshipType) {
        const relationshipReasons = {
            // Tempus relationships
            'Tempus-Tymora': 'Both deities value courage and taking risks, with Tempus representing honorable battle and Tymora representing the luck that favors the brave.',
            'Tempus-Lathander': 'Both represent renewal and new beginnings - Tempus through the glory of new victories and Lathander through the dawn of each day.',
            'Tempus-Mystra': 'Both value knowledge and strategy, with Tempus focusing on military strategy and Mystra on magical knowledge.',
            'Tempus-Bane': 'Fundamental opposition between honorable warfare (Tempus) and tyrannical conquest (Bane).',
            'Tempus-Cyric': 'Tempus represents honor in battle while Cyric represents madness and chaos.',
            'Tempus-Talona': 'Tempus values life and glory while Talona brings death and disease.',

            // Mystra relationships
            'Mystra-Corellon Larethian': 'Both are patrons of magic and creativity, with Mystra governing the Weave and Corellon representing elven magical arts.',
            'Mystra-Oghma': 'Both value knowledge and learning, with Mystra focusing on magical knowledge and Oghma on all forms of knowledge.',
            'Mystra-Lathander': 'Both represent renewal and growth - Mystra through magical innovation and Lathander through natural renewal.',
            'Mystra-Cyric': 'Cyric seeks to destroy magic and the Weave, directly opposing Mystra\'s domain.',
            'Mystra-Bane': 'Bane seeks to control knowledge and magic for tyranny, opposing Mystra\'s free sharing of magical knowledge.',
            'Mystra-Shar': 'Shar represents the destruction of knowledge and memory, directly opposing Mystra\'s preservation of magical knowledge.',

            // Lathander relationships
            'Lathander-Selûne': 'Both represent light and guidance - Lathander the dawn and Selûne the moonlight that guides travelers.',
            'Lathander-Tymora': 'Both represent hope and new beginnings - Lathander through renewal and Tymora through luck and opportunity.',
            'Lathander-Shar': 'Fundamental opposition between light (Lathander) and darkness (Shar).',
            'Lathander-Cyric': 'Lathander represents hope and renewal while Cyric represents despair and destruction.',
            'Lathander-Bane': 'Lathander represents freedom and hope while Bane represents oppression and tyranny.',

            // Selûne relationships
            'Selûne-Corellon Larethian': 'Both are elven deities who value art, magic, and the guidance of their people.',
            'Selûne-Tymora': 'Both guide travelers and adventurers, with Selûne providing navigation and Tymora providing luck.',
            'Selûne-Shar': 'Sister deities with opposite domains - Selûne represents light and memory while Shar represents darkness and forgetting.',
            'Selûne-Cyric': 'Selûne represents guidance and hope while Cyric represents madness and destruction.',
            'Selûne-Bane': 'Selûne represents freedom and exploration while Bane represents oppression and control.',

            // Shar relationships
            'Shar-Cyric': 'Both represent destruction and chaos, with Shar focusing on secrets and Cyric on madness.',
            'Shar-Bane': 'Both represent tyranny and control, with Shar using secrets and Bane using fear.',
            'Shar-Talona': 'Both represent death and destruction, with Shar focusing on loss and Talona on disease.',
            'Shar-Selûne': 'Sister deities with opposite domains - Shar represents darkness and forgetting while Selûne represents light and memory.',
            'Shar-Lathander': 'Fundamental opposition between darkness (Shar) and light (Lathander).',
            'Shar-Mystra': 'Shar seeks to destroy knowledge and memory while Mystra preserves magical knowledge.',

            // Tymora relationships
            'Tymora-Bane': 'Tymora represents luck and freedom while Bane represents tyranny and oppression.',
            'Tymora-Cyric': 'Tymora represents good fortune while Cyric represents madness and destruction.',
            'Tymora-Talona': 'Tymora represents luck and opportunity while Talona represents misfortune and disease.',

            // Bane relationships
            'Bane-Cyric': 'Both represent evil and destruction, though Bane is lawful and Cyric is chaotic.',
            'Bane-Talona': 'Both represent death and destruction, with Bane focusing on tyranny and Talona on disease.',
            'Bane-Tymora': 'Bane represents oppression and control while Tymora represents freedom and luck.',
            'Bane-Lathander': 'Bane represents tyranny and oppression while Lathander represents freedom and hope.',
            'Bane-Mystra': 'Bane seeks to control knowledge for tyranny while Mystra shares knowledge freely.',

            // Cyric relationships
            'Cyric-Talona': 'Both represent chaos and destruction, with Cyric focusing on madness and Talona on disease.',
            'Cyric-Tymora': 'Cyric represents madness and destruction while Tymora represents luck and hope.',
            'Cyric-Lathander': 'Cyric represents despair and destruction while Lathander represents hope and renewal.',
            'Cyric-Mystra': 'Cyric seeks to destroy magic and knowledge while Mystra preserves them.',

            // Talona relationships
            'Talona-Tymora': 'Talona represents misfortune and disease while Tymora represents luck and good fortune.',
            'Talona-Lathander': 'Talona represents death and disease while Lathander represents life and renewal.',
            'Talona-Mystra': 'Talona represents destruction and decay while Mystra represents creation and knowledge.',

            // Moradin relationships
            'Moradin-Lathander': 'Both represent creation and craftsmanship, with Moradin focusing on metalwork and Lathander on renewal.',
            'Moradin-Mystra': 'Both value knowledge and creation, with Moradin focusing on craftsmanship and Mystra on magical knowledge.',
            'Moradin-Tymora': 'Both value skill and luck, with Moradin focusing on craftsmanship and Tymora on fortune.',
            'Moradin-Bane': 'Moradin represents creation and community while Bane represents destruction and tyranny.',
            'Moradin-Cyric': 'Moradin represents order and craftsmanship while Cyric represents chaos and destruction.',
            'Moradin-Talona': 'Moradin represents life and creation while Talona represents death and disease.',

            // Corellon Larethian relationships
            'Corellon Larethian-Lolth': 'Sister deities with opposite domains - Corellon represents light and art while Lolth represents darkness and destruction.',
            'Corellon Larethian-Lathander': 'Both represent light and creativity, with Corellon focusing on elven arts and Lathander on renewal.',
            'Corellon Larethian-Mystra': 'Both are patrons of magic and creativity, with Corellon representing elven magical arts and Mystra governing the Weave.',
            'Corellon Larethian-Bane': 'Corellon represents freedom and creativity while Bane represents oppression and control.',
            'Corellon Larethian-Cyric': 'Corellon represents order and beauty while Cyric represents chaos and destruction.',

            // Lolth relationships
            'Lolth-Bane': 'Both represent tyranny and control, with Lolth focusing on drow society and Bane on general oppression.',
            'Lolth-Cyric': 'Both represent evil and destruction, with Lolth focusing on drow society and Cyric on general chaos.',
            'Lolth-Shar': 'Both represent darkness and secrets, with Lolth focusing on drow society and Shar on general darkness.',
            'Lolth-Corellon Larethian': 'Sister deities with opposite domains - Lolth represents darkness and destruction while Corellon represents light and art.',
            'Lolth-Lathander': 'Lolth represents darkness and destruction while Lathander represents light and renewal.',
            'Lolth-Mystra': 'Lolth represents destruction and chaos while Mystra represents creation and order.',

            // Asmodeus relationships
            'Asmodeus-Bane': 'Both represent tyranny and control, with Asmodeus focusing on infernal contracts and Bane on general oppression.',
            'Asmodeus-Cyric': 'Both represent evil and destruction, with Asmodeus focusing on lawful evil and Cyric on chaotic evil.',
            'Asmodeus-Shar': 'Both represent darkness and secrets, with Asmodeus focusing on infernal contracts and Shar on general darkness.',
            'Asmodeus-Lathander': 'Asmodeus represents tyranny and oppression while Lathander represents freedom and hope.',
            'Asmodeus-Mystra': 'Asmodeus seeks to control knowledge for tyranny while Mystra shares knowledge freely.',
            'Asmodeus-Tymora': 'Asmodeus represents oppression and control while Tymora represents freedom and luck.',

            // Kelemvor relationships
            'Kelemvor-Lathander': 'Both represent renewal and justice, with Kelemvor focusing on death and Lathander on life.',
            'Kelemvor-Mystra': 'Both value knowledge and order, with Kelemvor focusing on death and Mystra on magic.',
            'Kelemvor-Tymora': 'Both represent fairness and justice, with Kelemvor focusing on death and Tymora on luck.',
            'Kelemvor-Bane': 'Kelemvor represents justice and fairness while Bane represents tyranny and oppression.',
            'Kelemvor-Cyric': 'Kelemvor represents order and justice while Cyric represents chaos and destruction.',
            'Kelemvor-Talona': 'Kelemvor represents natural death while Talona represents unnatural death and disease.',

            // The Raven Queen relationships
            'The Raven Queen-Kelemvor': 'Both represent death and justice, with The Raven Queen focusing on fate and Kelemvor on judgment.',
            'The Raven Queen-Lathander': 'Both represent renewal and hope, with The Raven Queen focusing on death and Lathander on life.',
            'The Raven Queen-Mystra': 'Both value knowledge and memory, with The Raven Queen focusing on death and Mystra on magic.',
            'The Raven Queen-Bane': 'The Raven Queen represents justice and fate while Bane represents tyranny and oppression.',
            'The Raven Queen-Cyric': 'The Raven Queen represents order and fate while Cyric represents chaos and destruction.',
            'The Raven Queen-Talona': 'The Raven Queen represents natural death while Talona represents unnatural death and disease.',

            // Yondalla relationships
            'Yondalla-Lathander': 'Both represent protection and renewal, with Yondalla focusing on family and Lathander on general renewal.',
            'Yondalla-Tymora': 'Both represent luck and protection, with Yondalla focusing on family and Tymora on general fortune.',
            'Yondalla-Mystra': 'Both value knowledge and protection, with Yondalla focusing on family and Mystra on magic.',
            'Yondalla-Bane': 'Yondalla represents protection and community while Bane represents oppression and tyranny.',
            'Yondalla-Cyric': 'Yondalla represents order and community while Cyric represents chaos and destruction.',
            'Yondalla-Talona': 'Yondalla represents life and protection while Talona represents death and disease.',

            // Garl Glittergold relationships
            'Garl Glittergold-Tymora': 'Both represent luck and protection, with Garl focusing on gnome community and Tymora on general fortune.',
            'Garl Glittergold-Lathander': 'Both represent renewal and hope, with Garl focusing on gnome community and Lathander on general renewal.',
            'Garl Glittergold-Mystra': 'Both value knowledge and creativity, with Garl focusing on gnome community and Mystra on magic.',
            'Garl Glittergold-Bane': 'Garl represents freedom and community while Bane represents oppression and tyranny.',
            'Garl Glittergold-Cyric': 'Garl represents order and community while Cyric represents chaos and destruction.',
            'Garl Glittergold-Talona': 'Garl represents life and community while Talona represents death and disease.',

            // Gruumsh relationships
            'Gruumsh-Bane': 'Both represent war and conquest, with Gruumsh focusing on orc society and Bane on general tyranny.',
            'Gruumsh-Cyric': 'Both represent destruction and chaos, with Gruumsh focusing on orc society and Cyric on general madness.',
            'Gruumsh-Talona': 'Both represent death and destruction, with Gruumsh focusing on war and Talona on disease.',
            'Gruumsh-Lathander': 'Gruumsh represents destruction and war while Lathander represents creation and renewal.',
            'Gruumsh-Mystra': 'Gruumsh represents destruction and chaos while Mystra represents creation and order.',
            'Gruumsh-Tymora': 'Gruumsh represents destruction and war while Tymora represents creation and luck.',

            // Maglubiyet relationships
            'Maglubiyet-Bane': 'Both represent war and conquest, with Maglubiyet focusing on goblinoid society and Bane on general tyranny.',
            'Maglubiyet-Cyric': 'Both represent destruction and chaos, with Maglubiyet focusing on goblinoid society and Cyric on general madness.',
            'Maglubiyet-Talona': 'Both represent death and destruction, with Maglubiyet focusing on war and Talona on disease.',
            'Maglubiyet-Lathander': 'Maglubiyet represents destruction and war while Lathander represents creation and renewal.',
            'Maglubiyet-Mystra': 'Maglubiyet represents destruction and chaos while Mystra represents creation and order.',
            'Maglubiyet-Tymora': 'Maglubiyet represents destruction and war while Tymora represents creation and luck.',

            // Kurtulmak relationships
            'Kurtulmak-Maglubiyet': 'Both represent goblinoid society and war, with Kurtulmak focusing on kobolds and Maglubiyet on general goblinoids.',
            'Kurtulmak-Bane': 'Both represent war and conquest, with Kurtulmak focusing on kobold society and Bane on general tyranny.',
            'Kurtulmak-Cyric': 'Both represent destruction and chaos, with Kurtulmak focusing on kobold society and Cyric on general madness.',
            'Kurtulmak-Lathander': 'Kurtulmak represents destruction and war while Lathander represents creation and renewal.',
            'Kurtulmak-Mystra': 'Kurtulmak represents destruction and chaos while Mystra represents creation and order.',
            'Kurtulmak-Tymora': 'Kurtulmak represents destruction and war while Tymora represents creation and luck.',

            // Bahamut relationships
            'Bahamut-Lathander': 'Both represent good and renewal, with Bahamut focusing on dragons and Lathander on general renewal.',
            'Bahamut-Mystra': 'Both value knowledge and order, with Bahamut focusing on dragons and Mystra on magic.',
            'Bahamut-Tymora': 'Both represent good and luck, with Bahamut focusing on dragons and Tymora on general fortune.',
            'Bahamut-Tiamat': 'Sister deities with opposite domains - Bahamut represents good dragons while Tiamat represents evil dragons.',
            'Bahamut-Bane': 'Bahamut represents good and justice while Bane represents evil and tyranny.',
            'Bahamut-Cyric': 'Bahamut represents order and good while Cyric represents chaos and evil.',

            // Tiamat relationships
            'Tiamat-Bane': 'Both represent evil and tyranny, with Tiamat focusing on dragons and Bane on general oppression.',
            'Tiamat-Cyric': 'Both represent evil and destruction, with Tiamat focusing on dragons and Cyric on general madness.',
            'Tiamat-Shar': 'Both represent evil and darkness, with Tiamat focusing on dragons and Shar on general darkness.',
            'Tiamat-Bahamut': 'Sister deities with opposite domains - Tiamat represents evil dragons while Bahamut represents good dragons.',
            'Tiamat-Lathander': 'Tiamat represents evil and destruction while Lathander represents good and renewal.',
            'Tiamat-Mystra': 'Tiamat represents evil and destruction while Mystra represents good and creation.',

            // Oghma relationships
            'Oghma-Mystra': 'Both value knowledge and learning, with Oghma focusing on all knowledge and Mystra on magical knowledge.',
            'Oghma-Lathander': 'Both represent renewal and growth, with Oghma focusing on knowledge and Lathander on natural renewal.',
            'Oghma-Tymora': 'Both value knowledge and luck, with Oghma focusing on learning and Tymora on fortune.',
            'Oghma-Bane': 'Oghma represents free sharing of knowledge while Bane seeks to control knowledge for tyranny.',
            'Oghma-Cyric': 'Oghma represents order and knowledge while Cyric represents chaos and destruction.',
            'Oghma-Shar': 'Oghma represents preservation of knowledge while Shar represents destruction of knowledge.',

            // Umberlee relationships
            'Umberlee-Sekolah': 'Both represent the destructive power of the sea, with Umberlee focusing on storms and Sekolah on predation.',
            'Umberlee-Bane': 'Both represent evil and destruction, with Umberlee focusing on the sea and Bane on general tyranny.',
            'Umberlee-Cyric': 'Both represent chaos and destruction, with Umberlee focusing on the sea and Cyric on general madness.',
            'Umberlee-Valkur': 'Umberlee represents the destructive power of the sea while Valkur represents its protective aspects.',
            'Umberlee-Deep Sashelas': 'Umberlee represents the destructive power of the sea while Deep Sashelas represents its creative aspects.',
            'Umberlee-Lathander': 'Umberlee represents destruction and chaos while Lathander represents creation and order.',

            // Valkur relationships
            'Valkur-Deep Sashelas': 'Both represent the positive aspects of the sea, with Valkur focusing on protection and Deep Sashelas on creativity.',
            'Valkur-Lathander': 'Both represent protection and renewal, with Valkur focusing on the sea and Lathander on general renewal.',
            'Valkur-Tymora': 'Both represent luck and protection, with Valkur focusing on the sea and Tymora on general fortune.',
            'Valkur-Umberlee': 'Valkur represents the protective aspects of the sea while Umberlee represents its destructive aspects.',
            'Valkur-Sekolah': 'Valkur represents protection and safety while Sekolah represents predation and danger.',
            'Valkur-Bane': 'Valkur represents protection and freedom while Bane represents oppression and tyranny.',

            // Deep Sashelas relationships
            'Deep Sashelas-Lathander': 'Both represent creativity and renewal, with Deep Sashelas focusing on the sea and Lathander on general renewal.',
            'Deep Sashelas-Mystra': 'Both value knowledge and creativity, with Deep Sashelas focusing on the sea and Mystra on magic.',
            'Deep Sashelas-Umberlee': 'Deep Sashelas represents the creative aspects of the sea while Umberlee represents its destructive aspects.',
            'Deep Sashelas-Sekolah': 'Deep Sashelas represents creativity and knowledge while Sekolah represents destruction and predation.',
            'Deep Sashelas-Bane': 'Deep Sashelas represents creativity and freedom while Bane represents oppression and tyranny.',
            'Deep Sashelas-Cyric': 'Deep Sashelas represents order and creativity while Cyric represents chaos and destruction.',

            // Sekolah relationships
            'Sekolah-Umberlee': 'Both represent the destructive power of the sea, with Sekolah focusing on predation and Umberlee on storms.',
            'Sekolah-Bane': 'Both represent evil and destruction, with Sekolah focusing on the sea and Bane on general tyranny.',
            'Sekolah-Cyric': 'Both represent chaos and destruction, with Sekolah focusing on the sea and Cyric on general madness.',
            'Sekolah-Valkur': 'Sekolah represents predation and danger while Valkur represents protection and safety.',
            'Sekolah-Deep Sashelas': 'Sekolah represents destruction and predation while Deep Sashelas represents creativity and knowledge.',
            'Sekolah-Lathander': 'Sekolah represents destruction and chaos while Lathander represents creation and order.',

            // Clangeddin Silverbeard relationships
            'Clangeddin Silverbeard-Moradin': 'Both represent dwarven values and warfare, with Clangeddin focusing on battle and Moradin on general dwarven society.',
            'Clangeddin Silverbeard-Lathander': 'Both represent honor and renewal, with Clangeddin focusing on battle and Lathander on general renewal.',
            'Clangeddin Silverbeard-Tymora': 'Both represent courage and luck, with Clangeddin focusing on battle and Tymora on general fortune.',
            'Clangeddin Silverbeard-Bane': 'Clangeddin represents honorable warfare while Bane represents tyrannical conquest.',
            'Clangeddin Silverbeard-Cyric': 'Clangeddin represents order and honor while Cyric represents chaos and destruction.',
            'Clangeddin Silverbeard-Talona': 'Clangeddin represents life and honor while Talona represents death and disease.',

            // Berronar Truesilver relationships
            'Berronar Truesilver-Moradin': 'Both represent dwarven values and protection, with Berronar focusing on family and Moradin on general dwarven society.',
            'Berronar Truesilver-Lathander': 'Both represent protection and renewal, with Berronar focusing on family and Lathander on general renewal.',
            'Berronar Truesilver-Tymora': 'Both represent protection and luck, with Berronar focusing on family and Tymora on general fortune.',
            'Berronar Truesilver-Bane': 'Berronar represents protection and community while Bane represents oppression and tyranny.',
            'Berronar Truesilver-Cyric': 'Berronar represents order and community while Cyric represents chaos and destruction.',
            'Berronar Truesilver-Talona': 'Berronar represents life and protection while Talona represents death and disease.',

            // Haela Brightaxe relationships
            'Haela Brightaxe-Clangeddin Silverbeard': 'Both represent dwarven warfare and honor, with Haela focusing on battle and Clangeddin on general dwarven warfare.',
            'Haela Brightaxe-Lathander': 'Both represent honor and renewal, with Haela focusing on battle and Lathander on general renewal.',
            'Haela Brightaxe-Tymora': 'Both represent courage and luck, with Haela focusing on battle and Tymora on general fortune.',
            'Haela Brightaxe-Bane': 'Haela represents honorable warfare while Bane represents tyrannical conquest.',
            'Haela Brightaxe-Cyric': 'Haela represents order and honor while Cyric represents chaos and destruction.',
            'Haela Brightaxe-Talona': 'Haela represents life and honor while Talona represents death and disease.',

            // Dugmaren Brightmantle relationships
            'Dugmaren Brightmantle-Garl Glittergold': 'Both represent gnome values and innovation, with Dugmaren focusing on discovery and Garl on general gnome society.',
            'Dugmaren Brightmantle-Lathander': 'Both represent innovation and renewal, with Dugmaren focusing on discovery and Lathander on general renewal.',
            'Dugmaren Brightmantle-Mystra': 'Both value knowledge and innovation, with Dugmaren focusing on discovery and Mystra on magic.',
            'Dugmaren Brightmantle-Bane': 'Dugmaren represents innovation and freedom while Bane represents oppression and tyranny.',
            'Dugmaren Brightmantle-Cyric': 'Dugmaren represents order and innovation while Cyric represents chaos and destruction.',
            'Dugmaren Brightmantle-Talona': 'Dugmaren represents life and innovation while Talona represents death and disease.',

            // Nebelun relationships
            'Nebelun-Garl Glittergold': 'Both represent gnome values and wealth, with Nebelun focusing on trade and Garl on general gnome society.',
            'Nebelun-Lathander': 'Both represent wealth and renewal, with Nebelun focusing on trade and Lathander on general renewal.',
            'Nebelun-Tymora': 'Both represent wealth and luck, with Nebelun focusing on trade and Tymora on general fortune.',
            'Nebelun-Bane': 'Nebelun represents wealth and freedom while Bane represents oppression and tyranny.',
            'Nebelun-Cyric': 'Nebelun represents order and wealth while Cyric represents chaos and destruction.',
            'Nebelun-Talona': 'Nebelun represents life and wealth while Talona represents death and disease.'
        };

        const key1 = `${deity1}-${deity2}`;
        const key2 = `${deity2}-${deity1}`;

        if (relationshipReasons[key1]) {
            return relationshipReasons[key1];
        } else if (relationshipReasons[key2]) {
            return relationshipReasons[key2];
        } else {
            // Default reasoning based on relationship type
            if (relationshipType === 'ally') {
                return 'These deities share common values and goals, working together to achieve their mutual objectives.';
            } else if (relationshipType === 'conflict') {
                return 'These deities have opposing values and goals, often working against each other in their divine conflicts.';
            }
            return 'The nature of this relationship is not well documented.';
        }
    },

    // Clear deity filters
    clearDeityFilters() {
        const alignmentFilterElement = document.getElementById('deity-alignment-filter');
        if (!alignmentFilterElement) {
            return;
        }

        alignmentFilterElement.value = '';
        this.filteredDeityRelationships = [...this.deityRelationshipsData];

        const resultsContainer = document.getElementById('deity-relationships-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderDeityRelationships();
        }
    },

    renderContinentDetails(infoContainer) {
        // Find continent data using improved matching logic
        let continent = this.continentData.find(c => c.continent === this.currentSelection);

        // If exact match fails, try partial matching for Kamalatman regions
        if (!continent) {
            if (this.currentSelection === 'Kamalatman') {
                // Default to Kingdom of Kamalatman for general Kamalatman references
                continent = this.continentData.find(c => c.continent === 'Kingdom of Kamalatman');
            } else if (this.currentSelection.includes('Kamalatman')) {
                // Try to find the specific Kamalatman region
                continent = this.continentData.find(c => c.continent.includes(this.currentSelection.split(' ')[0]));
            }
        }

        // Safety check - if still no continent found, show error
        if (!continent) {
            infoContainer.innerHTML = `
                <h3>Continent Not Found</h3>
                <p>Sorry, we couldn't find information for "${this.currentSelection}". Please try selecting a different continent.</p>
            `;
            return;
        }

        infoContainer.innerHTML = `
                <h3>About ${this.currentSelection}</h3>
                <p>${continent.description}</p>
                
                <div class="continent-image-row" style="display: flex; gap: 1rem; align-items: flex-start; margin-top: 1rem; flex-wrap: wrap;">
                <img src="continent_images/${this.currentSelection.split(" ")[0]}.png" 
                     alt="${this.currentSelection}" 
                         style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid var(--mountain-brown);"
                         onerror="this.style.display='none'"
                         id="continent-map"
                         onload="app.adjustFlagHeights()">
                    ${continent.kingdom ? `
                        <img src="flagImages/KamalatmanFlag.png" 
                             alt="Kingdom of Kamalatman Flag" 
                             style="border-radius: 8px; border: 2px solid var(--mountain-brown);"
                             onerror="this.style.display='none'"
                             class="flag-image kingdom-flag">
                    ` : ''}
                    <img src="flagImages/${this.currentSelection.split(" ")[0]}Flag.png" 
                         alt="${this.currentSelection} Flag" 
                         style="border-radius: 8px; border: 2px solid var(--mountain-brown);"
                         onerror="this.style.display='none'"
                         class="flag-image continent-flag">
                    ${continent.capital && continent.capital.ruler ? `
                        <img src="rulerImages/${this.currentSelection.split(" ")[0]}Ruler.png" 
                             alt="${continent.capital.ruler.name}" 
                             style="border-radius: 8px; border: 2px solid var(--mountain-brown);"
                             onerror="this.style.display='none'"
                             class="flag-image ruler-portrait">
                    ` : ''}
                </div>
                
                ${continent.capital && continent.capital.ruler ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Current Ruler
                    </summary>
                    <div class="language-content">
                        <div class="language-category">
                            <strong>Name:</strong> ${continent.capital.ruler.name}
                        </div>
                        <div class="language-category">
                            <strong>Title:</strong> ${continent.capital.ruler.title} (${continent.capital.ruler.race})
                        </div>
                        <div class="language-category">
                            <strong>Personality:</strong> ${continent.capital.ruler.personality}
                        </div>
                        <div class="language-category">
                            <strong>Ruling Style:</strong> ${continent.capital.ruler.ruling_style}
                        </div>
                        <div class="language-category">
                            <strong>Background:</strong> ${continent.capital.ruler.background}
                        </div>
                        <div class="language-category">
                            <strong>Appearance:</strong> ${continent.capital.ruler.appearance}
                        </div>
                        ${continent.capital.ruler.deity ? `
                        <div class="language-category">
                            <strong>Deity:</strong> ${continent.capital.ruler.deity} - ${continent.capital.ruler.deity_reasoning}
                        </div>
                        ` : ''}
                        ${continent.languages ? `
                        <div class="language-category">
                            <strong>Known Languages:</strong><br>
                            <strong>Primary:</strong> ${continent.languages.primary ? continent.languages.primary.join(', ') : 'None'}<br>
                            ${continent.languages.secondary ? `<strong>Secondary:</strong> ${continent.languages.secondary.join(', ')}<br>` : ''}
                            ${continent.languages.rare ? `<strong>Rare:</strong> ${continent.languages.rare.join(', ')}` : ''}
                        </div>
                        ` : ''}
                        ${continent.capital.ruler.subordinate_rulers ? `
                        <div class="language-category">
                            <strong>Subordinate Rulers:</strong><br>
                            ${continent.capital.ruler.subordinate_rulers.map(sub => `
                                <strong>${sub.name}</strong> - ${sub.title} (${sub.race})<br>
                                <span style="font-size: 0.9rem;">${sub.responsibility}</span><br><br>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </details>
                ` : ''}
                
                ${continent.capital ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Capital City
                    </summary>
                    <div class="language-content">
                        <div class="language-category">
                            <strong>City:</strong> ${continent.capital.name}
                        </div>
                        <div class="language-category">
                            <strong>Location:</strong> ${continent.capital.location}
                        </div>
                        <div class="language-category">
                            <strong>Description:</strong> ${continent.capital.description}
                        </div>
                    </div>
                </details>
                ` : ''}
                
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Flag Details
                    </summary>
                    <div class="language-content">
                        ${continent.colors ? `
                            <div class="language-category">
                                <strong>Flag Colors:</strong><br>
                                <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
                                    ${continent.colors.map(color => `
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div class="color-swatch" style="background-color: ${this.getDeityColorCSS(color)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--mountain-brown);"></div>
                                            <span style="font-weight: 600; color: var(--ocean-blue);">${color}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${continent.flag_symbol ? `
                            <div class="language-category">
                                <strong>Flag Symbol:</strong> ${continent.flag_symbol}
                            </div>
                            <div class="language-category">
                                <strong>Symbol Description:</strong> ${continent.flag_description}
                            </div>
                        ` : ''}
                        ${continent.kingdom ? `
                            <div class="language-category">
                                <strong>Kingdom:</strong> ${continent.kingdom}
                            </div>
                            <div class="language-category">
                                <strong>Kingdom Colors:</strong><br>
                                <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                                    ${continent.kingdom_colors.map(color => `
                                        <div style="display: flex; align-items: center; gap: 0.25rem;">
                                            <div class="color-swatch" style="background-color: ${this.getDeityColorCSS(color)}; width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--mountain-brown);"></div>
                                            <span style="font-size: 0.9rem; color: var(--ocean-blue);">${color}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="language-category">
                                <strong>Kingdom Symbol:</strong> ${continent.kingdom_symbol} - ${continent.kingdom_description}
                            </div>
                        ` : ''}
                    </div>
                </details>
                ${(() => {
                const mostRevered = this.getMostReveredDeity(this.currentSelection);
                return mostRevered ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Most Revered Deity
                    </summary>
                    <div class="language-content">
                            <div class="language-category">
                                <strong>Deity:</strong> ${mostRevered.deity.name}
                            </div>
                            <div class="language-category">
                                <strong>Title:</strong> ${mostRevered.deity.title}
                            </div>
                            <div class="language-category">
                                <strong>Pantheon:</strong> ${mostRevered.pantheon}
                            </div>
                            <div class="language-category">
                                <strong>Reason:</strong> Most revered in ${this.currentSelection} due to their followers among the ${continent.languages?.primary?.join(', ') || 'local populations'}.
                            </div>
                            <div class="language-category">
                                <button class="nav-btn" onclick="app.showDeityDetails('${mostRevered.deity.name}')" style="font-size: 0.8rem;">
                                    <i class="fas fa-info-circle"></i> View Deity Details
                                </button>
                            </div>
                    </div>
                </details>
                    ` : '';
            })()}
                ${continent.wars_conflicts ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Wars & Conflicts (${continent.wars_conflicts.current.length + continent.wars_conflicts.historical.length})
                    </summary>
                    <div class="language-content">
                        ${continent.wars_conflicts.current.length > 0 ? `
                            <div class="language-category">
                                <strong>Current Conflicts:</strong><br>
                                ${continent.wars_conflicts.current.map(conflict => `
                                    <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--mountain-brown); border-radius: 4px;">
                                        <strong>${conflict.name}</strong> - <span style="color: var(--ocean-blue);">${conflict.status}</span><br>
                                        ${conflict.description}<br>
                                        <strong>Participants:</strong> ${conflict.participants.join(', ')}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${continent.wars_conflicts.historical.length > 0 ? `
                            <div class="language-category">
                                <strong>Historical Conflicts:</strong><br>
                                ${continent.wars_conflicts.historical.map(conflict => `
                                    <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--mountain-brown); border-radius: 4px; background: rgba(139, 69, 19, 0.1);">
                                        <strong>${conflict.name}</strong> - <span style="color: var(--ocean-blue);">${conflict.outcome}</span><br>
                                        ${conflict.description}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </details>
                ` : ''}
                
                ${continent.politics ? this.renderPoliticalInfo(continent.politics) : ''}
                
                ${continent.trade_routes ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Trade Routes (${continent.trade_routes.length})
                    </summary>
                    <div class="language-content">
                        ${continent.trade_routes.map(route => `
                            <div class="language-category">
                                <strong>${route.name}</strong> - <span style="color: var(--ocean-blue);">${route.type}</span> - <span style="color: var(--ocean-blue);">${route.frequency}</span><br>
                                ${route.description}<br>
                                <strong>Goods:</strong> ${route.goods.join(', ')}
                            </div>
                        `).join('')}
                    </div>
                </details>
                ` : ''}
                
                ${continent.treaties_alliances ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Treaties & Alliances (${continent.treaties_alliances.length})
                    </summary>
                    <div class="language-content">
                        ${continent.treaties_alliances.map(treaty => `
                            <div class="language-category">
                                <strong>${treaty.name}</strong> - <span style="color: var(--ocean-blue);">${treaty.type}</span> - <span style="color: var(--ocean-blue);">${treaty.status}</span><br>
                                ${treaty.description}<br>
                                <strong>Partners:</strong> ${treaty.partners.join(', ')}
                            </div>
                        `).join('')}
                    </div>
                </details>
                ` : ''}
                
                ${continent.creature_types ? `
                <details class="language-info language-details">
                    <summary class="language-summary">
                        Common Creature Types
                    </summary>
                    <div class="language-content">
                        ${continent.creature_types.primary && continent.creature_types.primary.length > 0 ? `
                            <div class="language-category">
                                <strong>Primary Creature Types:</strong><br>
                                ${continent.creature_types.primary.map(creature => `
                                    <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--mountain-brown); border-radius: 4px; background: rgba(139, 69, 19, 0.1);">
                                        <div style="font-weight: bold; color: var(--ocean-blue); font-size: 1.1rem;">${creature.type}</div>
                                        <div style="font-size: 0.9rem; font-style: italic; margin-top: 0.25rem;">${creature.reasoning}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${continent.creature_types.secondary && continent.creature_types.secondary.length > 0 ? `
                            <div class="language-category">
                                <strong>Secondary Creature Types:</strong><br>
                                ${continent.creature_types.secondary.map(creature => `
                                    <div style="margin: 0.5rem 0; padding: 0.5rem; border: 1px solid var(--mountain-brown); border-radius: 4px; background: rgba(139, 69, 19, 0.05);">
                                        <div style="font-weight: bold; color: var(--ocean-blue); font-size: 1.1rem;">${creature.type}</div>
                                        <div style="font-size: 0.9rem; font-style: italic; margin-top: 0.25rem;">${creature.reasoning}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </details>
                ` : ''}
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

        // Add the remaining sections to the sticky-info
        const additionalContent = `
            <details class="language-info language-details">
                <summary class="language-summary">
                    Native Races (${raceRelations.size})
                            </summary>
                <div class="language-content">
                    ${Array.from(raceRelations.entries()).map(([race, relations]) => `
                        <div class="language-category">
                            <strong>${race}</strong><br>
                                    <strong>Native to ${this.currentSelection} because:</strong> ${relations[0].reason}<br><br>
                                    <strong>Class Specializations:</strong><br>
                                    ${relations.map(rel => `
                                <div style="margin: 0.25rem 0; padding: 0.25rem; border-left: 3px solid var(--ocean-blue); padding-left: 0.5rem;">
                                    <strong>${rel.class} (${rel.subclass})</strong>: ${rel.subclassReason}
                                                ${this.createNavButton('class', rel.class, rel.subclass, rel.subclass)}
                                        </div>
                                    `).join('')}
                                </div>
                    `).join('')}
                </div>
            </details>
            
            ${continent.languages ? this.renderLanguageInfo(continent.languages) : ''}
            
            <details class="language-info language-details">
                <summary class="language-summary">
                    Prominent Classes (${classRelations.size})
                            </summary>
                <div class="language-content">
                    ${Array.from(classRelations.entries()).map(([className, subclasses]) => `
                        <div class="language-category">
                            <strong>${className}</strong><br>
                                    ${subclasses.map(sc => `
                                <div style="margin: 0.25rem 0; padding: 0.25rem; border-left: 3px solid var(--ocean-blue); padding-left: 0.5rem;">
                                    <strong>${sc.subclass}:</strong> ${sc.reason}
                                                ${this.createNavButton('class', className, sc.subclass, sc.subclass)}
                                        </div>
                                    `).join('')}
                                </div>
                    `).join('')}
                </div>
            </details>
            
            <details class="language-info language-details">
                <summary class="language-summary">
                    Deities with Continental Temples
                </summary>
                <div class="language-content">
                    ${this.renderContinentDeityRecommendations(this.currentSelection)}
                </div>
            </details>
        `;

        // Append the additional content to the existing sticky-info
        infoContainer.innerHTML += additionalContent;

        // Adjust flag heights after DOM is updated
        setTimeout(() => {
            this.adjustFlagHeights();
        }, 100);
    },

    // Helper function to render continent deity recommendations
    renderContinentDeityRecommendations(continentName) {
        const continentDeities = this.deityRelationshipsData.filter(rel => rel.continent === continentName);

        if (continentDeities.length === 0) {
            return `
                <div class="deity-recommendations">
                    <h4>General Deity Recommendations for ${continentName}</h4>
                    <p>While no specific deity relationships are recorded for this continent, here are some general recommendations based on the region's characteristics:</p>
                    <div class="deity-group">
                        <h5>Universal Deities</h5>
                        <p><strong>Primary:</strong> Tymora (Luck), Lathander (Renewal), Selûne (Guidance)</p>
                        <p><strong>Secondary:</strong> Mystra (Magic), Tempus (War), Kelemvor (Death)</p>
                        <p><em>These deities are commonly worshiped across all regions of Alabastria and can provide guidance for any character.</em></p>
                    </div>
                </div>
            `;
        }

        // Group by deity
        const deityGroups = {};
        continentDeities.forEach(rel => {
            // Add primary deities
            rel.primary_deities.forEach(deity => {
                if (!deityGroups[deity]) {
                    deityGroups[deity] = {
                        deity: deity,
                        pantheon: this.getDeityPantheon(deity),
                        symbol: this.getDeitySymbol(deity),
                        primaryRaces: [],
                        secondaryRaces: [],
                        reasoning: []
                    };
                }
                deityGroups[deity].primaryRaces.push(rel.race);
                if (rel.reasoning && !deityGroups[deity].reasoning.includes(rel.reasoning)) {
                    deityGroups[deity].reasoning.push(rel.reasoning);
                }
            });

            // Add secondary deities
            rel.secondary_deities.forEach(deity => {
                if (!deityGroups[deity]) {
                    deityGroups[deity] = {
                        deity: deity,
                        pantheon: this.getDeityPantheon(deity),
                        symbol: this.getDeitySymbol(deity),
                        primaryRaces: [],
                        secondaryRaces: [],
                        reasoning: []
                    };
                }
                deityGroups[deity].secondaryRaces.push(rel.race);
                if (rel.reasoning && !deityGroups[deity].reasoning.includes(rel.reasoning)) {
                    deityGroups[deity].reasoning.push(rel.reasoning);
                }
            });
        });

        return `
            <div class="deity-recommendations">
                <p style="margin-bottom: 1rem; font-style: italic;">The following deities are worshiped by races inhabiting ${continentName}. Click on any deity to view their full details.</p>
                
                ${Object.values(deityGroups).map(group => `
                    <details class="deity-race-group">
                        <summary class="deity-summary">
                            <div class="deity-header">
                                <i class="${group.symbol}"></i>
                                <strong>${group.deity}</strong>
                                <span class="pantheon-badge">${group.pantheon}</span>
                            </div>
                            <span class="race-count">${[...new Set(group.primaryRaces)].filter(race => race && race.trim() !== '').length} primary, ${[...new Set(group.secondaryRaces)].filter(race => race && race.trim() !== '').length} secondary</span>
                        </summary>
                        <div class="deity-group-content">
                            <div class="primary-races-section">
                                <h4>Primary Worshipers</h4>
                                <div class="race-tags">
                                    ${[...new Set(group.primaryRaces)].filter(race => race && race.trim() !== '').map(race => `
                                        <span class="race-tag primary" onclick="app.navigateToRelated('race', '${race}')" title="Click to view race details">
                                            ${race}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="secondary-races-section">
                                <h4>Secondary Worshipers</h4>
                                <div class="race-tags">
                                    ${[...new Set(group.secondaryRaces)].filter(race => race && race.trim() !== '').map(race => `
                                        <span class="race-tag secondary" onclick="app.navigateToRelated('race', '${race}')" title="Click to view race details">
                                            ${race}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${group.reasoning.length > 0 ? `
                                <div class="reasoning-section">
                                    <h4>Why These Relationships?</h4>
                                    <div class="reasoning-content">
                                        ${group.reasoning.map(reason => `<p>${reason}</p>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="deity-actions">
                                <button class="deity-details-btn" onclick="app.showDeityDetails('${group.deity}')" title="View full deity details">
                                    <i class="fas fa-info-circle"></i> View Deity Details
                                </button>
                            </div>
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    },

    renderRaceDetails(infoContainer) {
        const raceData = this.raceInformationData.find(r => r.race === this.currentSelection);

        if (!raceData) {
            infoContainer.innerHTML = `<p>Race information not found.</p>`;
            return;
        }

        infoContainer.innerHTML = `      
            <h3>About ${this.currentSelection}</h3>
            <p class="race-description">${raceData.description}</p>
            <p class="alabastria-lore"><strong>In Alabastria:</strong> ${raceData.alabastria_lore}</p>
            <p class="playstyle-info"><strong>Playstyle:</strong> ${raceData.playstyle}</p>
            <div class="recommended-classes">
                <strong>Recommended Classes:</strong> ${raceData.recommended_classes.join(', ')}
            </div>
            <hr><br>
        `;

        // Render comprehensive race information
        infoContainer.innerHTML += `
            <h3>${this.currentSelection} Race Information</h3>
            
            <details>
                <summary>Basic Information</summary>
                <div class="details-content-inner">
                    <div class="race-basic-stats">
                        <div class="race-stat">
                            <strong>Size:</strong> ${raceData.size}
                        </div>
                        <div class="race-stat">
                            <strong>Speed:</strong> ${raceData.speed}
                        </div>
                        <div class="race-stat">
                            <strong>Ability Score Increase:</strong> ${Object.entries(raceData.ability_score_increase).map(([ability, value]) => `${ability} +${value}`).join(', ')}
                        </div>
                        <div class="race-stat">
                            <strong>Age:</strong> ${raceData.age}
                        </div>
                        <div class="race-stat">
                            <strong>Alignment:</strong> ${raceData.alignment}
                        </div>
                        <div class="race-stat">
                            <strong>Languages:</strong> ${raceData.languages.join(', ')}
                        </div>
                        ${raceData.height_weight ? `
                            <div class="race-stat">
                                <strong>Height:</strong> ${raceData.height_weight.height_range}
                            </div>
                            <div class="race-stat">
                                <strong>Weight:</strong> ${raceData.height_weight.weight_range}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </details>
            
            <details>
                <summary>Racial Traits</summary>
                <div class="details-content-inner">
                    ${raceData.traits.map(trait => `
                        <div class="trait-item">
                            <h4>${trait.name}</h4>
                            <p>${trait.description}</p>
                        </div>
                    `).join('')}
                </div>
            </details>

            ${raceData.subraces && raceData.subraces.length > 0 ? `
                <details>
                    <summary>Subraces (${raceData.subraces.length})</summary>
                    <div class="details-content-inner">
                        ${raceData.subraces.map(subrace => {
            const subraceId = `subrace-${subrace.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
            return `
                                <details id="${subraceId}">
                                    <summary class="subrace-section">
                                        <h4>${subrace.name}</h4>
                                        <p class="subrace-description">${subrace.description}</p>
                                    </summary>
                                    <div class="details-content-inner">
                                        <div class="subrace-info">
                                            ${subrace.ability_score_increase ? `
                                                <p class="subrace-ability-scores"><strong>Ability Score Increase:</strong> ${Object.entries(subrace.ability_score_increase).map(([ability, value]) => `${ability} +${value}`).join(', ')}</p>
                                            ` : ''}
                                            ${subrace.height_weight ? `
                                                <p class="subrace-height-weight"><strong>Height:</strong> ${subrace.height_weight.height_range}</p>
                                                <p class="subrace-height-weight"><strong>Weight:</strong> ${subrace.height_weight.weight_range}</p>
                                            ` : ''}
                                            <p class="subrace-context"><strong>In Alabastria:</strong> ${subrace.alabastria_context}</p>
                                            <p class="subrace-playstyle"><strong>Playstyle:</strong> ${subrace.playstyle}</p>
                                        </div>
                                        <details>
                                            <summary>Traits</summary>
                                            <div class="details-content-inner">
                                                ${subrace.traits.map(trait => `
                                                    <div class="trait-item">
                                                        <h5>${trait.name}</h5>
                                                        <p>${trait.description}</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </details>
                                        
                                        <details>
                                            <summary>Deity Relationships</summary>
                                            <div class="details-content-inner">
                                                ${this.renderSubraceDeityRecommendations(raceData.race, subrace.name)}
                                            </div>
                                        </details>
                                    </div>
                                </details>
                            `;
        }).join('')}
                    </div>
                </details>
            ` : ''}
            
            ${raceData.names ? `
                <details>
                    <summary>Common Names</summary>
                    <div class="details-content-inner">
                        <div class="names-section">
                            <div class="name-category">
                                <h4>Male Names</h4>
                                <div class="name-list">
                                    ${raceData.names.male_names.map(name => `<span class="name-tag" onclick="app.copyToClipboard('${name}')" title="Click to copy">${name}</span>`).join('')}
                                </div>
                            </div>
                            <div class="name-category">
                                <h4>Female Names</h4>
                                <div class="name-list">
                                    ${raceData.names.female_names.map(name => `<span class="name-tag" onclick="app.copyToClipboard('${name}')" title="Click to copy">${name}</span>`).join('')}
                                </div>
                            </div>
                            <div class="name-category">
                                <h4>Last Names</h4>
                                <div class="name-list">
                                    ${raceData.names.last_names.map(name => `<span class="name-tag" onclick="app.copyToClipboard('${name}')" title="Click to copy">${name}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            ` : ''}
            
            <details>
                <summary>Continental & Class Relationships</summary>
                <div class="details-content-inner">
                    ${this.renderRaceRelationships(raceData.race)}
                </div>
            </details>
            
            <details>
                <summary>Deity Recommendations</summary>
                <div class="details-content-inner">
                    ${this.renderRaceDeityRecommendations(raceData.race, this.currentSubrace)}
                </div>
            </details>
        `;
    },

    // Helper function to render race relationships
    renderRaceRelationships(raceName) {
        const raceRelations = new Map();
        const continentRelations = new Map();

        // Find relationships from the relation data
        this.relationData.forEach(classData => {
            classData.subclasses.forEach(subclass => {
                // Check if this race is suitable for this subclass
                const raceMatch = subclass.races.find(race =>
                    race.name === raceName ||
                    race.name.includes(raceName) ||
                    raceName.includes(race.name)
                );

                if (raceMatch) {
                    if (!raceRelations.has(classData.class)) {
                        raceRelations.set(classData.class, []);
                    }
                    raceRelations.get(classData.class).push({
                        subclass: subclass.subclass,
                        reason: raceMatch.subclass_reason,
                        continent: raceMatch.continent,
                        continentReason: raceMatch.continent_reason
                    });

                    // Track continent relationships
                    if (!continentRelations.has(raceMatch.continent)) {
                        continentRelations.set(raceMatch.continent, []);
                    }
                    continentRelations.get(raceMatch.continent).push({
                        class: classData.class,
                        subclass: subclass.subclass,
                        reason: raceMatch.continent_reason
                    });
                }
            });
        });

        if (raceRelations.size === 0 && continentRelations.size === 0) {
            return '<p>No specific continental or class relationships found for this race.</p>';
        }

        return `
            <div class="race-relationships">
                ${continentRelations.size > 0 ? `
                    <div class="relationship-section">
                        <h4>Prominent Continents (${continentRelations.size})</h4>
                        ${Array.from(continentRelations.entries()).map(([continent, relations]) => `
                            <details>
                                <summary class="relationship-item emphasized">
                                    <div class="relationship-header">
                                        <span class="relationship-name">${continent}</span>
                                        <div class="nav-buttons">
                                            ${this.createNavButton('continent', continent, '→')}
                                            <small>(${relations.length} class specialization${relations.length > 1 ? 's' : ''})</small>
                                        </div>
                                    </div>
                                </summary>
                                <div class="details-content-inner">
                                    <div class="relationship-reason">
                                        <strong>Why prominent:</strong> ${relations[0].reason}<br><br>
                                        <strong>Class Specializations:</strong><br>
                                        ${relations.map(rel => `
                                            <div class="relationship-item emphasized">
                                                <div class="relationship-header">
                                                    <span><strong>${rel.class} (${rel.subclass})</strong></span>
                                                    ${this.createNavButton('class', rel.class, rel.subclass, rel.subclass)}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </details>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${raceRelations.size > 0 ? `
                    <div class="relationship-section">
                        <h4>Suitable Classes (${raceRelations.size})</h4>
                        ${Array.from(raceRelations.entries()).map(([className, subclasses]) => `
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
                                                <div class="relationship-context">
                                                    <strong>Continental context:</strong> ${sc.continentReason} (${sc.continent})
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </details>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Helper function to render race deity recommendations
    renderRaceDeityRecommendations(raceName, subraceName = null) {
        let raceDeities = this.deityRelationshipsData.filter(rel => rel.race === raceName);

        // If a subrace is specified, prioritize subrace-specific relationships
        if (subraceName) {
            const subraceDeities = this.deityRelationshipsData.filter(rel =>
                rel.race === raceName && rel.subrace === subraceName
            );
            if (subraceDeities.length > 0) {
                raceDeities = subraceDeities;
            }
        }

        if (raceDeities.length === 0) {
            const title = subraceName ? `${subraceName} ${raceName}` : raceName;
            return `
                <div class="deity-recommendations">
                    <h4>General Deity Recommendations for ${title}</h4>
                    <p>While no specific deity relationships are recorded for this ${subraceName ? 'subrace' : 'race'}, here are some general recommendations based on common racial characteristics:</p>
                    <div class="deity-group">
                        <h5>Universal Deities</h5>
                        <p><strong>Primary:</strong> Tymora (Luck), Lathander (Renewal), Selûne (Guidance)</p>
                        <p><strong>Secondary:</strong> Mystra (Magic), Tempus (War), Kelemvor (Death)</p>
                        <p><em>These deities are commonly worshiped across all races in Alabastria and can provide guidance for any character.</em></p>
                    </div>
                </div>
            `;
        }

        // Group by continent
        const continentGroups = {};
        raceDeities.forEach(rel => {
            if (!continentGroups[rel.continent]) {
                continentGroups[rel.continent] = {
                    continent: rel.continent,
                    primaryDeities: [],
                    secondaryDeities: []
                };
            }
            continentGroups[rel.continent].primaryDeities.push(...rel.primary_deities);
            continentGroups[rel.continent].secondaryDeities.push(...rel.secondary_deities);
        });

        const title = subraceName ? `${subraceName} ${raceName}` : raceName;
        const isSubraceSpecific = subraceName && raceDeities.some(rel => rel.subrace === subraceName);

        return `
            <div class="deity-recommendations">
                <p style="margin-bottom: 1rem; font-style: italic;">
                    ${isSubraceSpecific ?
                `The following deities are specifically favored by ${subraceName} ${raceName} based on their unique characteristics and cultural values.` :
                `The following deities are commonly favored by ${raceName} based on their continental distribution and cultural values.`
            }
                </p>
                
                ${Object.values(continentGroups).map(group => `
                    <details class="continent-deity-group">
                        <summary class="continent-summary">
                            <strong>${group.continent}</strong>
                            <span class="deity-count">${[...new Set(group.primaryDeities)].length} primary, ${[...new Set(group.secondaryDeities)].length} secondary</span>
                        </summary>
                        <div class="deity-group-content">
                            <div class="primary-deities-section">
                                <h4>Primary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.primaryDeities)].map(deity => `
                                        <span class="deity-tag primary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="secondary-deities-section">
                                <h4>Secondary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.secondaryDeities)].map(deity => `
                                        <span class="deity-tag secondary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="reasoning-section">
                                <h4>Why These Deities?</h4>
                                <p>${raceDeities.find(rel => rel.continent === group.continent && (!subraceName || rel.subrace === subraceName))?.reasoning || 'Cultural and environmental factors influence deity preferences.'}</p>
                            </div>
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    },

    // Helper function to render subrace deity recommendations
    renderSubraceDeityRecommendations(raceName, subraceName) {
        const subraceDeities = this.deityRelationshipsData.filter(rel =>
            rel.race === raceName && rel.subrace === subraceName
        );

        if (subraceDeities.length === 0) {
            return `
                <div class="deity-recommendations">
                    <h4>General Deity Recommendations for ${subraceName}</h4>
                    <p>While no specific deity relationships are recorded for this subrace, here are some general recommendations based on common racial characteristics:</p>
                    <div class="deity-group">
                        <h5>Universal Deities</h5>
                        <p><strong>Primary:</strong> Tymora (Luck), Lathander (Renewal), Selûne (Guidance)</p>
                        <p><strong>Secondary:</strong> Mystra (Magic), Tempus (War), Kelemvor (Death)</p>
                        <p><em>These deities are commonly worshiped across all races in Alabastria and can provide guidance for any character.</em></p>
                    </div>
                </div>
            `;
        }

        // Group by continent
        const continentGroups = {};
        subraceDeities.forEach(rel => {
            if (!continentGroups[rel.continent]) {
                continentGroups[rel.continent] = {
                    continent: rel.continent,
                    primaryDeities: [],
                    secondaryDeities: []
                };
            }
            continentGroups[rel.continent].primaryDeities.push(...rel.primary_deities);
            continentGroups[rel.continent].secondaryDeities.push(...rel.secondary_deities);
        });

        return `
            <div class="deity-recommendations">
                <p style="margin-bottom: 1rem; font-style: italic;">
                    The following deities are specifically favored by ${subraceName} based on their unique characteristics and cultural values.
                </p>
                
                ${Object.values(continentGroups).map(group => `
                    <details class="continent-deity-group">
                        <summary class="continent-summary">
                            <strong>${group.continent}</strong>
                            <span class="deity-count">${[...new Set(group.primaryDeities)].length} primary, ${[...new Set(group.secondaryDeities)].length} secondary</span>
                        </summary>
                        <div class="deity-group-content">
                            <div class="primary-deities-section">
                                <h4>Primary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.primaryDeities)].map(deity => `
                                        <span class="deity-tag primary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="secondary-deities-section">
                                <h4>Secondary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.secondaryDeities)].map(deity => `
                                        <span class="deity-tag secondary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="reasoning-section">
                                <h4>Why These Deities?</h4>
                                <p>${subraceDeities.find(rel => rel.continent === group.continent)?.reasoning || 'Cultural and environmental factors influence deity preferences.'}</p>
                            </div>
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    },

    renderClassDetails(infoContainer) {
        const classData = this.classInformationData.find(c => c.class === this.currentSelection);
        const relationData = this.relationData.find(c => c.class === this.currentSelection);

        if (!classData) {
            infoContainer.innerHTML = `<p>Class information not found.</p>`;
            return;
        }

        infoContainer.innerHTML = `
            <h3>About ${this.currentSelection}</h3>
            <p class="class-description">${classData.description}</p>
            <p class="alabastria-lore"><strong>In Alabastria:</strong> ${classData.alabastria_lore}</p>
            <p class="playstyle-info"><strong>Playstyle:</strong> ${classData.playstyle}</p>
            <hr><br>
        `;

        // Render comprehensive class information
        infoContainer.innerHTML += `
            <h3>${this.currentSelection} Class Information</h3>
            
            <details>
                <summary>Basic Information</summary>
                <div class="details-content-inner">
                    <div class="class-basic-stats">
                        <div class="race-stat">
                            <strong>Role:</strong> ${classData.role}
                        </div>
                        <div class="race-stat">
                            <strong>Primary Ability:</strong> ${classData.primary_ability}
                        </div>
                        <div class="race-stat">
                            <strong>Hit Die:</strong> ${classData.hit_die}
                        </div>
                        <div class="race-stat">
                            <strong>Saving Throws:</strong> ${classData.saving_throws.join(', ')}
                        </div>
                        <div class="race-stat">
                            <strong>Armor:</strong> ${classData.armor_proficiency}
                        </div>
                        <div class="race-stat">
                            <strong>Weapons:</strong> ${classData.weapon_proficiency}
                        </div>
                        <div class="race-stat">
                            <strong>Tools:</strong> ${classData.tool_proficiency}
                        </div>
                    </div>
                </div>
            </details>
            
            <details>
                <summary>Key Features</summary>
                <div class="details-content-inner">
                    ${classData.key_features.map(feature => `
                        <div class="feature-item">
                            <h4>${feature.name} (Level ${feature.level})</h4>
                            <p>${feature.description}</p>
                        </div>
                    `).join('')}
                </div>
            </details>

            ${relationData ? `
                <details>
                    <summary>Subclasses & Race Relationships (${relationData.subclasses.length})</summary>
                    <div class="details-content-inner">
                        ${relationData.subclasses.map(subclass => {
            const subclassId = `relation-subclass-${subclass.subclass.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
            return `
                                        <details id="${subclassId}">
                                            <summary class="subclass-section">
                                                <h4>${subclass.subclass}</h4>
                                            </summary>
                                            <div class="details-content-inner">
                                                <div class="subclass-info">
                                                    <p class="subclass-context"><strong>In Alabastria:</strong> ${subclass.alabastria_context || 'No specific context available.'}</p>
                                                    <p class="subclass-playstyle"><strong>Playstyle:</strong> ${subclass.playstyle || 'No playstyle information available.'}</p>
                                                </div>
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
                                    `;
        }).join('')}
                            </div>
                        </details>
                    </div>
                </details>
            ` : ''}
            
            <details>
                <summary>Deity Recommendations</summary>
                <div class="details-content-inner">
                    ${this.renderClassDeityRecommendations(classData.class)}
                </div>
            </details>
        `;
    },

    // Helper function to render class deity recommendations
    renderClassDeityRecommendations(className) {
        const classDeities = this.deityRelationshipsData.filter(rel => rel.class === className);

        if (classDeities.length === 0) {
            return `
                <div class="deity-recommendations">
                    <h4>General Deity Recommendations for ${className}</h4>
                    <p>While no specific deity relationships are recorded for this class, here are some general recommendations based on common class characteristics:</p>
                    <div class="deity-group">
                        <h5>Universal Deities</h5>
                        <p><strong>Primary:</strong> Tymora (Luck), Lathander (Renewal), Selûne (Guidance)</p>
                        <p><strong>Secondary:</strong> Mystra (Magic), Tempus (War), Kelemvor (Death)</p>
                        <p><em>These deities are commonly worshiped across all classes in Alabastria and can provide guidance for any character.</em></p>
                    </div>
                </div>
            `;
        }

        // Group by subclass
        const subclassGroups = {};
        classDeities.forEach(rel => {
            const key = rel.subclass || 'General';
            if (!subclassGroups[key]) {
                subclassGroups[key] = {
                    subclass: rel.subclass,
                    primaryDeities: [],
                    secondaryDeities: []
                };
            }
            subclassGroups[key].primaryDeities.push(...rel.primary_deities);
            subclassGroups[key].secondaryDeities.push(...rel.secondary_deities);
        });

        return `
            <div class="deity-recommendations">
                <p style="margin-bottom: 1rem; font-style: italic;">The following deities are commonly favored by ${className} based on their class abilities and philosophical alignment.</p>
                
                ${Object.values(subclassGroups).map(group => `
                    <details class="subclass-deity-group">
                        <summary class="subclass-summary">
                            <strong>${group.subclass || 'General'}</strong>
                            <span class="deity-count">${[...new Set(group.primaryDeities)].length} primary, ${[...new Set(group.secondaryDeities)].length} secondary</span>
                        </summary>
                        <div class="deity-group-content">
                            <div class="primary-deities-section">
                                <h4>Primary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.primaryDeities)].map(deity => `
                                        <span class="deity-tag primary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="secondary-deities-section">
                                <h4>Secondary Deities</h4>
                                <div class="deity-tags">
                                    ${[...new Set(group.secondaryDeities)].map(deity => `
                                        <span class="deity-tag secondary" onclick="app.showDeityDetails('${deity}')" title="Click to view deity details">
                                            <i class="${this.getDeitySymbol(deity)}" style="color: ${this.getDeityFirstColor(deity)};"></i> ${deity}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="reasoning-section">
                                <h4>Why These Deities?</h4>
                                <p>${classDeities.find(rel => (rel.subclass || 'General') === (group.subclass || 'General'))?.reasoning || 'Class abilities and philosophical alignment influence deity preferences.'}</p>
                            </div>
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    },

    renderPlaystyleDetails(infoContainer) {
        if (!this.playstyleGuideData) {
            infoContainer.innerHTML = `<p>Playstyle guide not available.</p>`;
            return;
        }

        const guide = this.playstyleGuideData;

        if (this.currentSelection === 'Ability Scores') {
            this.renderAbilityScoreDetails(infoContainer, guide);
        } else if (this.currentSelection === 'Complexity Levels') {
            this.renderComplexityDetails(infoContainer, guide);
        } else {
            // Render specific playstyle category
            const category = guide.playstyle_categories.find(cat => cat.name === this.currentSelection);
            if (!category) {
                infoContainer.innerHTML = `<p>Playstyle category not found.</p>`;
                return;
            }

            infoContainer.innerHTML = `
                <h3>${category.name}</h3>
                <p class="playstyle-description">${category.description}</p>
                <hr><br>
            `;

            infoContainer.innerHTML += `
                <h3>Recommended Classes for ${category.name}</h3>
                <div class="recommended-classes-list">
                    ${category.recommended_classes.map(rec => `
                        <div class="recommended-class-item">
                            <h4>${rec.class} - ${rec.subclass}</h4>
                            <p class="recommendation-reason">${rec.reason}</p>
                            <div class="class-actions">
                                ${this.createNavButton('class', rec.class, 'View Class Details')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    renderAbilityScoreDetails(infoContainer, guide) {
        infoContainer.innerHTML = `
            <h3>Ability Score Priorities</h3>
            <p>Understanding which abilities are most important for each class and what they do</p>
            <hr><br>
        `;

        infoContainer.innerHTML += `
            <h3>Ability Score Guide</h3>
            <div class="ability-scores-grid">
                ${Object.entries(guide.ability_score_priorities).map(([ability, data]) => `
                    <div class="ability-score-card">
                        <h4>${ability}</h4>
                        <p class="ability-description">${data.description}</p>
                        <div class="ability-details">
                            <div class="best-classes">
                                <strong>Best Classes:</strong>
                                <div class="class-tags">
                                    ${data.best_classes.map(cls => `<span class="class-tag">${cls}</span>`).join('')}
                                </div>
                            </div>
                            <div class="important-for">
                                <strong>Important For:</strong>
                                <ul>
                                    ${data.important_for.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderComplexityDetails(infoContainer, guide) {
        infoContainer.innerHTML = `
            <h3>Class Complexity Levels</h3>
            <p>Find classes that match your experience level and preferred complexity</p>
            <hr><br>
        `;

        infoContainer.innerHTML += `
            <h3>Complexity Guide</h3>
            <div class="complexity-levels">
                ${Object.entries(guide.complexity_levels).map(([level, data]) => `
                    <div class="complexity-level-card">
                        <h4>${level}</h4>
                        <p class="complexity-description">${data.description}</p>
                        <div class="complexity-classes">
                            <strong>Classes:</strong>
                            <div class="class-list">
                                ${data.classes.map(cls => `
                                    <div class="class-item">
                                        <span class="class-name">${cls.class}</span>
                                        ${cls.subclass ? `<span class="subclass-name">(${cls.subclass})</span>` : ''}
                                        <div class="class-actions">
                                            ${this.createNavButton('class', cls.class, 'View Class')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};
