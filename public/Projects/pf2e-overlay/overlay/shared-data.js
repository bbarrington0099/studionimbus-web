const SHARED_DATA = {
    defaultAvatar : "../images/the-party.png",
    
    gmData : {
        id: "gm",
        userId: "670656351701303296",
        name: "GM",
        avatar: "../images/avatars/gm.png",
        cssClass: "gm",
        chibiImg: "../images/chibi/gm.png",
        combatImg: "../images/chibi/flips/gm_evil.png",
        alternates: [
            {id: "fed-up", name: "Fed Up", img: "../images/chibi/flips/gm_fed_up.png"}
        ],
        alternateSet: 'default',
    },

    playersData : [
        {
            id: "uri",
            userId: "798680850958647307",
            name: "Uri",
            bloodline: "Yaksha Human",
            classSkill: "Champion",
            avatar: "../images/avatars/uri.png",
            cssClass: "uri",
            chibiImg: "../images/chibi/pcs/uri.png",
            combatImg: "../images/chibi/pcs/combat/uri-mace.png",
            downedImg: "../images/chibi/pcs/downed/uri.png",
            alternates: [
                {id: "healing-hands", name: "Healing Hands", img: "../images/chibi/flips/uri_healing_hands.png"}
            ],
            aliases: ["u"]
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
            combatImg: "../images/chibi/pcs/combat/oryn-bow.png",
            downedImg: "../images/chibi/pcs/downed/oryn.png",
            companionImg: "../images/chibi/companions/jack.png",
            alternates: [
                {id: "tracking", name: "Tracking", img: "../images/chibi/flips/oryn_tracking.png"},
                {id: "training", name: "Training", img: "../images/chibi/flips/oryn_training.png"},
            ],
            aliases: ["o"]
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
            combatImg: "../images/chibi/pcs/combat/ikyki-vial.png",
            downedImg: "../images/chibi/pcs/downed/ikyki.png",
            alternates: [
                {id: "mixing", name: "Mixing", img: "../images/chibi/flips/ikyki_mixing.png"}
            ],
            aliases: ["i"]
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
            combatImg: "../images/chibi/pcs/combat/azzahd-sling.png",
            downedImg: "../images/chibi/pcs/downed/azzahd.png",
            companionImg: "../images/chibi/companions/elowen.png",
            companionFlipImg: "../images/chibi/flips/elowen_rage.png",
            alternates: [
                {id: "reasoning", name: "Reasoning", img: "../images/chibi/flips/azzahd_reasoning.png"}
            ],
            aliases: ["a"]
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
            combatImg: "../images/chibi/pcs/combat/rapha-shortsword.png",
            downedImg: "../images/chibi/pcs/downed/rapha.png",
            alternates: [
                {id: "bush", name: "Bush", img: "../images/chibi/flips/rapha_bush.png"}
            ],
            aliases: ["r"]
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
            combatImg: "../images/chibi/pcs/combat/gordak-sword.png",
            downedImg: "../images/chibi/pcs/downed/gordak.png",
            alternates: [
                {id: "rage", name: "Rage", img: "../images/chibi/flips/gordak_rage.png"},
                {id: "wrestle", name: "Wrestle", img: "../images/chibi/flips/gordak_wrestle.png"},
            ],
            alternateSet: "default",
            aliases: ["g"]
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
            combatImg: "../images/chibi/pcs/combat/pravish-polearm.png",
            downedImg: "../images/chibi/pcs/downed/pravish.png",
            companionImg: "../images/chibi/companions/construct.png",
            alternates: [
                {id: "unleashed", name: "Unleased", img: "../images/chibi/flips/pravish_unleashed.png"},
                {id: "tinkering", name: "Tinkering", img: "../images/chibi/flips/pravish_tinkering.png"},
            ],
            alternateSet: "default",
            aliases: ["p"]
        }
    ],

    // NPC definitions
    npcs : [
        { id: "mira", name: "Mira", categories: ["party"], image: "../images/chibi/npcs/mira.png", aliases: ["m"] },
        { id: "elowen", name: "Elowen", categories: ["party"], image: "../images/chibi/companions/elowen.png", aliases: ["e"] },
        { id: "sortin", name: "Sortin", categories: ["act1ally"], image: "../images/chibi/npcs/sortin.png", aliases: ["s"] },
        { id: "voidsever-group", name: "Voidsever Group", categories: ["act1enemy"], image: "../images/chibi/enemies/voidsever_group.png", aliases: ["vsg"] },
        { id: "wolves", name: "Wolves", categories: ["act1enemy"], image: "../images/chibi/enemies/wolves.png" },
        { id: "basilisk", name: "Basilisk", categories: ["act1enemy"], image: "../images/chibi/enemies/basilisk.png" },
        { id: "boars", name: "Boars", categories: ["act1enemy"], image: "../images/chibi/enemies/boars.png" },
        { id: "goblin-get", name: "Goblin Get Gang", categories: ["act1enemy"], image: "../images/chibi/enemies/goblin_get_gang.png" },
        { id: "tarantula-swarm", name: "Tarantula Swarm", categories: ["act1enemy"], image: "../images/chibi/enemies/tarantual_swarm.png" },
        { id: "dweomercat", name: "Dweomercat", categories: ["act1enemy"], image: "../images/chibi/enemies/dweomercat.png" },
        { id: "blodeuwedd", name: "Blodeuwedd", categories: ["act1enemy"], image: "../images/chibi/enemies/blodeuwedd.png" },
        { id: "enemy", name: "Enemy", categories: ["generic"], image: "../images/chibi/enemies/enemy.png", aliases: ["nme"] },
    ],

    // Effect definitions (under, main, left, right) group: same time
    effects : [
        { id: "critf", image: "../images/chibi/effects/critical-fail.png", slot: "under", duration: 3 },
        { id: "crits", image: "../images/chibi/effects/critical-success.png", slot: "under", duration: 3 },
        { id: "downed", image: "../images/chibi/effects/downed.png", slot: "under", duration: 3 },
        { id: "kill", image: "../images/chibi/effects/kill.png", slot: "under", duration: 3 },
        { id: "combat-start", image: "../images/chibi/effects/combat-start.png", slot: "under", duration: 3 },
        { id: "combat-end", image: "../images/chibi/effects/combat-end.png", slot: "under", duration: 3 },
        { id: "ac-aggressive", image: "../images/chibi/effects/aggressive.png", group: "aggressive-chemistry", slot: "left", duration: 3},
        { id: "ac-chemistry", image: "../images/chibi/effects/chemistry.png", group: "aggressive-chemistry", slot: "right", duration: 3},
        { id: "ac-boom", image: "../images/chibi/effects/boom.png", group: "aggressive-chemistry", slot: "main", duration: 3},
        { id: "agg-chem", image: "../images/chibi/effects/aggressive-chemistry.png", slot: "main", duration: 5},
    ],

    // Backgrouds
    backgrounds : [
        { id: "default", category: "default", name: "Default", image: "../images/poor.png" },
        { id: "setup-camp", category: "roadToDuskHarbor", name: "Evening Camp", image: "../images/chibi/backgrounds/setup-campsite.png" },
        { id: "sleep-camp", category: "roadToDuskHarbor", name: "Night Camp", image: "../images/chibi/backgrounds/sleep-camp.png" },
        { id: "wakeup-camp", category: "roadToDuskHarbor", name: "Morning Camp", image: "../images/chibi/backgrounds/wakeup-camp.png" },
        { id: "forest-road", category: "roadToDuskHarbor", name: "Forest Road", image: "../images/chibi/backgrounds/forest-road.png" },
        { id: "forest-road-lunch", category: "roadToDuskHarbor", name: "Forest Road Lunch", image: "../images/chibi/backgrounds/forest-road-lunch.png" },
    ],

    // Animations
    animations : [
        "shake",
        "bounce",
        "spin",
        "glow",
        "jump",
        "speak",
        "attack-left",
        "attack-right"
    ]
}

if (typeof window !== 'undefined') {
  window.SHARED_DATA = SHARED_DATA;
}