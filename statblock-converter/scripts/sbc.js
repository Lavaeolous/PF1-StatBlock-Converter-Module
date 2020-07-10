/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: Lavaeolou
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */

// Import TypeScript modules
import templateData from "./templateData.js"
import templateActor from "./templateActor.js"
import templateClassData from "./templateClassData.js"
import templateClassItem from "./templateClassItem.js"
import templateRaceItem from "./templateRaceItem.js"
import templateRacialHDItem from "./templateRacialHDItem.js"
import templateConversionItem from "./templateConversionItem.js"
import templateFeatItem from "./templateFeatItem.js"
import templateMeleeAttackItem from "./templateMeleeAttackItem.js"
import templateNaturalAttackItem from "./templateNaturalAttackItem.js"
import templateSpecialAbilityItem from "./templateSpecialAbilityItem.js"
import templateSkills from "./templateSkills.js"
import enumRaces from "./enumRaces.js"
import enumTypes from "./enumTypes.js"
import enumSubtypes from "./enumSubtypes.js"
import enumClasses from "./enumClasses.js"
import enumClassData from "./enumClassData.js"
import enumBonusTypes from "./enumBonusTypes.js"
import enumConditions from "./enumConditions.js"
import enumDamageTypes from "./enumDamageTypes.js"
import enumAttackDamageTypes from "./enumAttackDamageTypes.js"
import enumSkills from "./enumSkills.js"
import enumLanguages from "./enumLanguages.js"

/* ------------------------------------ */
/* Global Variables 					*/
/* ------------------------------------ */

var dataInput;
var dataInputHasClasses = false;
var inputHDTotal = 0;
var inputClassHDTotal = 0;
var dataInputHasNonPlayableRace = false;
var dataInputHasPlayableRace = false;
var dataInputHasRacialHD = true;
var dataInputHasTactics = false;
var dataInputHasSpecialAbilities = false;
var dataInputHasSpecialQualities = false;
var dataInputHasEcology = false;
var dataInputHasDescription = false;
var dataOutput;
var dataTemplate;
var formattedInput;


var enumAttributes = [
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
];

var enumSizes = [
    "Fine",
    "Diminutive",
    "Tiny",
    "Small",
    "Medium",
    "Large",
    "Huge",
    "Gargantuan",
    "Colossal"
];

var enumGender = [
    "Male or Female",
    "Female or Male",
    "Male",
    "Female"
];

var carrySizeModificators = {
    "Fine": 1/8,
    "Diminutive": 1/4,
    "Tiny": 1/2,
    "Small": 3/4,
    "Medium": 1,
    "Large": 2,
    "Huge": 4,
    "Gargantuan": 8,
    "Colossal": 16
};

var enumSizeModifiers = {
    "Fine": 8,
    "Diminutive": 4,
    "Tiny": 2,
    "Small": 1,
    "Medium": 0,
    "Large": -1,
    "Huge": -2,
    "Gargantuan": -4,
    "Colossal": -8
};

var enumTokenSize = {
    "Fine": { w: 1, h: 1, scale: 0.2 },
    "Diminutive": { w: 1, h: 1, scale: 0.4 },
    "Tiny": { w: 1, h: 1, scale: 0.6 },
    "Small": { w: 1, h: 1, scale: 0.8 },
    "Medium": { w: 1, h: 1, scale: 1 },
    "Large": { w: 2, h: 2, scale: 1 },
    "Huge": { w: 3, h: 3, scale: 1 },
    "Gargantuan": { w: 4, h: 4, scale: 1 },
    "Colossal": { w: 6, h: 6, scale: 1 },
    };

var enumSaves = [
    "fort",
    "ref",
    "will"
];

var enumSaveModifier = [
    "con",
    "dex",
    "wis"
];

var enumKnowledgeSubskills = [
    "arcana",
    "dungeoneering",
    "engineering",
    "geography",
    "history",
    "local",
    "nature",
    "nobility",
    "planes",
    "religion"
];

var enumAbilityTypes = {
    "ex": "Extraordinary",
    "su": "Supernatural",
    "sp": "Special"
};

var enumSpecialAttacks = [
    "rend",
    "rake",
    "trample",
    "pounce",
    "swallow whole",
    "constrict",
    "powerful charge"
];

var enumClassFeatures = [
    "arcane bond",
    "bloodline",
    "sneak attack",
    "trapfinding",
    "evasion",
    "rogue talents",
    "rogue talent",
    "trap sense",
    "favored enemy",
    "track",
    "wild empathy",
    "endurance",
    "smite evil",
    "divine grace",
    "lay on hands",
    "divine bond",
    "mercy",
    "favored terrain",
    "hunter's bond",
    "quarry",
    "flurry of blows",
    "stunning fist",
    "ki",
    "bravery",
    "weapon training",
    "armor training",
    "wild shape",
    "bardic performance",
    "bardic knowledge",
    "inspire courage",
    "inspire competence",
    "lore master",
    "versatile performance",
    "countersong",
    "distraction",
    "fascinate",
    "dirge of doom",
    "inspire heroics",
    "rage power",
    "rage",
    "damage reduction",
    "dual identity",
    "vigilante talent",
    "social talent",
    "hex",
    "eidolon",
    "defensive instinct",
    "shifter",
    "chimeric",
    "mystery",
    "relevation",
    "divine might",
    "commune",
    "arcane pool",
    "spellstrike",
    "magus arcana",
    "spell combat",
    "knowledge pool",
    "domain",
    "judgement",
    "solo tactics",
    "bane",
    "exploit weakness",
    "panache",
    "grit",
    "nimble",
    "gun training",
    "deeds",
    "phrenic",
    "channel",
    "challenge",
    "bomb",
    "poison resistance",
    "discovery",
    "mutagen",
    "fervor",
    "blessings",
    "sacred weapon",
    "charmed life",
    "swashbuckler weapon training",
    "studied target",
    "slayer talent",
    "inspired rage",
    "raging song",
    "spell kenning",
    "alchemy",
    "investigator talent",
    "studied strike",
    "animal companion",
    "animal focus",
    "brawler's flurry",
    "maneuver training",
    "martial flexibility",
    "knockout",
    "brawler's strike",
    "arcane reservoir",
    "arcanist exploit",
    "ninja trick",
    "uncanny dodge",
    "no trace",
    "smite good",
    "calm spirit",
    "phantom recall",
    "bonded manifestation",
    "discipline",
    "psychic",
    "focus power",
    "implements",
    "shift focus",
    "outside contact",
    "mesmerist",
    "touch treatment",
    "manifold tricks",
    "spirit bonus",
    "spirit power",
    "spirit surge",
    "burn",
    "elemental overflow",
    "infusion",
    "internal buffer",
    "utility wild talent",
    "metakinesis",
    "metakinetic"
];

var enumSpellGroups = [
    "Spell-Like Abilities",
    "Spells Prepared",
    "Spells Known"
];

var enumSpellcastingClasses = [
    "adept",
    "alchemist",
    "antipaladin",
    "arcanist",
    "bard",
    "bloodrager",
    "cleric",
    "druid",
    "hunter",
    "inquisitor",
    "investigator",
    "magus",
    "medium",
    "mesmerist",
    "occultist",
    "oracle",
    "paladin",
    "psychic",
    "ranger",
    "red mantis assassin",
    "sahir-afiyun",
    "shaman",
    "skald",
    "sorcerer",
    "spiritualist",
    "summoner",
    "warpriest",
    "witch",
    "wizard"
]

// Get HTML Elements
var inputTextArea = document.getElementById("input");
// Make function visible outside the esmodule
window.convertStatBlock = convertStatBlock;
window.auto_csv_flag = false;

/* ------------------------------------ */
/* Debug    							*/
/* ------------------------------------ */

const DEBUG = true;

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() { 
	console.log('sbc-pf1 | Initializing Statblock Converter Module');

	// Assign custom classes and constants here
    
	
	// Register custom module settings
	hookRenderSBCButton();
	
	// Preload Handlebars templates

    
	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
    // ready
    
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
  // Do anything once the module is ready
  //hookRenderSBCButton();
});

// Add any additional hooks if necessary
function hookRenderSBCButton() {
        
    // Appends a button onto the actor directory to open the modal dialog.
    Hooks.on("renderActorDirectory", (app, html, data) => {
        console.log('sbc-pf1 | StatBlock Converter PF1 Ready');
        const importButton = $('<button class="create-entity sbcButton"><i class="fas fa-file-import"></i></i>Import StatBlock</button>');
        html.find(".directory-footer").append(importButton);
        importButton.click((ev) => {
            statBlockConverterModalDialog.openModalDialog();
        });
    });
}

/* ------------------------------------ */
/* Modal Dialog							*/
/* ------------------------------------ */

class statBlockConverterModalDialog {
    constructor() {}
    
    static openModalDialog() {
                
        const options = {
            width: 650,
            height: 550,
            id: "sbcModal"
        };
        
        const content = '<p>Enter the StatBlock you want to convert to an actor</p><p style="font-size: 8pt;">Disclaimer: This Converter is a Work-in-Progress thats not feature-complete (e.g. spells are not converted yet). It is advised to update regularily.</p><textarea class="statBlockInput" id="input" form="statBlockInputForm" placeholder="Copy &amp; Paste StatBlock here"></textarea>';
        
        let d = new Dialog({
            title: "PF1 StatBlock Converter",
            content: content,
            buttons: {
                import: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Import",
                    callback: () => convertStatBlock(input)
                }
            },
            default: "import",
            
            close: () => console.log("sbc-pf1 | Dialog closed")
        }, options);
        d.render(true);
    }
}

/* ------------------------------------ */
/* Reset SBC-Templates and Variables   	*/
/* ------------------------------------ */

async function resetSBC() {
    
    if(DEBUG==true) { console.log("sbc-pf1 | resetSBC()") };
    
    delete window.dataInput;
    delete window.dataOutput;
    delete window.dataTemplate;
    delete window.formattedInput;
    
}

/* ------------------------------------ */
/* Initialize SBC-Templates and Variables   	*/
/* ------------------------------------ */

async function initializeSBC() {
    
    if(DEBUG==true) { console.log("sbc-pf1 | initializeSBC()") };
    
    dataInput = "";
    dataInputHasClasses = false;
    inputHDTotal = 0;
    inputClassHDTotal = 0;
    dataInputHasNonPlayableRace = false;
    dataInputHasPlayableRace = false;
    dataInputHasRacialHD = true;
    dataInputHasTactics = false;
    dataInputHasSpecialAbilities = false;
    dataInputHasEcology = false;
    
    dataTemplate = await JSON.parse(JSON.stringify(templateActor));
    formattedInput = await JSON.parse( await JSON.stringify(templateData));
    dataOutput = await JSON.parse(JSON.stringify(dataTemplate));
    
}

/* ------------------------------------ */
/* sbc-pf1 | StatBlock Converter    	*/
/* ------------------------------------ */

async function convertStatBlock(input) {
    
    // Reset everything when opening the modal dialog
    await resetSBC();
    await initializeSBC();
        
    // Initial Clean-up of input
    dataInput = input.value.replace(/^\s*[\r\n]/gm,"")
    // Replace different dash-glyphs with the minus-glyph
    dataInput = dataInput.replace(/–|—/gm,"-");
    // Remove weird multiplication signs
    dataInput = dataInput.replace(/×/, "x");
        
    /*
     * SPLIT INPUT INTO MANAGEABLE CHUNKS OF DATA
     * 
     * stringGeneralData: Name, CR, XP, Alignment, Type, Subtype, Init, Senses, Aura
     * stringDefenseData: AC, Touch, Flat-Footed, AC-Bonus-Types, HP, Hit Dice, Saves, Immunities, Resistances, Weaknesses, SR
     */
    
    let splitInput = "";
    let stringGeneralData = "";
    let stringDefenseData = "";
    let stringOffenseData = "";
    let stringTacticsData = "";
    let stringStatisticsData = "";
    let stringSpecialAbilitiesData = "";
    let stringGearData = "";
    let stringEcologyData = "";
    let stringDescriptionData = "";
    
    // Set some flags for (optional) data blocks found in the input
    // mandatory
    let foundDefenseData = false;
    let foundOffenseData = false;
    let foundStatisticsData = false;
    // optional
    let foundTacticsData = false;
    let foundSpecialAbilitiesData = false;
    let foundEcologyData = false;
    let foundDescriptionData = false;
    
    // Check if enough Data to start conversion is available
    if(dataInput.search(/(\n\bAC\b(?:[\s\S]*)\nhp)/gmi) !== -1) { foundDefenseData = true; }
    if(dataInput.search(/(^\bSpeed\b)|(^\bSpd\b)/mi) !== -1) { foundOffenseData = true; }
    if(dataInput.search(/(\n\bSTR\b)/gmi) !== -1) { foundStatisticsData = true; }
    // Check for optional Datablocks marked by keywords for now
    if(dataInput.search(/\nTACTICS\n/gmi) !== -1) { foundTacticsData = true; dataInputHasTactics = true; }
    if(dataInput.search(/\n\bSPECIAL ABILITIES\b\n/gmi) !== -1) { foundSpecialAbilitiesData = true; dataInputHasSpecialAbilities = true; }
    if(dataInput.search(/\nECOLOGY\n/gmi) !== -1) { foundEcologyData = true; dataInputHasEcology = true; }
    
    // 
    if( (foundDefenseData == false) || (foundOffenseData == false) || (foundStatisticsData == false) ) {
        ui.notifications.info("Something went wrong! Please check the console (F12)");
        console.log("Defense Data found: " + foundDefenseData);
        console.log("Offense Data found: " + foundOffenseData);
        console.log("Statistics Data found: " + foundStatisticsData);
        console.log("Check the Input for any datablock that returns false, e.g. if offense data returns false, the error will probably be somewhere between the land speed and any special attacks the input has.");
        return;
    }
    
    let tempInputRest = "";

    // Split stringGeneralData, e.g. everything between the Start of the Input and "AC", removing "DEFENSE"
    splitInput = dataInput.split(/(?=(^AC))/m);
    tempInputRest = splitInput[2];
    stringGeneralData = splitInput[0].replace(/(DEFENSE)/gm,"");
    splitInput = "";
            
    // Split stringDefenseData, everything between AC and Speed
    splitInput = tempInputRest.split(/(?=(^Spd|^Speed))/mi);
    tempInputRest = splitInput[2].replace(/(\bSpd\b)/i,"Speed");
    stringDefenseData = splitInput[0].replace(/(OFFENSE)/,"");
    splitInput = "";
                
    // Split stringOffenseData, everything between Speed and Tactics or Statistics
    // If there is a tactics block, split there, parse Offense and tactics next
    if(foundOffenseData && foundTacticsData == true)  {
        splitInput = tempInputRest.split(/\nTACTICS\n/gmi);
        tempInputRest = splitInput[1];
        stringOffenseData = splitInput[0].replace(/\nTACTICS\n/gmi,"");
        splitInput = "";
    }  
    // If there is no tactics block, split and parse Offense and Statistics next 
    else if (foundOffenseData == true) {
        splitInput = tempInputRest.split(/\nStr/i);
        tempInputRest = "Str".concat(splitInput[1]);
        stringOffenseData = splitInput[0].replace(/(OFFENSE)/gmi,"").replace(/(STATISTICS)/gmi,"");
        splitInput = "";
    }
    
    // Split Tactics Data if available (mainly NPCs)
    if(foundTacticsData == true) {
        splitInput = tempInputRest.split(/\nStr/i);
        tempInputRest = "Str" + splitInput[1];
        stringTacticsData = splitInput[0].replace(/(STATISTICS)/gmi,"");
        splitInput = "";
    }
    
    // Split Statistics
    if(foundStatisticsData == true) {
        // Check if there are Special Abilities or Ecology Data following the Statistics
        let splitInput = "";
        let tempSplit = "";
        
        if(foundSpecialAbilitiesData == true) {
            tempSplit = tempInputRest.split(/\bSPECIAL ABILITIES\b/gmi)
            splitInput = tempSplit[0];
            tempInputRest = tempSplit[1];
        } else if (foundEcologyData == true) {
            tempSplit = tempInputRest.split(/ECOLOGY/gmi)
            splitInput = tempSplit[0];
            tempInputRest = tempSplit[1];
        } else {
            splitInput = tempInputRest;
        }
        
        stringStatisticsData = splitInput;
        
    }
    
    if(foundSpecialAbilitiesData == true) {
        splitInput = tempInputRest.split(/\bDESCRIPTION\b/i);
        
        tempInputRest = splitInput[1];
        stringSpecialAbilitiesData = splitInput[0];
        splitInput = "";
    }
    
    if(dataInput.search(/\bDescription\b/i) !== -1) {
        foundDescriptionData = true;
        stringDescriptionData = tempInputRest;
    }
    
    /*
    if(dataInput.indexOf("GEAR") !== -1) {
        splitInput = tempInputRest.split("GEAR");
        tempInputRest = splitInput[1];
        stringGearData = splitInput[0];
        splitInput = "";
    }
    
    if(dataInput.indexOf("ECOLOGY") !== -1) {
        splitInput = tempInputRest.split("ECOLOGY");
        stringGearData = splitInput[0];
        stringEcologyData = splitInput[1];
        splitInput = "";
    }*/    
    
    /*
     * Extract Values from the Blocks
     * and save that in a Object for formattedInput
     * to be mapped onto the dataTemplate later
     */
    
    // Take General Data and extract Name, CR, XP and Stuff
    await splitGeneralData(stringGeneralData);
    
    // Take Defense Data and extract AC, HP, Immunities and Stuff
    await splitDefenseData(stringDefenseData);
        
    // Take Offense Data and extract 
    await splitOffenseData(stringOffenseData);
    
    // Take Tactics Data and extract Stuff
    if(foundTacticsData == true) {
        await splitTacticsData(stringTacticsData);
    }
    
    // Take Statistics Data and extract Attribute, BAB, CMB, CMD, Feats, Skills, Languages, SQs and Gear
    await splitStatisticsData(stringStatisticsData);
    
    // Take Special Abilities Data
    if(foundSpecialAbilitiesData == true) {
        await splitSpecialAbilitiesData(stringSpecialAbilitiesData);        
    }
    
    // Take Description Data
    if(foundDescriptionData == true) {
        await splitDescriptionData(stringDescriptionData);
    }
    
    // Map SchemaData to TemplateData
    await mapInputToTemplateFoundryVTT(formattedInput);

    // CREATE NEW ACTOR
    let newActor = await createNewActor();
    if(window.auto_csv_flag){
        return dataOutput;
    }
    
    if(DEBUG==true) { 
        console.log("sbc-pf1 | CHECK HERE FOR DIFFERENCES BETWEEN RAW INPUT, PARSED AND SAVED DATA");
        console.log("==============================================================================================");
        console.log("sbc-pf1 | RAW INPUT AFTER MINOR CLEANUP");
        console.log(dataInput);
        console.log("sbc-pf1 | PARSED AND FORMATTED DATA IN NEUTRAL TEMPLATE");
        console.log(formattedInput);
        console.log("==============================================================================================");
        console.log("sbc-pf1 | DATA CONVERTED INTO A PF1 ACTOR");
        console.log(await game.actors.get(newActor.id));
        console.log("==============================================================================================");
    };
    
    await resetSBC();
    await initializeSBC();
}



/* ------------------------------------ */
/* MAP INPUT TO NEUTRAL TEMPLATE    	*/
/* ------------------------------------ */

// Split General Data and extract Name, CR, XP and Stuff
function splitGeneralData(stringGeneralData) {
    if(DEBUG==true) { console.log("sbc-pf1 | Parsing general data") };
    // Separate Name and Challenge Rating
    
    let splitGeneralData = stringGeneralData.replace(/\n/gm,"");
    splitGeneralData = splitGeneralData.replace(/defense$|defenses$/i,"");
        
    // Name (every char until "CR" is found)
    let splitName = splitGeneralData.match(/.+?(?=CR)/)[0];
    
    // CR
    let splitCR = splitGeneralData.match(/(1\/\d|\d+)/)[0];
    
    // XP
    let splitXP =0;
    if (splitGeneralData.search(/(\s*XP\s*)/im) !== -1) {
        splitXP = splitGeneralData.match(/(?:XP\s*)([\d,.]+)/)[1].replace(/([\D]|[,?]|[\.?])/g,"");
    }
        
    //Alignment
    let splitAlignment = "";
    if (splitGeneralData.search(/(\*A|LG|LN|LE|NG|N|NE|CG|CN|CE) /) !== -1) {
        splitAlignment = splitGeneralData.match(/(\*A|LG|LN|LE|NG|N|NE|CG|CN|CE) /)[0].replace(/\s+?/,"");
    }
    
    // Size, Space and Reach
    let splitSize = splitGeneralData.match(new RegExp(enumSizes.join("|"), "i"))[0].replace(/\s+?/,"");
    let splitSpace = "";
    let splitReach = "";

    switch(splitSize) {
        case "Fine": splitSpace = "0.5 ft."; splitReach = "0 ft."; break;
        case "Diminutive": splitSpace = "1 ft."; splitReach = "0 ft."; break;
        case "Tiny": splitSpace = "2.5 ft."; splitReach = "0 ft."; break;
        case "Small": splitSpace = "5 ft."; splitReach = "5 ft."; break;
        case "Medium": splitSpace = "5 ft."; splitReach = "5 ft."; break;
        case "Large": splitSpace = "10 ft."; splitReach = "5-10 ft."; break;
        case "Huge": splitSpace = "15 ft."; splitReach = "10-15 ft."; break;
        case "Gargantuan": splitSpace = "20 ft."; splitReach = "15-20 ft."; break;
        case "Colossal": splitSpace = "30 ft."; splitReach = "20-30 ft."; break;
        default: break;
    }
    
    // Split Classes, if available
    // Special Case: (Medium)(?: \d+?) 
    let regExClassesAndLevel = new RegExp("(\\b".concat(enumClasses.join("\\b|\\b")).concat(")(?:\\s*\\d+)"), "gi");
    let regExClasses = new RegExp("(\\b".concat(enumClasses.join("\\b|\\b")).concat(")"), "gi");
    let splitClasses = splitGeneralData.match(regExClassesAndLevel);
    
    // If there are classes, get them, their level and the race / gender as well
    if ( (splitClasses !== null) && (splitClasses !== "") ) {
        // Set Flag
        dataInputHasClasses = true;
        // Get Class(es)
        
        for (let i=0; i<splitClasses.length; i++) {
            
            let item = splitClasses[i];
            
            if ( item !== undefined ) {
                                
                // Check for className (first for classes with two words e.g. vampire hunter)
                let classNameAndLevel = "";
                let className = "";
                let classNameSuffix = "";
                let classLevel = "";

                // Get Classlevel and words in between class an level
                //let regExClassAndLevel = new RegExp("(" + item + ")" + "(?:[\\s]*?)([\\w\\s()]*?)(?:[\\s]*?)(\\d+)", "ig");
                
                //classNameAndLevel = splitGeneralData.match(regExClassAndLevel);
                classNameAndLevel = item;
                                
                if (item.search(/Medium/i) !== -1) {
                    className = "Medium";
                } else {
                    className = classNameAndLevel.split(/[\s](?:\d)/)[0].match(regExClasses);
                }
                classNameSuffix = classNameAndLevel.split(/[\s](?:\d)/)[0].replace(regExClasses, "").replace(/^ | $/, "");
                classLevel = classNameAndLevel.match(/(\d+?)/)[0];

                // If it's an NPC Class, add Npc to the Name
                // Because thats the notation used in the gameSystem
                if (className[0].search(/(adept)|(commoner)|(expert)|(warrior)|(aristocrat)/i) !== -1 ) {
                    className = className[0].concat("Npc");
                }
                
                if (className[0].search(/necromancer|diviner|evoker|illusionist|transmuter|abjurer|conjurer|enchanter/i) === -1) {
                    formattedInput.classes[className] = {
                        "name" : className[0],
                        "nameSuffix" : classNameSuffix,
                        "level" : +classLevel
                    }
                } else {
                    formattedInput.classes.wizard = {
                        "name" : "wizard",
                        "nameSuffix" : "(" + className[0] + ")",
                        "level" : +classLevel
                    }
                }
                
                
            }
            
        }
        
        // Get Gender and Race if available
        let regExGenderAndRace = new RegExp("(?:[0-9]*?)([^0-9]*)(?:" + enumClasses.join("|") + ")(?:\\s+\\d+)", "ig");

        // Search if there is info before the class to evaluate
        if (splitGeneralData.split(regExGenderAndRace)[1]) {
        
            let stringGenderAndRace = splitGeneralData.split(regExGenderAndRace)[1];
            
            // Get Gender
            let regExGender = new RegExp("(" + enumGender.join("|") + ")", "i");
            let foundGender = "";
            
            if (stringGenderAndRace.search(regExGender) !== -1) {
                foundGender = stringGenderAndRace.match(regExGender)[0];
            }
            
            // Get Race, check first if there is a playable race
            let regExPlayableRace = new RegExp("(" + enumRaces.join("|") + ")", "i");
            let regExNonPlayableRace = new RegExp("(?:" + enumGender.join("|") + ")(?:[\\s]*?)([^0-9]*)", "gi");
            
            let foundRace = "";
            
            if (stringGenderAndRace.search(regExPlayableRace) !== -1) {
                // Test playable Races
                foundRace = stringGenderAndRace.match(regExPlayableRace)[0];
                dataInputHasPlayableRace = true;
                
                // FOR NOW JUST USE EVERYTHING AS NONPLAYABLE
                //foundRace = stringGenderAndRace.split(regExNonPlayableRace).join("").replace(/^ | $/, "");
                //dataInputHasNonPlayableRace = true;
            } else {
                // If no playable Race is found, simply remove the gender(s) and use the rest as race
                foundRace = stringGenderAndRace.split(regExNonPlayableRace).join("").replace(/^ | $/, "");
                dataInputHasNonPlayableRace = true;
            }
          
            formattedInput.gender = foundGender;
            formattedInput.race = capitalize(foundRace);
        }        
        
    }
    
    // Creature Type and Subtype(s)
    let splitType = splitGeneralData.match(new RegExp(enumTypes.join("|"), "i"))[0];
        
    // Subtypes
    let splitSubtypes = "";
    let regExSubtypes = new RegExp(enumSubtypes.join("|"), "ig");

    // Test only on strings in parenthesis
    let splitGeneralDataInBrackets = splitGeneralData.match(/\(([^)]+)\)/g);
    
    if (splitGeneralDataInBrackets !== null) {

        // Check each match for valid Subtypes
        // !!! ??? Potential Error Point: Takes only the last match found
        
        for (let i=0; i<splitGeneralDataInBrackets.length; i++) {
            let foundSubtypes = splitGeneralDataInBrackets[i].match(regExSubtypes);
            if(foundSubtypes !== null) {
                splitSubtypes = foundSubtypes;
            }
        }
        
    }
    
    // Initiative (positive and negative)
    let splitInit = splitGeneralData.match(/(?:Init\s*)(\+\d+|-\d+|\d+)/)[1];
    
    // Senses
    let splitSenses = "";
    if (splitGeneralData.search(/\bSenses\b/gmi) !== -1) {
        splitSenses = splitGeneralData.match(/(?:\bSenses\b\s*)(.*?)(?:\n|$|\s*Aura)/igm)[0].replace(/\bSenses\b\s*|\s*Aura\b/g,"");
    }
    
    // Aura
    let splitAura = "";
    if (splitGeneralData.search(/Aura\b/igm) !== -1) {
        splitAura = splitGeneralData.match(/(?:Aura\s*)(.*?)(?:;|\n|$)/igm)[0].replace(/Aura\s*/,"");
    }
        
    // Save the found entries into formattedInput
    formattedInput.name = splitName;
    
    // Save the Challenge Rating as a number
    if (splitCR.search("/") !== -1) {
        let nominator = 1;
        let denominator = splitCR.match(/\/(\d)/)[1];
        if (denominator == 3) {
            formattedInput.cr = 0.3375;
        } else if (denominator == 6) {
            formattedInput.cr = 0.1625;
        } else {
            formattedInput.cr = +nominator / +denominator;
        }
    } else {
        formattedInput.cr = splitCR;
    }
        
    // For now, use cr as level
    formattedInput.level = splitCR;
            
    formattedInput.xp = splitXP;
    formattedInput.alignment = splitAlignment;
    formattedInput.size = splitSize;
    formattedInput.space = splitSpace;
    formattedInput.reach = splitReach;
        
    formattedInput.creature_type = splitType;
    formattedInput.creature_subtype = splitSubtypes;
    formattedInput.initiative = splitInit;
    formattedInput.senses = splitSenses;
    formattedInput.aura = splitAura;
    
    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing general data") };
}

// Split Defense Data and extract AC, HP, Immunities and Stuff
function splitDefenseData(stringDefenseData) {
    if(DEBUG==true) { console.log("sbc-pf1 | Parsing defense data") };
    
    stringDefenseData = stringDefenseData.replace(/^ | $|^\n*/,"");
        
    // Clean up the Input if there are extra linebreaks (often when copy and pasted from pdfs)
    // Remove linebreaks in parenthesis
    stringDefenseData = stringDefenseData.replace(/(\([^(.]+?)(?:\n)([^(.]+?\))+?/mi, "$1 $2");
    
    let splitDefenseData = stringDefenseData.split(/\n/);
    
    // Get all AC Boni included in Input (everything in parenthesis in splitDefenseData[0]) and split them into separate strings
    let splitACBonusTypes = {};
    if (splitDefenseData[0].search(/\([\s\S]*?\)/) !== -1) {
        splitACBonusTypes = JSON.stringify(splitDefenseData[0].match(/\([\s\S]*?\)/)).split(/,/);
    
        // Loop through the found AC Boni and set changes accordingly
        for (let i=0; i<splitACBonusTypes.length; i++) {
            
            let item = splitACBonusTypes[i];
            
            // get the bonus type
            let foundBonusType = item.match(/([a-zA-Z]+)/i)[0];
            let foundBonusValue = item.match(/(\+[\d]*)|(-[\d]*)/i)[0].replace(/\+/,"");

            formattedInput.ac_bonus_types[foundBonusType] = +foundBonusValue;
            
        }
        
        formattedInput.acNotes = JSON.parse(splitACBonusTypes)[0];
    }

    // Extract AC, Touch AC and Flat-Footed AC
    splitDefenseData[0] = splitDefenseData[0].replace(/\([\s\S]*?\)/,"");
    let splitArmorClasses = splitDefenseData[0].split(/[,;]/g);
    
    splitArmorClasses.forEach( function (item, index) {
        if (this[index].match(/(\bAC\b)/gmi)) {
            let splitAC = this[index].replace(/(\bAC\b)/gmi,"").replace(/^ *| *$|^\n*/g,"");
            formattedInput.ac = splitAC;
        } else if (this[index].match(/(\bTouch\b)/gmi)) {
            let splitTouch = this[index].replace(/(\btouch\b)/gmi,"").replace(/^ *| *$|^\n*/g,"");
            formattedInput.touch = splitTouch;
        } else if (this[index].match(/(\bflat-footed\b)/gmi)) {
            let splitFlatFooted = this[index].replace(/(\bflat-footed\b)/gmi,"").replace(/^ *| *$|^\n*/g,"");
            formattedInput.flat_footed = splitFlatFooted;
        }
    }, splitArmorClasses);
    
    // Extract Number and Size of Hit Dies as well as HP
    // Hit dice
        
    let splitHPTotal = splitDefenseData[1].split(/(?:hp\s*)([\d]*)/)[1];
    formattedInput.hp.total = splitHPTotal;
    
    
    let stringHitDice = JSON.parse(JSON.stringify(splitDefenseData[1].match(/\([\s\S]*?\)/)));

    // If available, extract Regeneration
    if (splitDefenseData[1].search(/Regeneration/i) !== -1) {
        let tempRegen = splitDefenseData[1].match(/(?:Regeneration )([\s\S]+?)(?:\n|$|;)/i);
        formattedInput.regeneration = tempRegen[1];
    }
    // If available, extract Fast Healing
    if (splitDefenseData[1].search(/Fast Healing/i) !== -1) {
        let tempFastHealing = splitDefenseData[1].match(/(?:Fast Healing )([\s\S]+?)(?:\n|$|;)/i);
        formattedInput.fast_healing = tempFastHealing[1];
    }
    
    // Calculate HP and HD for Class and Race Items

    // Get different DicePools, e.g. XdY combinations, mostly for combinations of racial and class hitDice
    let hitDicePool = JSON.stringify(stringHitDice).match(/(\d+?d\d+)/gi);
    
    // Get the total HD
    let totalHD = 0;
    let totalClassHD = 0;
    // Loop over the available XdY Combinations
    hitDicePool.forEach ( function (hitDiceItem, hitDiceIndex) {
        // Increment the totalHD Counter
        totalHD += +hitDiceItem.match(/(\d+)(?:d\d+)/i)[1];
    });
    
    // Get the total HD of classHD
    let classKeys = Object.keys(formattedInput.classes);
    classKeys.forEach( function (classKey, classKeyIndex) {
        let numberOfClassLevels = formattedInput.classes[classKey].level;
        totalClassHD += +numberOfClassLevels;
    });
        
    // If there are no classes, all HD are racialHD
    if (totalClassHD === 0) {
        // ONLY RACIALHD        
        let hitDicePoolKey = Object.keys(hitDicePool);
        for (let i = 0; i < hitDicePoolKey.length; i++) {
            
            // Set HP for RacialHDItem        
            let tempDiceSize = hitDicePool[i].match(/(?:d)(\d+)/)[1];
            
            // Set HP, HD.Racial and HD.Total
            formattedInput.hp.racial = Math.floor(+totalHD * +getDiceAverage(tempDiceSize));
            formattedInput.hit_dice.hd.racial = +totalHD;
            formattedInput.hit_dice.hd.total = +totalHD;
        }
  
    } else if (totalHD - totalClassHD === 0) {
        // ONLY CLASSHD        
        // Loop over the dicePool
        let hitDicePoolKey = Object.keys(hitDicePool);
        for (let i = 0; i < hitDicePoolKey.length; i++) {
            
            let tempNumberOfHD = hitDicePool[i].match(/(\d+)(?:d\d+)/)[1];
            let tempHDSize = hitDicePool[i].match(/(?:\d+d)(\d+)/)[1];
            
            // Loop over the classes
            let classKeys = Object.keys(formattedInput.classes);
            for (let j = 0; j < classKeys.length; j++) {
                
                let classLevel = formattedInput.classes[classKeys[j]].level;
                
                
                
                // THIS IS NOT WORKING WHEN BOTH DICE POOLS HAVE THE SAME NUMBER OF DICE, e.g. 1d6 + 1d8
                
                
                
                
                if (tempNumberOfHD == classLevel) {        
                    // Set HP, HD.Racial and HD.Total
                    formattedInput.hp.class[j] = Math.floor(+classLevel * +getDiceAverage(tempHDSize));
                    formattedInput.hit_dice.hd.class[j] = +tempNumberOfHD;
                    formattedInput.hit_dice.hd.total += +tempNumberOfHD;
                    
                }
                
                
            }
            
        }
        
    } else if (totalHD - totalClassHD !== 0) {
        // CLASSHD AND RACIALHD
        // Loop for as long as not all ClassHD are matched
        let numberOfClasses = Object.keys(formattedInput.classes).length;
        let numberOfMatchedHD = Object.keys(hitDicePool).length;
        
        
        let counterOfMatchedHD = 0;
        let counterOfMatchedClasses = 0;
        
        while (counterOfMatchedHD < numberOfMatchedHD) {

            // Loop over the classKeys
            classKeys.forEach( function (classKey, classKeyIndex) {
                                
                // Loop over the hitDicePool searching for matches
                hitDicePool.forEach ( function (hitDiceItem, hitDiceIndex) {
                                        
                    let tempNumberOfHD = +hitDiceItem.match(/(\d+)(?:d\d+)/i)[1];
                    let tempHDSize = +hitDiceItem.match(/(?:d)(\d+)/i)[1];
                    let tempClassLevel = formattedInput.classes[classKey].level;
 
                    if ( (tempNumberOfHD == tempClassLevel) && (+counterOfMatchedHD !== +numberOfMatchedHD) && (counterOfMatchedClasses !== numberOfClasses) ) {
                        // IF ITS THE A DIRECT MATCH BETWEEN CLASS LEVEL AND NUMBER OF HITDICE
                        
                        formattedInput.hp.class[classKey] = Math.floor(+tempClassLevel * +getDiceAverage(tempHDSize));
                        formattedInput.hit_dice.hd.class[classKey] = +tempNumberOfHD;
                        formattedInput.hit_dice.hd.total += +tempNumberOfHD;
                        
                        counterOfMatchedHD++;
                        counterOfMatchedClasses++;
                        
                    } else if ( (tempNumberOfHD !== tempClassLevel) && (+counterOfMatchedHD == +(numberOfMatchedHD-1)) && (counterOfMatchedClasses !== numberOfClasses) ) {
                        // IF ITS THE LAST HD POSSIBLE AND THERE IS STILL A CLASS LEFT TO MATCH
 
                        formattedInput.hp.class[classKey] = Math.floor(+tempClassLevel * +getDiceAverage(tempHDSize));
                        formattedInput.hp.racial = Math.floor( (+tempNumberOfHD - +tempClassLevel) * +getDiceAverage(tempHDSize));
                        formattedInput.hit_dice.hd.class[classKey] = +tempNumberOfHD;
                        formattedInput.hit_dice.hd.racial = +tempNumberOfHD - +tempClassLevel;
                        
                        formattedInput.hit_dice.hd.total += +tempNumberOfHD;
                        
                        counterOfMatchedHD++;
                        counterOfMatchedClasses++;
                                                
                    } else if ( (counterOfMatchedHD == (numberOfMatchedHD-1)) && (counterOfMatchedClasses == numberOfClasses) ) {
                        // IF ITS THE LAST HD POSSIBLE AND THERE IS NO CLASS LEFT                    
                        formattedInput.hp.racial = Math.floor( +tempNumberOfHD * +getDiceAverage(tempHDSize) );
                        formattedInput.hit_dice.hd.racial = +tempNumberOfHD;
                        formattedInput.hit_dice.hd.total += +tempNumberOfHD;
                        
                        counterOfMatchedHD++;
                    }
                    
                    
                }); // End of Loop over the classKeys
                
                
            }); // End of Loop over the hitDicePool
            
            
        }
        

    }
    
    
    //let hitDiceBonusPool = JSON.stringify(stringHitDice).match(/[^d+\(](\d+)/gi);
    let hitDiceBonusPool = stringHitDice[0].replace(/(\d+d\d+)/gi,"").match(/\d+/g);
    
    let hitDiceBonus = 0;
        
    // Get the sum of all the additional bonus hp, denoted for example by "+XX" and / or "plus XX"
    if (hitDiceBonusPool !== null) {
        
        for (let i = 0; i < hitDiceBonusPool.length; i++) {
            hitDiceBonus += +hitDiceBonusPool[i];
        }
    
    }
    
    // Extract Saves    
    let splitSaves;
    
    for (var i = 0; i < splitDefenseData.length; i++) {
        if (splitDefenseData[i].search(/Fort/i) !== -1) {
            splitSaves = splitDefenseData[i].split(/,|;/);
        }
    }
        
    //let splitSaves = splitDefenseData[2].split(/,/);    
    splitSaves.forEach( function (item, index) {
        
        item = item.replace(/,/g, "");
        
        if (this[index].search(/(fort)/i) !== -1) {
            let splitFort = item.match(/(\+\d+|\-\d+|\d+)/ig)[0];
            formattedInput.fort_save.total = splitFort.replace(/\+/,"");
        } else if (this[index].search(/(ref)/i) !== -1) {
            let splitRef = item.match(/(\+\d+|\-\d+|\d+)/ig)[0];
            formattedInput.ref_save.total = splitRef.replace(/\+/,"");
        } else if (this[index].search(/(will)/i) !== -1) {
            let splitWill = item.match(/(\+\d+|\-\d+|\d+)/ig)[0];
            formattedInput.will_save.total = splitWill.replace(/\+/,"");
        } else {
            formattedInput.save_notes = item;
        }
    }, splitSaves);
    
    // Check if there is a forth line
    /// then extract Damage Reduction, Resistances, Immunities, Weaknesses and Spell Resistance 
    
    // REWORKED
    let searchableDefenseData = JSON.stringify(stringDefenseData).replace(/\\n/g, ";").replace(/Offense;|Offenses/i, "");
    
    // Damage Reduction
    if (searchableDefenseData.search(/\bDR\b/) !== -1) {
        let splitDRValue = searchableDefenseData.match(/(?:\bDR\b )(\d+)/)[0].replace(/\bDR\b /, "");
        let splitDRType = searchableDefenseData.match(/(?:\bDR\b \d+\/)([\w\s]*)/)[1];
        formattedInput.damage_reduction.dr_value = splitDRValue;
        formattedInput.damage_reduction.dr_type = splitDRType;
    }
    
    // Immunities
    if (searchableDefenseData.search(/\bImmune\b|\bImmunities\b/i) !== -1) {
        let splitImmunities = searchableDefenseData.match(/(?:\bImmune\b |\bImmunities\b )(.*?)(?:;)/i)[0].replace(/\bimmune\b |\bimmunities\b /i, "");
        formattedInput.immunities = splitImmunities;
    }
    
    // Resistances
    if (searchableDefenseData.search(/\bResist\b|\bResistances\b/i) !== -1) {
        let splitResistances = searchableDefenseData.match(/(?:\bResist\b |\bResistance\b )(.*?)(?:;)/i)[0].replace(/\bResist\b |\bResistances\b /i, "");
        formattedInput.resistances = splitResistances;
    }
    
    // Weaknesses
    if (searchableDefenseData.search(/\bWeakness\b|\bWeaknesses\b/i) !== -1) {
        let splitWeaknesses = searchableDefenseData.match(/(?:\bWeakness\b |\bWeaknesses\b )(.*?)(?:;)/i)[0].replace(/\bWeakness\b |\bWeaknesses\b /i, "");
        // Remove the phrase "Vulnerable to" if thats there
        splitWeaknesses = splitWeaknesses.replace(/vulnerability to |vulnerable to | and /gi, "")
        formattedInput.weaknesses = splitWeaknesses;
    }
    
    // Spell Resistance
    if (searchableDefenseData.search(/\bSR\b/i) !== -1) {
        let splitSR = searchableDefenseData.match(/(?:\bSR\b )(.*?)(?:;)/i)[0].replace(/\bSR\b /i, "");
        splitSR = splitSR.replace(/;|,| |\n/g, "");
        formattedInput.spell_resistance.total = splitSR.match(/(^\d+)/)[0];
        if (splitSR.search(/\(([^)]+)\)/) !== -1) {
            formattedInput.spell_resistance.context = splitSR.match(/\(([^)]+)\)/)[0];
        }
    }
    
    // Defensive Abilities
    // Spell Resistance
    if (searchableDefenseData.search(/\bDefensive Abilities\b/i) !== -1) {
        let splitDefensiveAbilities = searchableDefenseData.match(/(?:\bDefensive Abilities\b )(.*?)(?:;)/i)[0].replace(/\bDefensive Abilities\b /i, "");
        splitDefensiveAbilities = splitDefensiveAbilities.replace(/;|,|\n/g, ",").replace(/,\s+$|,$/g, "");
        splitDefensiveAbilities = splitDefensiveAbilities.split(/,/g);
        formattedInput.defensive_abilities = splitDefensiveAbilities;
    }

    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing defense data") };
}

// NEW FUNCTION FOR THE OFFENSE BLOCK
function splitOffenseData(stringOffenseData) {
    if(DEBUG==true) { console.log("sbc-pf1 | Parsing offense data") };
    
    let splitOffenseData = stringOffenseData.replace(/^ | $|^\n*/,"");
        
    // Speed
    let splitSpeed = splitOffenseData.match(/(?:\bSpeed\b )(.*)(?:\n|$)/i)[1];
    let landSpeedBase = splitSpeed.match(/\d+/)[0];
    let landSpeedTotal = landSpeedBase;
    let landSpeedContext = "";
    
    formattedInput.speed.land.base = landSpeedBase;
            
    if (splitSpeed.search(/^\d+\s*ft\.\s*\(([^)]+)\)/) !== -1) {
        landSpeedContext = splitSpeed.match(/^\d+\s*ft\.(.*),*/)[1];
                
        landSpeedTotal = landSpeedContext.match(/\d+/)[0];
                
        formattedInput.speed.land.total = landSpeedTotal;
    } else {
        formattedInput.speed.land.total = landSpeedBase;
    }
    
    // Check for Speed Special Abilities
    if (splitSpeed.search(/;/) !== -1) {
        let speedSpecialAbilities = splitSpeed.match(/(?:;)(.*)/)[1];
        
        let splitSpeedAbilities = speedSpecialAbilities.split(/,/);
                
        splitSpeedAbilities.forEach ( async function (item) {
            let tempItem = capitalize(item.replace(/^ | $/, ""));
            setSpecialAbilityItem(tempItem, "Misc", "Speed Ability");
        })
        
    }
    
    // Check for other Speeds
    if (splitSpeed.search(/,/g) !== -1) {
        let splitSpeeds = splitSpeed.replace(/, /g, ",")
        splitSpeeds = splitSpeeds.replace(/(;.*)/, "");
        splitSpeeds = splitSpeeds.replace(/^\d+\s*ft\..*,/, "");
        splitSpeeds = splitSpeeds.split(/,/g);
        
        console.log("splitSpeeds: " + splitSpeeds);
                
        splitSpeeds.forEach ( function (item, index) {
            
            let tempSpeedType = item.replace(/\s*\(([^)]+)\)/g, "").replace(/^ | $/g, "");
            let speedType = tempSpeedType.match(/\b\w*\b/)[0];
            let speedBase = tempSpeedType.match(/\d+/)[0];
            let speedTotal = speedBase;
            
            let speedContext = "";
            
            if (item.search(/fly/) === -1 && item.search(/\(([^)]+)\)/g) !== -1) {
                speedContext = item.match(/\(([^)]+)\)/g)[0];
                speedTotal = speedContext.match(/\d+/)[0];
            } else if (item.search(/fly/) !== -1 && item.search(/\(([^)]+)\)/g) !== -1) {
                let flyManeuverability = item.match(/\(([^)]+)\)/)[1];
                console.log("item: " + item);
                console.log("match2: " + item.match(/\(([^)]+)\)/)[2]);
                
                if (item.match(/\(([^)]+)\)/g)[2] !== undefined) {
                    speedContext = item.match(/\(([^)]+)\)/g)[2];
                    speedTotal = speedContext.match(/\d+/)[0];
                    console.log("contextTotal: " + speedTotal);
                } else {
                    speedContext = item.match(/\(([^)]+)\)/g)[1];
                    
                }
                console.log("speedContext: " + speedContext);
                
                formattedInput.speed.fly.maneuverability = flyManeuverability;
            } else {
                
            }
      
            
            
            if (speedType !== "" && speedBase !== null) {
                // If its a movementType with speed (e.g. land, fly, climb or burrow)
                formattedInput.speed[speedType].base = +speedBase;
                formattedInput.speed[speedType].total = +speedTotal;
            } else {
                // If it's not one of the normal movementTypes the probability is high, that it's a special ability
                formattedInput.special_abilities[item] = { "name": item };
            }
            
            
        });
    }
        
    // Check, if space and reach are as intended for the creature size
    // and if not, change it
    if (splitOffenseData.search(/\bReach\b/i) !== -1) {
        console.log("splitOffenseData: " + splitOffenseData);
        let splitReach = splitOffenseData.match(/(\bReach\b\s*.*)/i)[0];
        let reachValue = splitReach.match(/(\d+)/)[0];
        let reachContext = "";
        
        if (splitReach.search(/\(([^)]+)\)/) !== -1) {
            reachContext = splitReach.match(/\(([^)]+)\)/)[0];
        }
        
        if (reachValue !== formattedInput.reach) {
            if (reachContext === "") {
                formattedInput.reach = reachValue + " ft.";
            } else {
                // SEARCH FOR A MATCHING CONTEXT
                console.log("searching for matching reach context");
                formattedInput.reach = reachValue + " ft.";
                formattedInput.reach_context = reachContext;
            }
        }
    }
        
    /* ------------------------------------ */
    /* ATTACKS                          	*/
    /* ------------------------------------ */
    
    // Create usable Strings for melee, ranged and special attacks
    
    // Melee
    // If there are ranged or special attacks
    
    let splitMeleeAttacks = "";
    let splitRangedAttacks = "";
    let splitSpecialAttacks = "";
    
    // Melee, Ranged and Special    
    // FIRST, SPLIT SPELL STUFF FROM ATTACKS
    let splitOffenseAttacks = "";
    let splitOffenseSpells = [];    
    
    if (splitOffenseData.search(/\bSpell/i) !== -1) {
        splitOffenseAttacks = splitOffenseData.split(/^(?=.*\bSpells\b|.*\bSpell\b)/gim)[0];
        let tempSplitOffenseSpells = splitOffenseData.split(/^(?=.*\bSpells\b|.*\bSpell\b)/gim);
        
        // Push everything apart from the attacks into splitOffenseSpells as separate objects
        for (let i=1; i < tempSplitOffenseSpells.length; i++) {
            splitOffenseSpells.push(tempSplitOffenseSpells[i]);
        }
        
    } else {
        splitOffenseAttacks = splitOffenseData;
    }
    
    // ATTACKS AND SPECIAL ATTACKS
    if (splitOffenseAttacks.search(/(?:Melee )/im) !== -1) {
                
        // splitMeleeAttacks = splitOffenseData.match(/(?:Melee )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
        splitMeleeAttacks = splitOffenseAttacks.match(/(?:Melee\s*)([\s\S]*?)(?:Ranged|Space|Special Attacks|$)/i)[1].replace(/\n/, " ");
        // Replace ", or " with " or "
        splitMeleeAttacks = splitMeleeAttacks.replace(/, or /, " or ");
        
    }

    if (splitOffenseAttacks.search(/(?:Ranged )/im) !== -1) {
        splitRangedAttacks = splitOffenseAttacks.match(/(?:Ranged\s*)([\s\S]*?)(?:Melee|Space|Special Attacks|$)/i)[1].replace(/\n/, " ");
        // Replace ", or " with " or "
        splitRangedAttacks = splitRangedAttacks.replace(/, or /, " or ");
    }
    
    if (splitOffenseData.search(/(?:Special Attacks )/im) !== -1) {
        splitSpecialAttacks = splitOffenseData.match(/(?:Special Attacks )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
    }
    
    
    formattedInput.meleeAttacks = splitMeleeAttacks.replace(/^Melee /i, "");
    formattedInput.rangedAttacks = splitRangedAttacks.replace(/^Ranged /i, "");
    formattedInput.specialAttacks = splitSpecialAttacks.replace(/^Special Attacks /i, "");
    
    /* ------------------------------------ */
    /* SPELLS & SLAs                    	*/
    /* ------------------------------------ */
    
    if (splitOffenseSpells[0] !== undefined) {
        
        let spellBookCounter = 0;
        
        splitOffenseSpells.forEach ( async function (spellcastingGroup, index) {
            
            let spellBook = "";
            
            let spellGroupType = "";
            let spellGroupSubType = "";
            let spellGroupCL = 0;
            let spellGroupConcentration = 0;
            let spontaneousCasting = true;
            
            // Set the spellGroupType and Subtype
            enumSpellGroups.forEach ( function (item) {
                let spellGroupTypeRegEx = new RegExp (item, "i");
                let spellGroupSubTypeRegEx = new RegExp ("(.*)(?:" + item + ")", "i");
                                
                // Check if the group is of a spellcasting type or contains only extra info
                if (spellcastingGroup.search(spellGroupTypeRegEx) !== -1) {
                    
                    spellGroupType = item;
                    
                    // Check if its a "normal" Spellbook or if its SLA
                    if (spellcastingGroup.search(/Spell-Like/i) !== -1) {
                        spellGroupType = "spelllike";
                    } else {
                        let tempSubType = spellcastingGroup.match(spellGroupSubTypeRegEx)[1];
                        if (tempSubType !== "") {
                            spellGroupSubType = tempSubType.replace(/^ | $/g, "");
                        } else {
                            let classKeys = Object.keys(formattedInput.classes);
                            classKeys.forEach ( function (tempClass) {
                                let regExpSpellcastingClasses = new RegExp ( enumSpellcastingClasses.join("\\b|\\b"), "i");
                                if (tempClass.search(regExpSpellcastingClasses) !== -1) {
                                    spellGroupSubType = formattedInput.classes[tempClass].name;
                                }
                            });
                        }
                        
                        if (spellcastingGroup.search(/(prepared)/i) !== -1) {
                            spontaneousCasting = false;
                            
                        }
                        
                        spellBookCounter++;
                    }
                    
                }
            })
            
            if (spellGroupType !== "") {
                // IF THE GROUP IS A NORMAL SPELLCASTING GROUP
                
                // Set spellBook
                switch (spellBookCounter) {
                    case 1:
                        spellBook = "primary";
                        break;
                    case 2:
                        spellBook = "secondary";
                        break;
                    case 3:
                        spellBook = "tertiary";
                        break;
                    case 0:
                    default:
                        spellBook = "spelllike";
                }
                
                // Set the spellGroupDC
                if (spellcastingGroup.search(/(?:CL\s+)(\d+)/i) !== -1) {
                    spellGroupCL = spellcastingGroup.match(/(?:CL\s+)(\d+)/i)[1];
                }

                // Set the spellGroupConcentration
                if (spellcastingGroup.search(/(?:concentration\s+)(\+\d+|\-\d+)/i) !== -1) {
                    spellGroupConcentration = spellcastingGroup.match(/(?:concentration\s+)(\+\d+|\-\d+)/i)[1];
                }
                
                // Set the spells as an array of lines for each row of input, e.g. 1/day, 1st
                let tempSpells = spellcastingGroup.split(/\n/);
                let splitSpellRows = [];
                
                tempSpells.forEach ( function (spellRow, index) {
                    // ignore the first line, because thats the GroupInfo
                    if (index !== 0 && spellRow !== "") {
                        splitSpellRows.push(spellRow);
                    }
                });
                
                // Save Spellbook to formattedInput
                formattedInput.spellcasting[spellBook] = {
                    "groupType": spellGroupType,
                    "type": spellGroupSubType,
                    "CL": spellGroupCL,
                    "concentration": spellGroupConcentration,
                    "spontaneous": spontaneousCasting,
                    "spells": splitSpellRows
                };
                
            } else {
                // IF ITS NOT A SPELLCASTING GROUP, BUT e.g. CONTEXT DATA (Domain, etc.)
                
                // ADD DOMAINS AS CLASS FEATURES
                if (spellcastingGroup.search(/Domains/) !== -1) {
                    let tempDomains = spellcastingGroup.match(/(?:Domains )(.*)/)[1];
                    let domains = tempDomains.split(/,/);

                    domains.forEach ( async function (item) {
                        let domain = "Domain (" + item.replace(/^ | $/g, "") + ")";

                        await setSpecialAbilityItem(domain, "class", "Spellcasting");
                    })
                }
                
                // ADD OPPOSITION SCHOOLS
                // Opposition Schools illusion, transmutation
                if (spellcastingGroup.search(/Opposition/i) !== -1) {
                    let tempOppositionSchools = spellcastingGroup.match(/(?:Opposition Schools )(.*)/)[1];
                    let oppositionSchools = tempDomains.split(/,/);

                    oppositionSchools.forEach ( async function (item) {
                        let oppositionSchool = "oppositionSchool (" + item.replace(/^ | $/g, "") + ")";

                        await setSpecialAbilityItem(oppositionSchool, "class", "Opposed School");
                    })
                }
                
            }

        });
    }
    

    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing offense data") };
}

// Split Tactics Data and extract Tactics
function splitTacticsData(stringTacticsData) {
    if(DEBUG==true) { console.log("sbc-pf1 | Parsing tactics data") };
    
    let splitTacticsData = stringTacticsData.replace(/^ | $|^\n*/,"");
    
    splitTacticsData = splitTacticsData.replace(/\n/gm," ");    
    // Check for Keywords "During Combat, Before Combat and Morale"
    if(splitTacticsData.search(/Before Combat/m) !== -1) {
        let splitTacticsBeforeCombat = splitTacticsData.match(/Before Combat .+?(?=Morale|During|Base Statistics|$)/);
        formattedInput.tactics.before_combat = splitTacticsBeforeCombat;
    }
    
    if(splitTacticsData.search(/During Combat/mi) !== -1) {
        let splitTacticsDuringCombat = splitTacticsData.match(/During Combat .+?(?=Morale|Before|Base Statistics|$)/)[0].replace(/During Combat /,"");
        formattedInput.tactics.during_combat = splitTacticsDuringCombat;
    }
        
    if(splitTacticsData.search(/Morale/m) !== -1) {
        let splitTacticsMorale = splitTacticsData.match(/Morale .+?(?=(Base Statistics)|$)/)[0].replace(/Morale /,"");
        formattedInput.tactics.morale = splitTacticsMorale;
    }
    
    if(splitTacticsData.search(/Base Statistics/m) !== -1) {
        let splitTacticsBaseStatistics = splitTacticsData.match(/Base Statistics .+?(?=$)/)[0].replace(/Base Statistics /,"");
        formattedInput.tactics.base_statistics = splitTacticsBaseStatistics;
    }
    
    if(splitTacticsData.search(/Before Combat|During Combat|Morale/m) == -1) {
        formattedInput.tactics.default = splitTacticsData.replace(/\n/,"");
    }
    
    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing tactics data") };
}

// Split Statistics
function splitStatisticsData(stringStatisticsData) {
    if(DEBUG==true) { console.log("sbc-pf1 | Parsing statistics data") };
    
    // Attributes
    let splitAttributes = stringStatisticsData.match(/(\bStr\b)[\s\S]*(\bCha\b [0-9-—]{1,2})/gmi)[0].replace(/\n/,"").split(/,/);
        
    splitAttributes.forEach ( function (item, index) {
        let tempItem = item.replace(/^(\s*)/,"").replace(/(\s+)/g, " ").split(/\s/);
        let tempAttr = tempItem[0];
        let tempValue = tempItem[1];
        
        // Check if the Item is -, e.g. for Undead (Con) or Oozes (Int)
        if ( ( tempValue === "—" ) || ( tempValue === "-" ) ) {
            // Set the attribute to "-" to work with it later on
            formattedInput[tempAttr.toLowerCase()].total = "-";
        } else {
            formattedInput[tempAttr.toLowerCase()].total = +tempValue;
        }
            
    })
    
    // Attack Modifier
    formattedInput.bab = stringStatisticsData.match(/(?:Base Atk[\s+-]*)([\d]*)/i)[1];
    
    // CMB & CMD
    if (stringStatisticsData.search(/\bcmb\b/im) !== -1) {
        
        let tempCMB = stringStatisticsData.match(/(?:CMB[\s]*)(.*)/i)[1];
                
        // Replace - with 0 for creatures without CMB
        if (tempCMB.search(/(^-[^\d])/) !== -1) {
            formattedInput.cmb.context = "No CMB";
        }
        tempCMB = tempCMB.replace(/(^-[^\d])/, "0;");
                        
        formattedInput.cmb.total = tempCMB.match(/(?:^[+-]*)(\d+)/)[1];
        
        if (tempCMB.search(/\(([^)]+)\)/) !== -1) {
            formattedInput.cmb.context = tempCMB.match(/\(([^)]+)\)/)[0];
        }
    };
    
    if (stringStatisticsData.search(/\bcmd\b/im) !== -1) {
        let tempCMD = stringStatisticsData.match(/(?:CMD )(.*)/i)[1];
        
        // Replace - with 0 for creatures without CMD
        if (tempCMD.search(/^\s*-*[^\d]/) !== -1) {
            formattedInput.cmd.context = "No CMD";
        }
        tempCMD = tempCMD.replace(/(^\s*-[^\d]$)/, "0");

        formattedInput.cmd.total = tempCMD.match(/(^\d*)/)[0];
        if (tempCMD.search(/\(([^)]+)\)/) !== -1) {
            formattedInput.cmd.context = tempCMD.match(/\(([^)]+)\)/)[0];
        }
    }
    
    // Feats (String from "Feats" to next linebreak)
    if (stringStatisticsData.search(/(?:Feats )/) !== -1) {
        let splitFeats = stringStatisticsData.match(/(?:Feats )([\s\S]+?)(?=Skills|Languages)/gim)[0];
        // Cleanup and remove stray linebreaks
        splitFeats = splitFeats.replace(/Skills$/i, "").replace(/\n/g, " ");
        splitFeats = splitFeats.replace(/Feats /i, "");
        splitFeats = splitFeats.replace(/,\s|;\s/g, ",");
        splitFeats = splitFeats.split(/,/);

        formattedInput.feats = splitFeats;
    }
    
    // Skills (String from "Skills" to next linebreak)
    if (stringStatisticsData.search(/(?:Skills )/) !== -1) {
        let splitSkills = stringStatisticsData.match(/(?:Skills\s*)(.*)(?:[0-9)]+?)/gim)[0];
        splitSkills = splitSkills.replace(/Skills\s*/i, "");
        splitSkills = splitSkills.replace(/,\s|;\s/g, ",");
        splitSkills = splitSkills.replace(/\n/, "");
                
        let splitRacialModifiers = "";
        if (splitSkills.search(/\bracial\b \bmodifier\b|\bracial\b \bmodifiers\b/i) !== -1) {
            splitRacialModifiers = splitSkills.split(/\bracial\b \bmodifier\b|\bracial\b \bmodifiers\b/i)[1];
            splitSkills = splitSkills.split(/\bracial\b \bmodifier\b|\bracial\b \bmodifiers\b/i)[0].replace(/,$| $/,"");
        }
         
        // Check if there are Skills with additional info in parenthesis
        if (splitSkills.search(/\(([^)]+)\)/) !== -1) {
            
            // If the parenthesis are followed by a modifier, the info in parenthesis is a subset of the skill
            // For Example Knowledge (planes, engineering) +13, Knowledge (all) +3, or Knowledge (any two) +3
            if (splitSkills.search(/(\b\w*\b \([a-zA-Z0-9,; ]+\) [+-]\d+)/g) !== -1) {
                let tempSkillMultiples = splitSkills.match(/(\b\w*\b \([a-zA-Z0-9,; ]+\) [+-]\d+)/g);
                                
                splitSkills = splitSkills.replace(/(\b\w*\b \([a-zA-Z0-9,; ]+\) [+-]\d+),/g, "");
                tempSkillMultiples.forEach ( function (item, index) {
                    let tempSkillName = item.match(/(\b[a-zA-Z]+\b)(?: \(.*\))/)[1];
                    let tempSkillModifier = item.match(/\-\d+|\+\d+/);
                    let tempSubtypes = item.match(/\(([^)]+)\)/)[0].replace(/[()]/g, "").split(/,|;/g);

                    tempSubtypes.forEach( function (tempSubtype) {
                        splitSkills += ", " + tempSkillName + " (" + tempSubtype + ") " + tempSkillModifier;
                    })
                    
                });
            } 
            
        }
                
        // Save Skills with parenthesis separately
        let splitSkillsWithoutParenthesis = splitSkills.replace(/(,*[^,)]*\([^)]+\)[\s+-\d,]*)/g, "");
        
        let skillsArray = [];
        
        if (splitSkillsWithoutParenthesis) {
            skillsArray = splitSkillsWithoutParenthesis.split(/,/g);
        }
        
        
        if (splitSkills.search (/([^,)]*\([^)]+\)[\s+-\d]*)/g) !== -1) {
            let splitSkillsWithParenthesis = splitSkills.match(/([^,)]*\([^)]+\)[\s+-\d]*)/g);  

            splitSkillsWithParenthesis.forEach ( function (skill) {
                skillsArray.push(skill);
            })
        }
                
        skillsArray.forEach (function (item, index) {
                        
            let skillItem = item.replace(/^ | $/g, "");
            let skillContext = "";
                                                
            let skillTotal = skillItem.match(/(-\d+|\d+)/)[0];
            let skillName = skillItem.replace(/(^\s*|\s*-[\d].*|\s*\+.*)/g, "");

            // Cases with sublevels (Knowledge, Profession, Perform, Craft)
            if (skillName.search(/\bcraft|\bperform|\bprofession|\bknowledge/i) !== -1) {
                let skillSubtype = skillName.match(/\(([^)]+)\)/)[1].replace(/^ | $/g,"");
                let tempSkillName = skillName.replace(/\s*\(([^)]+)\)/g, "");
                tempSkillName = tempSkillName.replace(/^ | $/g, "");
                
                // Parse Knowledge, because these may have special notations
                if (skillName.search(/\bKnowledge\b/i) !== -1) {
                    
                    skillSubtype = skillSubtype.replace(/\bEnter Choice\b/ig, "any one");
                    skillSubtype = skillSubtype.replace(/Arcane/i, "Arcana");
                    skillSubtype = skillSubtype.replace(/\bPer./i, "Perception");
                    skillSubtype = skillSubtype.replace(/S. Motive/i, "Sense Motive");
                    skillSubtype = skillSubtype.replace(/\bLing./i, "Linguistics");
                    
                    // Check if its for ALL knowledge skills
                    if (skillSubtype.match(/\ball\b/i) !== null) {
                        // I'm lazy, so just type them all down instead of looping
                        formattedInput.skills.knowledge.arcana.total = +skillTotal;
                        formattedInput.skills.knowledge.dungeoneering.total = +skillTotal;
                        formattedInput.skills.knowledge.engineering.total = +skillTotal;
                        formattedInput.skills.knowledge.geography.total = +skillTotal;
                        formattedInput.skills.knowledge.history.total = +skillTotal;
                        formattedInput.skills.knowledge.local.total = +skillTotal;
                        formattedInput.skills.knowledge.nature.total = +skillTotal;
                        formattedInput.skills.knowledge.nobility.total = +skillTotal;
                        formattedInput.skills.knowledge.planes.total = +skillTotal;
                        formattedInput.skills.knowledge.religion.total = +skillTotal;
                    } else if (skillSubtype.match(/\bany\b\s.*/i) !== null) {
                        
                        // Find the number of knowledge subskills
                        let stringOfKnowledgeSubskills = skillSubtype.match(/(?:\bany\b )(.*)/i)[1];
                        let numberOfKnowledgeSubskills = 0;
                        
                        switch (stringOfKnowledgeSubskills) {
                            case "one": numberOfKnowledgeSubskills = 1; break;
                            case "two": numberOfKnowledgeSubskills = 2; break;
                            case "three": numberOfKnowledgeSubskills = 3; break;
                            case "four": numberOfKnowledgeSubskills = 4; break;
                            case "five": numberOfKnowledgeSubskills = 5; break;
                            case "six": numberOfKnowledgeSubskills = 6; break;
                            case "seven": numberOfKnowledgeSubskills = 7; break;
                            case "eight": numberOfKnowledgeSubskills = 8; break;
                            case "nine": numberOfKnowledgeSubskills = 9; break;
                            default: break;
                        };                        
                        
                        // Pick Subskills at random
                        let alreadyPickedSubskills = "";
                        
                        for (let i=0; i < numberOfKnowledgeSubskills; i++) {
                            let randomSubskill = Math.floor(Math.random() * 10);
                            
                            let searchString = new RegExp(enumKnowledgeSubskills[randomSubskill], "i");
                            
                            if (alreadyPickedSubskills.search(randomSubskill) === -1 && splitSkills.search(searchString) === -1) {
                                
                                formattedInput.skills.knowledge[enumKnowledgeSubskills[randomSubskill]].total = +skillTotal;
                                formattedInput.skills.knowledge[enumKnowledgeSubskills[randomSubskill]].context = "sbc | Randomly picked";
                                alreadyPickedSubskills += randomSubskill;
                            
                            } else {
                                i--;
                            }
                            
                            
                        }
                    } else if (skillSubtype.search(/\band\b/i) !== -1) {
                        // If there are multiple knowledge skills separated with "and"
                        let splitSkillSubtypes = skillSubtype.split(/\band\b/ig);
                        
                        splitSkillSubtypes.forEach ( function (item) {
                            let tempSkillSubtype = item.replace(/^ | $/g, "");
                            formattedInput.skills[tempSkillName.toLowerCase()][tempSkillSubtype.toLowerCase()].total = +skillTotal;
                        });
                        
                    } else {
                        // No special notation, just a normal knowledge subkey
                        formattedInput.skills[tempSkillName.toLowerCase()][skillSubtype.toLowerCase()].total = +skillTotal;
                    }
                } else {
                    // Not a knowledge skill
                    formattedInput.skills[tempSkillName.toLowerCase()][skillSubtype.toLowerCase()] = +skillTotal;
                }
                
            } else if (skillName.search(/\bcraft|\bperform|\bprofession|\bknowledge/i) === -1 && skillItem.search(/\(([^)]+)\)/) !== -1) {
                
                let tempSkillName = skillName.replace(/\s*\(([^)]+)\)/g, "");
                tempSkillName = tempSkillName.replace(/^ | $/g, "");
                
                skillContext = skillItem.match(/\(([^)]+)\)/)[0];
                
                formattedInput.skills[tempSkillName.toLowerCase()].total = +skillTotal;
                formattedInput.skills[tempSkillName.toLowerCase()].context = skillContext;
                       
            } else {
                // Skill without subskills                
                if (skillItem.search(/\(([^)]+)\)/) !== -1) {
                    skillContext = skillItem.match(/\(([^)]+)\)/)[0];
                }

                formattedInput.skills[skillName.toLowerCase()].total = +skillTotal;
                formattedInput.skills[skillName.toLowerCase()].context = skillContext;
            }

        });
    }
    
    // Racial Skill Modifiers
    
    // Languages
    if (stringStatisticsData.search(/(\bLanguages\b )/) !== -1) {
        let splitLanguages = stringStatisticsData.match(/(?:Languages )(.*)(?:\n+?)/gim)[0].replace(/\n/gm,"");
        splitLanguages = splitLanguages.replace(/Languages /i, "");
        splitLanguages = splitLanguages.replace(/,\s|;\s/g, ",");
        splitLanguages = splitLanguages.split(/,/);

        formattedInput.languages = splitLanguages;
    }
    
    // Special Qualities
    if (stringStatisticsData.search(/(\bSQ\b )/gm) !== -1) {
        let splitSQ = stringStatisticsData.match(/(?:\bSQ\b )(.*)(?:\n+?)/gim)[0].replace(/\n/gm,"");
        splitSQ = splitSQ.replace(/\bSQ\b /, "");
                
        let tempSQs = [];
        if (splitSQ.search(/,|;/g) !== -1) {
            
            // !!! SPLIT ONLY WHEN NOT IN PARENTHESIS

            if (splitSQ.match(/([^,]+\([^(.]+?,[^(.]+?\))+?/gi) !== null) {
                // Get specialAttacks with parenthesis and commas inside the parenthesis
                let specialQualitiesWithParenthesisAndComma = splitSQ.match(/([^,]+\([^(.]+?,[^(.]+?\))+?/gi);

                // Create Special Abilities for special attacks with parenthesis and a list separated by comma in there
                // deeds (derring-do, dodging panache, kip-up, menacing swordplay, opportune parry and riposte, precise strike +4, swashbuckler initiative)

                let specialQualitiesWithParenthesisAndCommaKeys = Object.keys(specialQualitiesWithParenthesisAndComma);

                specialQualitiesWithParenthesisAndCommaKeys.forEach( function (item, index) {

                    let sq = specialQualitiesWithParenthesisAndComma[item];
                    let sqName = sq.match(/([\s\S]*)(?:\([^)]+\))/)[1].replace(/^ | $/g, "");
                    
                    let subSQs = specialQualitiesWithParenthesisAndComma[item].match(/\(([^)]+)\)/)[1].split(/,/);

                    subSQs.forEach ( function (item, index) {
                        let subSQ = item.replace(/^ | $/g, "");

                        // Fill the item with Data
                        let tempSQ = sqName + " (" + subSQ + ")";

                        let featType = "misc";

                        // CHECK, IF ITS A CLASS FEATURE
                        let classFeatureRegEx = new RegExp ( enumClassFeatures.join("\\b|\\b"), "gi");
                        

                        if (sqName.search(classFeatureRegEx) !== -1) {
                            featType = "class";
                        }
                        
                        // Push the item
                        tempSQs.push(tempSQ);
                    });
                });
            } else {
                let specialQualitiesWithoutParenthesis = splitSQ.split(/,/g);
                
                specialQualitiesWithoutParenthesis.forEach ( function (sq) {
                    let tempSQ = capitalize(sq.replace(/^ | $/g, ""));
                    tempSQs.push(tempSQ);
                });
                
                
                
                
            }
                
        } else {
            
            tempSQs[0] = splitSQ;
        }
        
        formattedInput.special_qualities = tempSQs;
                
        dataInputHasSpecialQualities = true;
    }
    
    // Gear

    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing statistics data") };
}

// Split Special Abilities
function splitSpecialAbilitiesData(stringSpecialAbilitiesData) {
    
    
    // Prepare the string for splitting regardless of linebreaks
    let tempSpecialAbilities = stringSpecialAbilitiesData.replace(/\n/g, " ");
    tempSpecialAbilities = tempSpecialAbilities.replace(/(?:\.)(?:([\w\d\s’-]*\())(Ex|Su|Sp)/g, ".###$1$2");
    
    let specialAbilities = tempSpecialAbilities.split(/###/g);
        
    formattedInput.special_abilities = specialAbilities;

}

// Split Description
function splitDescriptionData(stringDescriptionData) {
    
    formattedInput.description = stringDescriptionData;
   
}

/* ------------------------------------ */
/* MAP FROM NEUTRAL TO FOUNDRY TEMPLATE	*/
/* ------------------------------------ */

async function mapInputToTemplateFoundryVTT() {
        
    // Map generalData
    await mapGeneralData(formattedInput);

    if(dataInputHasClasses == true) {
        // Create classes.class Data
        await setClassData(formattedInput.classes);

        // Create a Feature/Class Item for Class and Race Entries
        await setClassItem(formattedInput.classes);
    }
    
    if( (dataInputHasPlayableRace == true) || (dataInputHasNonPlayableRace == true) ) {
        await setRaceItem(formattedInput.race);
    }
    
    // Create a Item for the Creature Type
    await setRacialHDItem(formattedInput);
    
    // Map defenseData
    await mapDefenseData(formattedInput);
    
    // Map OffenseData
    await mapOffenseData(formattedInput);
        
    // Map statisticData
    await mapStatisticData(formattedInput);
    
    // Map Special Qualities
    if (dataInputHasSpecialQualities == true) {
        await mapSpecialQualitiesData();
    }
    
    // Map Special Abilities
    if (dataInputHasSpecialAbilities == true) {
        await mapSpecialAbilitiesData();
    }
    
    // Create a custom Item for Conversion Stuff (e.g. Changes to AC, Saves)
    await setConversionItem(formattedInput);

    // Map Notes
    await mapNotesData();

}

// Map General Data
function mapGeneralData() {
    // Top of the Character Sheet
    dataOutput.name = dataOutput.token.name = formattedInput.name.replace(/^ | $/, "");
    
    // Token Data
    dataOutput.token.name = dataOutput.token.name = formattedInput.name;
    dataOutput.token.width = dataOutput.token.height = enumTokenSize[formattedInput.size].w;
    dataOutput.token.scale = enumTokenSize[formattedInput.size].scale;
    dataOutput.token.bar1 = { "attribute": "attributes.hp" };
    
    // Details
    dataOutput.data.details.level.value = +formattedInput.level;
    dataOutput.data.details.cr.base = dataOutput.data.details.cr.total = +formattedInput.cr;
    dataOutput.data.details.xp.value = formattedInput.xp;
    dataOutput.data.details.alignment = formattedInput.alignment.toLowerCase();
    
    // Changes for Undead Creatures
    let tempHPTotal = 0;
    if (formattedInput.creature_type === "undead") {
        dataOutput.data.attributes.hpAbility = "cha";
        dataOutput.data.attributes.savingThrows.fort.ability = "cha";
        dataOutput.data.attributes.hp.value = dataOutput.data.attributes.hp.max = +formattedInput.hp.total;
    }
    
    // Attributes
    //dataOutput.data.attributes.init.value = formattedInput.initiative - getModifier(formattedInput.dex.total);
    dataOutput.data.attributes.init.total = +formattedInput.initiative;
    
    // Size and Size-Related Stuff
    switch(formattedInput.size) {
        case "Fine": dataOutput.data.traits.size = "fine"; break;
        case "Diminutive": dataOutput.data.traits.size = "dim"; break;
        case "Tiny": dataOutput.data.traits.size = "tiny"; break;
        case "Small": dataOutput.data.traits.size = "sm"; break;
        case "Medium": dataOutput.data.traits.size = "med"; break;
        case "Large": dataOutput.data.traits.size = "lg"; break;
        case "Huge": dataOutput.data.traits.size = "huge"; break;
        case "Gargantuan": dataOutput.data.traits.size = "grg"; break;
        case "Colossal": dataOutput.data.traits.size = "col"; break;
        default: dataOutput.data.traits.size = "med"; break;
    }
    
    dataOutput.data.traits.senses = formattedInput.senses;
    
    // Senses and Vision
    if (formattedInput.senses.search(/low-light/i) !== -1) {
        dataOutput.data.attributes.vision.lowLight = true;
    }
    
    if (formattedInput.senses.search(/darkvision/i) !== -1) {
        let rangeDarkvision = formattedInput.senses.match(/(?:darkvision\s?)(\d+)/i)[1];
        dataOutput.data.attributes.vision.darkvision = rangeDarkvision;
    }
    
    dataOutput.token.vision = true;
    dataOutput.token.dimSight = 0;
    dataOutput.token.brightSight = 0;
    
    // Aura
    if (formattedInput.aura !== "") {
        // CURRENTLY THERE IS NO SEPARATE FIELD IN THE SHEET FOR AURAS, SO CREATE AN ITEM
        setAuraItem();
    }
    
}

function setAuraItem () {
        
    let auraInput = formattedInput.aura.split(/([^,]+\([^)]*\))/g);
            
    auraInput.forEach ( function (aura) {
                
        if (aura !== "" && aura !== ",") {
        
            let auraName = "";
            let auraRange = 0;
            let auraDC = "";

            // Name = Everything before the opening parenthesis
            auraName = aura.match(/([^,]+\([^()]*\)|[^,]+)/)[1].replace(/^ | $/g, "");
            // Range = Numbers before ".ft"
            if (aura.search(/([^(,;]+)(?:ft.)/i) !== -1) {
                auraRange = aura.match(/([^(,;]+)(?:ft.)/)[1].replace(/^ | $/g, "");
            }
            // DC = Number after "DC"
            if (aura.search(/\bDC\b/) !== -1) {
                auraDC = aura.match(/(?:DC\s*)([^)(,;]+)/)[1].replace(/^ | $/g, "");
            }

            let newSpecialAbility = JSON.parse(JSON.stringify(templateSpecialAbilityItem));

            newSpecialAbility.name = "Aura: " + capitalize(auraName);
            newSpecialAbility.data.activation.type = "passive";
            newSpecialAbility.data.duration.units = "perm";
            newSpecialAbility.data.save.dc = auraDC;
            newSpecialAbility.data.range.value = auraRange;
            newSpecialAbility.data.range.units = "ft";
            newSpecialAbility.data.measureTemplate.type = "circle";
            newSpecialAbility.data.measureTemplate.size = auraRange;

            dataOutput.items.push(newSpecialAbility);
        }
        
        
        
    })
    
    
    
    
                    
    
}

// Map data.classes.class
function setClassData (classInput) {

    let classKey = Object.keys(classInput);

    let classEntries = {};
    
    for (var i=0; i < classKey.length; i++) {
        
        // Split Classes
        // DEEP COPY
        let classEntry = JSON.parse(JSON.stringify(enumClassData[classKey[i].toLowerCase().replace(/npc/,"Npc")]));
                
        let tempClassName = classKey[i];
        
        delete Object.assign(classEntry, {[tempClassName] : classEntry.classOrRacialHD }).classOrRacialHD;
        classEntry.level = classInput[tempClassName].level;
        
        // Check if the Class has a suffix
        if (classInput[tempClassName].nameSuffix !== "") {
            classEntry.name = classInput[tempClassName].name + " " + classInput[tempClassName].nameSuffix; 
        } else {
            classEntry.name = classInput[tempClassName].name;
        }

        classEntries[tempClassName] = classEntry;
    }
    
    // Add classEntries to dataOutput.data.classes
    dataOutput.data.classes = classEntries;
    
}

// Create Class
function setClassItem (classInput) {
    
    let classKey = Object.keys(classInput);
    
    for (var i=0; i < classKey.length; i++) {
        // Create Item for the Class starting from the template
        // DEEP COPY
        let itemEntry = JSON.parse(JSON.stringify(templateClassItem[classKey[i].toLowerCase().replace(/npc/,"Npc")]));
        
        let tempClassName = classKey[i];
        // Check if the Class has a suffix
        if (classInput[tempClassName].nameSuffix !== "") {
            itemEntry.name = classInput[tempClassName].name + " " + classInput[tempClassName].nameSuffix; 
        }

        itemEntry.data.level = classInput[classKey[i]].level;
                
        itemEntry.data.hp = +formattedInput.hp.class[i];
        
        // "low"-progression: floor(@level / 3)
        // "high"-progression: 2 + floor(@level / 2)
        let saveKey = Object.keys(itemEntry.data.savingThrows);

        for (var j=0; j < saveKey.length; j++) {
            if (itemEntry.data.savingThrows[saveKey[j]].value == "low") {
                formattedInput[saveKey[j]+"_save"].class[i] = Math.floor(itemEntry.data.level / 3);            
            } else if (itemEntry.data.savingThrows[saveKey[j]].value == "high") {
                formattedInput[saveKey[j]+"_save"].class[i] = 2 + Math.floor(itemEntry.data.level / 2);
            } else {
                formattedInput[saveKey[j]+"_save"].class[i] = 0;
            }
        }
        
        dataOutput.items.push(itemEntry);
    };
}

// Create Race Item
async function setRaceItem (raceInput) {
    
    let itemEntry;
    let raceChanges;
    
    // If it's a playable race
    if (dataInputHasNonPlayableRace == true) {
        // DEEP COPY
        itemEntry = JSON.parse(JSON.stringify(templateRaceItem["default"]));
        itemEntry.name = raceInput;
        raceChanges = itemEntry.data.changes;
    } else if (dataInputHasPlayableRace == true) {
        // DEEP COPY
        //itemEntry = JSON.parse(JSON.stringify(templateRaceItem[raceInput.toLowerCase()]));
        itemEntry = await getItemFromCompendium("pf1.races", raceInput);
        raceChanges = itemEntry.data.data.changes;
        
    } else {
        if(DEBUG==true) { console.log("sbc-pf1 | Something went wrong parsing the race") };
    }
    
        
    
    for (let i=0; i<raceChanges.length; i++) {
        
        let item = raceChanges[i];
        
        // Set Changes for Abilities
        if (item.target == "ability") {
            formattedInput[item.subTarget].race = +item.formula;
        } else if (item.target == "skill") {
            // Else check if its a change to skills
            let skillShort = item.subTarget.replace(/skill./,"");
            
            for (var key in enumSkills) {
                if (enumSkills[key] === skillShort) {
                    if (key === "knowledge") {
                        formattedInput.skills.knowledge[key].race = item.formula;
                    } else {
                        formattedInput.skills[key].race = item.formula;
                    }
                }
            }  
        } else if (item.target == "ac") {
            // Else if change to ac (e.g. Adaro)
            formattedInput.ac_race_bonus = item.formula;
        }
    }
    
    
    dataOutput.items.push(itemEntry);
}

// Create Item for RacialHD
function setRacialHDItem () {
    
    // Create Item for the Class starting from the template
    // DEEP COPY
    let itemEntry = JSON.parse(JSON.stringify(templateRacialHDItem[formattedInput.creature_type.toLowerCase()]));
    
    itemEntry.data.level = +formattedInput.hit_dice.hd.racial;
    itemEntry.data.hp = +formattedInput.hp.racial;

    // Update the name to include Subtypes
    if (formattedInput.creature_subtype !== "") {
        itemEntry.name = formattedInput.creature_type + " (" + formattedInput.creature_subtype + ")";
    }

    // Set Saves
    // "low"-progression: floor(@level / 3)
    // "high"-progression: 2 + floor(@level / 2)
    let saveKey = Object.keys(itemEntry.data.savingThrows);

    for (var i=0; i < saveKey.length; i++) {
        if (itemEntry.data.savingThrows[saveKey[i]].value == "low") {
            formattedInput[saveKey[i]+"_save"].racial = Math.floor(itemEntry.data.level / 3);            
        } else if (itemEntry.data.savingThrows[saveKey[i]].value == "high") {
            formattedInput[saveKey[i]+"_save"].racial = 2 + Math.floor(itemEntry.data.level / 2);
        } else {
            formattedInput[saveKey[i]+"_save"].racial = 0;
        }
    }

    dataOutput.items.push(itemEntry);
    
}

// Create Custom Item for Conversion Buff Item
function setConversionItem () {

    // Create Item for the Class starting from the template
    // DEEP COPY
    let itemEntry = JSON.parse(JSON.stringify(templateConversionItem));
    
    // Add Changes to HP if needed
    // For that calculate the HP-Total from Classes, RacialHD and Con-Mod*Level
    // and compare that to the hp.total from the inputf
    let calculatedHPTotal = 0;
    
    // Calculate the TotalClassHP
    let totalClassHP = 0;
    let classKey = Object.keys(formattedInput.hp.class);
    for (let i = 0; i < classKey.length; i++) {
        totalClassHP += +formattedInput.hp.class[classKey[i]];
    }
        
    if (formattedInput.con.total === "-" && formattedInput.creature_type === "undead") {
        // calculating hp total for undead with no con (so with cha instead)
        calculatedHPTotal = +formattedInput.hp.racial + +totalClassHP + (+formattedInput.hit_dice.hd.total * +getModifier(formattedInput.cha.total));
    } else if (formattedInput.con.total === "-") {
        // calculating hp total for con = -
        calculatedHPTotal = +formattedInput.hp.racial + +totalClassHP + (+formattedInput.hit_dice.hd.total * +getModifier(10));
    } else {
        calculatedHPTotal = +formattedInput.hp.racial + +totalClassHP + (+formattedInput.hit_dice.hd.total * +getModifier(formattedInput.con.total));
    }
        
    if (+calculatedHPTotal !== +formattedInput.hp.total) {

        let tempHPDifference = +formattedInput.hp.total - +calculatedHPTotal;
        
        let hpChange = {
            "formula": tempHPDifference.toString(),
            "operator": "+",
            "target": "misc",
            "subTarget": "mhp",
            "modifier": "untyped",
            "priority": 1
        };
                
        itemEntry.data.changes.push(hpChange);
    }
    
    // Add Changes to Init if needed
    let calculatedInitTotal = +getModifier(formattedInput.dex.total);
    if (calculatedInitTotal !== formattedInput.initiative) {
        let tempInitDifference = +formattedInput.initiative - +calculatedInitTotal;
        
        let initChange = {
            "formula": tempInitDifference.toString(),
            "operator": "+",
            "target": "misc",
            "subTarget": "init",
            "modifier": "untyped",
            "priority": 1
        };
        
        itemEntry.data.changes.push(initChange);
        
    }
    
    // Add Changes to speed if necessary
    let speedKeys = Object.keys(formattedInput.speed);
    
    for (let i = 0; i < speedKeys.length; i++) {
        let baseSpeed = +formattedInput.speed[speedKeys[i]].base;
        let totalSpeed = +formattedInput.speed[speedKeys[i]].total;
                
        if(baseSpeed !== totalSpeed) {
            let speedDifference  = totalSpeed - baseSpeed;
            
            let speedChange = {
                "formula": speedDifference.toString(),
                "operator": "+",
                "target": "speed",
                "subTarget": speedKeys[i] + "Speed",
                "modifier": "untyped",
                "priority": 1
            };
            
            itemEntry.data.changes.push(speedChange);
        };
    };
        
    
    

    // Add Changes to AC
    for (var key in formattedInput.ac_bonus_types) {
        // Exclude dex, size and natural, as these are included elsewhere in the sheet
        if ( (key.toLowerCase() !== "dex") && (key.toLowerCase() !== "size") && (key.toLowerCase() !== "natural") ) {
            
            let acChange = {
                "formula": "",
                "operator": "+",
                "target": "",
                "subTarget": "",
                "modifier": "",
                "priority": 1
            };
            
            // Special Treatment for Armor and Shield Boni
            if ( ( key.toLowerCase() == "armor" ) || ( key.toLowerCase() == "shield" ) ) {
                acChange.formula = formattedInput.ac_bonus_types[key].toString();
                acChange.target = "ac";
                if ( key == "armor") {
                    acChange.subTarget = "aac";
                } else {
                    acChange.subTarget = "sac";
                }
                acChange.modifier = "untyped";
            } else {
                acChange.formula = formattedInput.ac_bonus_types[key].toString();
                acChange.target = "ac";
                acChange.subTarget = "ac";
                acChange.modifier = key;
            }

            itemEntry.data.changes.push(acChange);  
        }
    }
    
    // Add SavingThrow Values in Changes, decreased by the corresponding attribute modifiers
    // and the values derived from the saving throw progression of racialHD and class
    // "low"-progression: floor(@level / 3)
    // "high"-progression: 2 + floor(@level / 2)
    for (let i=0; i<enumSaves.length; i++) {
        
        let item = enumSaves[i];
        
        let saveChange = {
            "formula": "",
            "operator": "+",
            "target": "",
            "subTarget": "",
            "modifier": "",
            "priority": 1
        };
        
        let tempSaveString = item + "_save";
        
        // Calculate the total to saves from classes
        let classSaveTotal = 0;
        for (let i = 0; i < +formattedInput[tempSaveString].class.length; i++) {
            classSaveTotal += +formattedInput[tempSaveString].class[i];
        }
                
        let tempSaveChange = 0;
        let attrModifier = 0;
        if (formattedInput.creature_type === "undead" && item === "fort" && formattedInput.con.total === "-") {
            attrModifier = +getModifier(formattedInput.cha.total);
        }
        else if (item === "fort" && formattedInput.con.total === "-") {
            attrModifier = -5;
        } else {
            attrModifier = +getModifier(formattedInput[enumSaveModifier[i]].total);
            
        }
        
        tempSaveChange = +formattedInput[tempSaveString].total - +formattedInput[tempSaveString].racial - +classSaveTotal - +attrModifier;
        
        saveChange.formula = tempSaveChange.toString();
        saveChange.target = "savingThrows";
        saveChange.subTarget = item;
        saveChange.modifier = "untyped";

        itemEntry.data.changes.push(saveChange);
    }
       
    //itemEntry.data.active = false;
    
    dataOutput.items.push(itemEntry);
}

// Create Items for Feats
function setFeatItem (featInput) {
    
    // DEEP COPY
    let itemEntry = JSON.parse(JSON.stringify(templateFeatItem));
    
    // For now, just set the name of the Feat
    itemEntry.name = featInput;
    
    dataOutput.items.push(itemEntry);
}

// Map defensive Data
function mapDefenseData () {

    // Attributes
    dataOutput.data.attributes.hp.value = +formattedInput.hp.total;
    dataOutput.data.attributes.hp.max = +formattedInput.hp.total;
    
    dataOutput.data.attributes.ac.normal.total = +formattedInput.ac;
    dataOutput.data.attributes.ac.touch.total = +formattedInput.touch;
    dataOutput.data.attributes.ac.flatFooted.total = +formattedInput.flat_footed;
    dataOutput.data.attributes.naturalAC = +formattedInput.ac_bonus_types.natural - +formattedInput.ac_race_bonus;
    dataOutput.data.attributes.acNotes = formattedInput.acNotes;
    
    dataOutput.data.attributes.savingThrows.fort.total = +formattedInput.fort_save.total;
    dataOutput.data.attributes.savingThrows.ref.total = +formattedInput.ref_save.total;
    dataOutput.data.attributes.savingThrows.will.total = +formattedInput.will_save.total;
    dataOutput.data.attributes.saveNotes = formattedInput.save_notes;
    
    // SR
    dataOutput.data.attributes.sr.total = +formattedInput.spell_resistance.total;
    dataOutput.data.attributes.sr.formula = formattedInput.spell_resistance.total;
    dataOutput.data.attributes.srNotes = formattedInput.spell_resistance.context
    // !!! SR Formula
    
    // DR
    if (formattedInput.damage_reduction.dr_value) {
        dataOutput.data.traits.dr = +formattedInput.damage_reduction.dr_value + "/" + formattedInput.damage_reduction.dr_type;
    }
    
    // Regeneration & Fast Healing
    dataOutput.data.traits.regen = formattedInput.regeneration;
    dataOutput.data.traits.fastHealing = formattedInput.fast_healing;
    
    // Defensive Abilities
    // The list is found in the Notes-Section, long-forms should be in the special abilities section
    if (formattedInput.defensive_abilities !== "") {
        
        for (let i=0; i<formattedInput.defensive_abilities.length; i++) {
        
            // SET THE FEATTYPE
            let featType = "misc";

            setSpecialAbilityItem(formattedInput.defensive_abilities[i], featType, "Defensive Ability");

        };
    }
    
    // Immunities    
    // Set Condition Immunities
    let tempImmunities = formattedInput.immunities;
    tempImmunities = tempImmunities.replace(/Electricity/gi, "electric");
    
    let tempResistances = formattedInput.resistances;
    tempResistances = tempResistances.replace(/Electricity/gi, "electric");
    
    let tempWeaknesses = formattedInput.weaknesses;
    tempWeaknesses = tempWeaknesses.replace(/Electricity/gi, "electric");
    
    for (let i=0; i<enumConditions.length; i++) {
        let item = enumConditions[i];
        if (tempImmunities.search(item) !== -1) {
            dataOutput.data.traits.ci.value.push(item);
            tempImmunities = tempImmunities.replace(item, "");
        }
    };
    
    // Loop through the damageTypes
    for (let i=0; i<enumDamageTypes.length; i++) {
        // Set Damage Immunities
        let item = enumDamageTypes[i];
        if (tempImmunities.search(item) !== -1) {
            dataOutput.data.traits.di.value.push(item);
            tempImmunities = tempImmunities.replace(item, "");
        };
        
        // Resistances  
        let tempResistanceRegEx = new RegExp("(\\b" + item + "\\b \\d+)", "ig");
        
        if (tempResistances.search(tempResistanceRegEx) !== -1) {
            let tempResistance = tempResistances.match(tempResistanceRegEx);
            dataOutput.data.traits.eres += tempResistance + ", ";
        };
        dataOutput.data.traits.eres = dataOutput.data.traits.eres.replace(/, $/,"");
        
        // Set DamageType Vulnerabilities
        
        
        if (tempWeaknesses.search(item) !== -1) {
            dataOutput.data.traits.dv.value.push(item);
            tempWeaknesses = tempWeaknesses.replace(item, "");
        };
    };
    
    // If there is anything left in tempImmunities, treat it as a custom immunity
    if (tempImmunities.search(/(\w+)/gi) !== -1) {
        //ability damage, ability drain, charm effects, compulsion effects, , death effects, , energy drain, petrification, and ;        
        // Remove empty fields
        tempImmunities = tempImmunities.replace(/^(, )+|(, )+$|(, )+;/g, "");
        tempImmunities = tempImmunities.replace(/(, )+/g, ",");
        tempImmunities = tempImmunities.replace(/\band\b/g, "");
        tempImmunities = tempImmunities.replace(/;$/g, "");
        tempImmunities = tempImmunities.replace(/, $/g, "");
        
        // No way to find out if its damage or a condition, so set it just to condition
        dataOutput.data.traits.ci.custom = tempImmunities;
    }
    
    // If there is anything left in tempWeaknesses, treat it as a custom weakness
    if (tempWeaknesses.search(/(\w+)/gi) !== -1) {
        
        let tempCustomWeakness = tempWeaknesses.replace(/(, )+|, /g, ",")
        tempCustomWeakness = tempCustomWeakness.replace(/\band\b/g, "")
        tempCustomWeakness = tempCustomWeakness.replace(/;$/g, "")
        tempCustomWeakness = tempCustomWeakness.replace(/, $/g, "");
        
        dataOutput.data.traits.dv.custom = tempCustomWeakness;
    }    
    
    // Reset Max Dex Bonus for now
    dataOutput.data.attributes.maxDexBonus = 0;
}

// Map Offense Data
async function mapOffenseData () {
    
    // Speed(s)
    let speedKeys = Object.keys(formattedInput.speed);
    
    for (let i = 0; i < speedKeys.length; i++) {
        dataOutput.data.attributes.speed[speedKeys[i]].base = +formattedInput.speed[speedKeys[i]].base;
        dataOutput.data.attributes.speed[speedKeys[i]].total = +formattedInput.speed[speedKeys[i]].total;
        if (speedKeys[i] === "fly") {
            dataOutput.data.attributes.speed.fly.maneuverability = formattedInput.speed.fly.maneuverability.toLowerCase();
        }
    }

    // Melee Attack Groups
    if (formattedInput.meleeAttacks !== "") {
        let meleeAttackGroups = formattedInput.meleeAttacks.split(/\bor\b/g);
        setAttackItem(meleeAttackGroups, "mwak");
    }
    
    // Ranged Attack Groups
    if (formattedInput.rangedAttacks !== "") {
        let rangedAttackGroups = formattedInput.rangedAttacks.split(/\bor\b/g);    
        setAttackItem(rangedAttackGroups, "rwak");
    }
    
    // Special Attack Groups
    if (formattedInput.specialAttacks !== "") {
        setSpecialAttackItem(formattedInput.specialAttacks);
    }
       
}

// Map Special Qualities
async function mapSpecialQualitiesData () {

    let tempSQ = formattedInput.special_qualities;
    
    for(let i=0; i<tempSQ.length; i++) {
        let item = tempSQ[i];
        
        let sq = item.replace(/^ | $/g, "");
        
        let featType = "misc";
            
        // CHECK, IF ITS A CLASS FEATURE
        let classFeatureRegEx = new RegExp ( enumClassFeatures.join("\\b|\\b"), "gi");
        if (sq.search(classFeatureRegEx) !== -1) {
            featType = "class";
        }
        
        setSpecialAbilityItem(sq, featType, "SQ");
    }
    
    
}

// Map Special Ability Data
function mapSpecialAbilitiesData () {
    
    for (let i=0; i<formattedInput.special_abilities.length; i++) {
        // SET THE FEATTYPE
        let featType = "misc";
        let specialAbility = formattedInput.special_abilities[i];
        
        setSpecialAbilityItem(specialAbility, featType, "Special Ability");
    }
}

// Set Attack Items
async function setAttackItem (attackGroups, attackType) {
        
    let attackGroupKeys = Object.keys(attackGroups);
    
    for (var i = 0; i < attackGroupKeys.length; i++) {
        
        // Attacks
        let attacks = attackGroups[i];
                
        // Clean-up the input for cases where "," and "and" follow each other
        attacks = attacks.replace(/, \band\b /, " and ");
        // Clean-up the input to replace "and" with a ","
        attacks = attacks.replace(/\band\b (?![^(]*\)|\()/g,",");
        // Split the attacks into single attacks
        attacks = attacks.split(/,/g);
        let attackKeys = Object.keys(attacks);
        
        // Loop over all attacks in the attackGroup
        for (let j = 0; j < attackKeys.length; j++) {

            // DIFFERENT ATTACK FORMATS
            // 2 Slams +10 (1d8+18)                                 Multiple attacks
            // +3 Longsword +15 (1d8+12)                            Magic Enhancement
            // scimitar +0 (1d6/18-20)                              Mundane Weapon and Crit-Range
            // mwk quarterstaff +0 (1d6–1)                          masterwork Weapon
            // bite +24 (3d8+14/19–20 plus poison)                  Natural Attacks - Primary, plus Secondary Effect Poison
            // tail +19 (3d6+7 plus grab)                           Natural Attacks - Secondary
            // swarm (2d6 plus distraction and infestation)         Swarm Attacks
            // electrical jolt +8 ranged touch (4d6 electricity)
            
            // mwk greatsword +16/+11 (3d6+14/19–20)                Iterative Attacks

            let attack = attacks[j].replace(/^ | $/, "");
 
            let numberOfAttacks = 1;
            let enhancementBonus = 0;
            let attackName = "";
            let attackModifier = 0;
            let inputAttackModifier = 0;
            let numberOfDamageDice = 0;
            let damageDie = 0;
            let damageBonus = 0;
            let damageModifier = 0;
            let damageType = "";
            let weaponSpecial = "-";
            let critRange = 20;
            let critMult = 2;
            let attackEffects = "";
            let mwkWeapon = false;
            let numberOfIterativeAttacks = 0;
            let attackNotes = "";
            
            // Search for Touch or Ranged Touch
            if (attack.search(/(\d+\s*)(ranged\s*touch|touch)(\s*\()/i) !== -1) {
                let attackType = attack.match(/(\d+\s*)(ranged\s*touch|touch)(\s*\()/i)[2];
                attackNotes += attackType + "\n";
                attack = attack.replace(/(\d+\s*)(ranged\s*touch|touch)(\s*\()/i, "$1 $3");
            }
                        
            // Check if its Melee or Ranged
            let attackAttrModifier = 0;
            if (attackType == "mwak") {
                // Add Reach to attackNotes
                attackNotes += "Reach: " + formattedInput.reach + "\n";
                if (formattedInput.str.total !== "-") {
                    attackAttrModifier = +getModifier(formattedInput.str.total);
                } else {
                    attackAttrModifier = 0;
                }
                
            } else if (attackType == "rwak") {
                if (formattedInput.dex.total !== "-") {
                    attackAttrModifier = +getModifier(formattedInput.dex.total);
                } else {
                    attackAttrModifier = 0;
                }
            }
            
            // Check, if Str is "-" and set the attackAttrModifier to -5 if it is
            if (attackType == "mwak" && formattedInput.str.total === "-") {
                // -5 so that the negative modificator from strength gets negated in the final calculation of the attackModifier
                attackAttrModifier = -5;
            }
                        
            // numberOfAttacks
            if (attack.match(/(^\d+)/) !== null) {
                numberOfAttacks = attack.match(/(^\d+)/)[1];
                attackNotes += numberOfAttacks + " ";
            }
            // enhancementBonus
            if (attack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/) !== null) {
                enhancementBonus = attack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/)[1];
                attackNotes += "+" + enhancementBonus + " ";
            }
            // Masterwork
            if (attack.match(/\bmwk\b/i) !== null) {
                mwkWeapon = true;
                attackNotes += "mwk ";
            }
            // attackName
            if (attack.match(/(\b[a-zA-Z*]+)(?:[ +0-9(/]+\()/) !== null) {
                attackName = attack.match(/(\b[a-zA-Z *]+)(?:[ +0-9(/]+\()/)[1].replace(/^ | $/g, "").replace(/\bmwk\b /i, "").replace(/\*/, "");
                
                // Special ActionType for swarmAttacks
                if (attackName.search(/\bSwarm\b/i) !== -1) {
                    attackType = "other";
                }
                
                attackNotes += attackName + " ";
            }
            
            // attackModifier
            if (attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\()/) !== null) {
                inputAttackModifier = attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\()/)[1];
                attackNotes += inputAttackModifier;
                                
                // Subtract BAB, ATTR-MOD and SIZE-MOD    
                attackModifier = +inputAttackModifier - +formattedInput.bab - +enumSizeModifiers[formattedInput.size] - attackAttrModifier;
                
                // Subtract Boni for Enhancement or MWK
                if (enhancementBonus !== 0) {
                    attackModifier = (attackModifier - enhancementBonus);
                } else if (enhancementBonus === 0 && mwkWeapon === true) {
                    attackModifier = (attackModifier - 1);
                }
                
            }
                
            // numberOfIterativeAttacks
            if (attack.match(/(\/\+\d+)/) !== null) {
                numberOfIterativeAttacks = attack.match(/(\/\+\d+)/g).length;
                for (let i = numberOfIterativeAttacks; i>=1; i--) {
                    attackNotes += "/+" + (attackModifier-(attackModifier-(5*i)));
                }
            }
            
            // If Strength is "-" do special undead stuff, otherwise calculate damage as normal
            if (formattedInput.str.total !== "-") {
                
                /* ------------------------------------ */
                /* Normal Damage Calculation			*/
                /* ------------------------------------ */
                 
                // NumberOfDamageDice and DamageDie
                if (attack.match(/\d+d\d+/) !== null) {
                    numberOfDamageDice = attack.match(/(\d+)d(\d+)/)[1];
                    damageDie = attack.match(/(\d+)d(\d+)/)[2];
                    attackNotes += " (" + numberOfDamageDice + "d" + damageDie;
                }
                // damageBonus
                if (attack.match(/(?:d\d+)(\+\d+|\-\d+)/) !== null) {
                    damageBonus = attack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1] - +enhancementBonus;
                    let notesDamageBonus = attack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1];                
                    attackNotes += notesDamageBonus;
                }
                // critRange
                if (attack.match(/(?:\/)(\d+)(?:-\d+)/) !== null) {
                    critRange = attack.match(/(?:\/)(\d+)(?:-\d+)/)[1];
                    attackNotes += "/" + critRange + "-20";
                }
                // critMult
                if (attack.match(/(?:\/x)(\d+)/) !== null) {
                    critMult = attack.match(/(?:\/x)(\d+)/)[1];
                    attackNotes += "/x" + critMult;
                }
                // attackEffects
                if (attack.match(/(?:plus )(.+)(?:\))/) !== null) {
                    attackEffects = attack.match(/(?:plus )(.+)(?:\))/)[1];
                    attackEffects = attackEffects.replace(/(\s+\band\b\s+)/i, ", ");
                    attackNotes += " plus " + attackEffects;
                }
            } else {
                
                /* ------------------------------------ */
                /* Damage Calculation for Str = "-"		*/
                /* ------------------------------------ */
                
                
                if (attack.match(/\d+d\d+/) !== null) {
                    
                    // If the attack has damage dice
                    attackNotes += " (";
                    
                    let damagePool = attack.match(/(\d+d\d+[^0-9)]*)/g);
                    
                    for (let i=0; i<damagePool.length; i++) {
                        
                        let damageComponent = damagePool[i];
                        let tempItem = damageComponent.split(/ plus /);
                        
                        for (let j=0; j<tempItem.length; j++) {
                            
                            let damageSubComponent = tempItem[j];
                            
                            // If there are damageDice
                            if (damageSubComponent.match(/(\d+d\d+)/) !== null) {
                                let specialDamage = damageSubComponent.match(/(\d+d\d+)/)[0];
                                attackNotes += specialDamage + " ";
                                attackEffects += specialDamage + " ";
                                
                                if (damageSubComponent.match(/(?:\d+d\d+\s*)([^0-9)]*)/) !== null) {
                                    // If there are damageDice and a damageType
                                    let specialDamageType = damageSubComponent.match(/(?:\d+d\d+\s*)([^0-9)]*)/)[1];
                                    attackNotes += specialDamageType;
                                    attackEffects += specialDamageType;
                                };
                            } else {
                                // If there is just a specialEffect
                                let specialEffect = damageSubComponent;
                                attackNotes += specialEffect;
                                attackEffects += specialEffect;
                            };
                            
                            if (subIndex < tempItem.length-1) {
                                attackNotes += " plus ";
                                attackEffects += "\n";
                            };
                            
                        }
                        
                    }
                    
                } else {
                    // If there is just a specialEffect
                    let specialEffect = attack;
                    attackNotes += " (" + specialEffect + ")";
                    attackEffects += specialEffect;
                }
                
                // Add special damage to effectNotes
                
            }

            attackNotes += ")";
            
            // Create an attack-item for each attack in this group
            
            // CHECK IF ITS NAME IS FOUND IN templateNaturalAttackItem
            // IF YES, CREATE A NATURAL ATTACK INSTEAD
            let tempAttackItem = JSON.parse(JSON.stringify(templateMeleeAttackItem));
            
            let naturalAttackKeys = Object.keys(templateNaturalAttackItem);
                
            for (let i=0; i<naturalAttackKeys.length; i++) {
                let tempAttackName = attackName.toLowerCase();
                if (numberOfAttacks > 1) {
                    tempAttackName = tempAttackName.replace(/s$/,"");
                }
                if (tempAttackName !== /\s+/g && tempAttackName !== "") {
                    
                    if (naturalAttackKeys[i].search(tempAttackName) !== -1) {
                        let searchString = "//" + tempAttackName + "//i";

                        tempAttackItem = JSON.parse(JSON.stringify(templateNaturalAttackItem[naturalAttackKeys[i]]));
                    }
                    
                }
            }
            
            // Check, if its a primary attack (only relevant for natural attacks)
            let secondaryAttackModifier = 0;
            if (tempAttackItem.data.primaryAttack === false) {
   
                // Calculate if there is a difference between the calculatedAttackModifier and the one noted in the input statblock
                let calculatedAttackModifier = +formattedInput.bab + +enumSizeModifiers[formattedInput.size] + +attackAttrModifier - 5;
                
                
                
                if (calculatedAttackModifier !== inputAttackModifier) {
                    secondaryAttackModifier = +inputAttackModifier - +calculatedAttackModifier;
                }
                
            }
            
            // Set the attackBonus: Modifier - secondaryAttackModifier 
            tempAttackItem.data.attackBonus = (+attackModifier + +secondaryAttackModifier).toString();
            
            // Set the attackName
            if (enhancementBonus !== 0) {
                tempAttackItem.name = "+" + enhancementBonus + " " + attackName;
            } else {
                tempAttackItem.name = attackName;
            };
            
            
            // Set Masterwork Status
            if (mwkWeapon !== false) {
                tempAttackItem.data.masterwork = true;
            }
            
            // Set Enhancement Bonus
            if (enhancementBonus !== 0) {
                tempAttackItem.data.enh = enhancementBonus;
                tempAttackItem.data.masterwork = true;
            }
            
            // Push extra attacks from numberOfAttacks
            for (let i=1; i<numberOfAttacks; i++) {
                tempAttackItem.data.attackParts.push(
                    [
                        "0",
                        "Additional Attack: " + i
                    ]
                )
            }
            
            // Push extra attacks from numberOfIterativeAttacks
            for (let i=1; i<=numberOfIterativeAttacks; i++) {
                tempAttackItem.data.attackParts.push(
                    [
                        +(i*-5),
                        "Iterative Attack with " + (i*-5)
                    ]
                )
            }
            
            // Push Damage Parts & Calculate the difference between input and calculatedDamageBonus
            let strDamageBonus = getModifier(formattedInput.str.total);
            let calculatedDamageBonus = +strDamageBonus + +enhancementBonus;
            damageModifier = +damageBonus - +calculatedDamageBonus;
            
            // Try to find the damageType by checking if the attackName can be found in enumAttackDamageTypes
            let tempAttackDamageTypeKeys = Object.keys(enumAttackDamageTypes);
            if (attackName !== "") {
                let damageTypeRegex = new RegExp("(^\\b" + attackName.replace(/\bmwk\b /i,"") + "\\b$)", "ig");
            
                for (let i=0; i < tempAttackDamageTypeKeys.length; i++) {
                    if (tempAttackDamageTypeKeys[i].search(damageTypeRegex) !== -1) {
                        damageType = enumAttackDamageTypes[tempAttackDamageTypeKeys[i]].type;
                        weaponSpecial = enumAttackDamageTypes[tempAttackDamageTypeKeys[i]].special;
                        
                        // If the weapon has special properties, add that to the attackNotes
                        if (weaponSpecial !== "-") {
                            attackNotes += "\nWeapon Qualities: [" + weaponSpecial + "]";
                        }
                    }
                }
            }

            // If it's a normal attack, push Damage as normal
            if (formattedInput.str.total !== "-") {
                tempAttackItem.data.damage.parts.push(
                    [
                        "sizeRoll(" + numberOfDamageDice + ", " + damageDie + ", 0, @critMult) + " + damageModifier,
                        damageType
                    ]
                )
            }
            

            // Push critRange and critMult
            tempAttackItem.data.ability.critRange = critRange;
            tempAttackItem.data.ability.critMult = critMult;
            
            // Push attackNotes and effectNotes
            tempAttackItem.data.attackNotes = attackNotes;
            tempAttackItem.data.effectNotes = makeValueRollable(attackEffects);
            
            // Set the Attack Type (Melee, Ranged, etc.)
            tempAttackItem.data.actionType = attackType;
            
            if (attackType == "mwak") {
                tempAttackItem.data.ability.attack = "str";
            } else if (attackType == "rwak") {
                tempAttackItem.data.ability.attack = "dex"
            }
            
            await dataOutput.items.push(tempAttackItem);

        } // End of Melee Attack
    } // End of Melee Attack Group
    
}

// Set Special Attack Item
async function setSpecialAttackItem (specialAttacks) {
        
    // Separate into separate specialAttacks without destroying parenthesis
    
    let splitSpecialAttacks = [];
    
    if (specialAttacks.match(/([^,]+\([^(]*?\))+?/gi) !== null) {
        // Get specialAttacks with parenthesis, e.g.
        let specialAttacksWithParenthesis = specialAttacks.match(/([^,]+\([^(]*?\))+?/gi);
        
        for (let i=0; i<specialAttacksWithParenthesis.length; i++) {
            let splitSpecialAttack = specialAttacksWithParenthesis[i].replace(/^[;, ]*|[;, ]*$/g, "");
            splitSpecialAttacks.push(splitSpecialAttack);
        }
        
    } else {
        // Get specialAttacks without parenthesis    
        let specialAttacksWithoutParenthesis = specialAttacks.match(/(?:^|\)\s*,\s*)([^()]*)(?:,|$)/gi).toString().replace(/\(|\)/g, "").replace(/(,\s*,*\s*)+/g, ",").replace(/,$/, "").split(/,/);

        for (let i=0; i<specialAttacksWithoutParenthesis.length; i++) {
            let splitSpecialAttack = specialAttacksWithoutParenthesis[i].replace(/^[;, ]*|[;, ]*$/g, "");
            splitSpecialAttacks.push(splitSpecialAttack);
        }
        
    };
        
    // Loop through the cleaned array of special attacks and create special attacks or special abilities
    
    for (let i=0; i<splitSpecialAttacks.length; i++) {
        let specialAttack = splitSpecialAttacks[i];
                
        // Possible Values:
        // <name> (X/day, XdY+Z, DC XX, Range ft.)
        // rake (2 claws +6, 1d3+3)
        // rend (2 claws, 1d3+3)
        // sneak attack +3d6
        // breath weapon (10-ft. cone, once every 2d4 rounds, 2d6 fire damage, Reflex DC 14 for half)
        
        let newSpecialAttack = JSON.parse(JSON.stringify(templateMeleeAttackItem));
        
        let name = "";
        let limitedUses = 0;
        let limitedUsesDenominator = "";
        let numberOfAttacks = 1;
        let subAttackName = "";
        let attackModifier = 0;
        let damage = 0;
        let damageType = "";

        let dc = 0;
        let save = "Reflex";
        let saveContext = "";
        let range = 0;
        let measureTemplateType = "";
        let actionType = "";
                
        name = specialAttack.match(/^([^(]*)|$/g)[0].replace(/^ | $/g, "");
        
        // Set Action Type
        let specialAttacksRegEx = new RegExp(enumSpecialAttacks.join("\\b|\\b"), "i");
        if (name.search(/\bChannel\b/i) !== -1) {
            actionType = "heal";
        } else if (name.search(specialAttacksRegEx) !== -1) {
            actionType = "mwak";
        } else {
            actionType = "other";
        }
        
        newSpecialAttack.data.actionType = actionType;
        
        // Search for Limited Uses
        if (specialAttack.search(/(\d+\/\b\w+\b)/) !== -1) {
            limitedUses = specialAttack.match(/(\d+)(?:\/)/)[1];
            limitedUsesDenominator = specialAttack.match(/(?:\d+\/)(\b\w+\b)/)[1];
            
            newSpecialAttack.data.uses.value = limitedUses;
            newSpecialAttack.data.uses.max = limitedUses;
            newSpecialAttack.data.uses.per = limitedUsesDenominator;
            newSpecialAttack.data.uses.autoDeductCharges = true;
        }
        
        // Search for Number of Damages, e.g. 2 Claws
        if (specialAttack.search(/(?:\()(\d+)([a-zA-Z ]*)(\+*\d*)(?:\s*,*\s*\d+d\d+\+*\d*\s*)/) !== -1) {
            
            let attackIterationsAndModifier = specialAttack.match(/(?:\()(\d+)([a-zA-Z ]*)(\+*\d*)(?:\s*,*\s*\d+d\d+\+*\d*\s*)/);
            
            numberOfAttacks = attackIterationsAndModifier[1].replace(/^ | $/g, "");
            subAttackName = attackIterationsAndModifier[2].replace(/^ | $/g, "");
            
            let subAttack = " (" + numberOfAttacks + " " + subAttackName + ")";
            
            name += subAttack;
            
            if (attackIterationsAndModifier[3] !== null) {
                attackModifier = attackIterationsAndModifier[3].replace(/^ | $/g, "");
            }
            
        }
        
        // Search for Damage
        if (specialAttack.search(/(\d+d\d+\+*\d*)/) !== -1) {
            damage = specialAttack.match(/(\d+d\d+\+*\d*)(?!\s*rounds)/i)[1];
            if (specialAttack.search(/(\d+d\d+\+*\d*)(?!\s*rounds)([^,]*)/)[2] !== -1) {
                damageType = specialAttack.match(/(\d+d\d+\+*\d*)(?!\s*rounds)([^,;)]*)/)[2];
            }
        }
        
        // Create Damage Parts
        newSpecialAttack.labels.damage = damage;
        newSpecialAttack.labels.damageTypes = damageType;
        newSpecialAttack.data.damage.parts.push(
            [
                damage,
                damageType
            ]
        );

        // Create Attack Parts
        let secondaryAttackModifier = 0;
        let calculatedAttackModifier = +formattedInput.bab + +enumSizeModifiers[formattedInput.size] + +getModifier(formattedInput.str.total);

        if (calculatedAttackModifier !== attackModifier) {
            secondaryAttackModifier = +attackModifier - +calculatedAttackModifier;
        }
        
        newSpecialAttack.data.attackBonus = secondaryAttackModifier.toString();
        for (let i=1; i < numberOfAttacks; i++) {
            newSpecialAttack.data.attackParts.push(
                [
                    "0",
                    "Attack"
                ]
            );
        }
        
        // Search for DC
        if (specialAttack.search(/\bDC\b/) !== -1) {
            dc = specialAttack.match(/(?:\bDC\b\s*)(\d+)/)[1];
            if (specialAttack.search(/(\b\w+\b)(?:\s*\bDC\b)/) !== -1) {
                save = specialAttack.match(/(\b\w+\b)(?:\s*\bDC\b)/)[1];
            }
            if (specialAttack.search(/(?:\bDC\b\s*\d+\s*)([^,)]*)/) !== -1) {
                saveContext = specialAttack.match(/(?:\bDC\b\s*\d+\s*)([^,)]*)/)[1];
            }
            
            switch(save) {
                case "Reflex":
                case "reflex":
                case "ref":
                    newSpecialAttack.data.save.type = "ref";
                    break;
                case "Fortitude":
                case "fortitude":
                case "fort":
                    newSpecialAttack.data.save.type = "fort";
                    break;
                case "Will":
                case "will":
                    newSpecialAttack.data.save.type = "will";
                    break;
                default:
                    break;
            }
            
            newSpecialAttack.data.save.dc = dc.toString();
            newSpecialAttack.data.save.description = saveContext;
            
        }
        
        // Set Range and Measurement Template
        if (specialAttack.search(/\bft\./) !== -1) {
            range = specialAttack.match(/(\d+)(?:\s*-*\bft\.)/)[1];
            if (specialAttack.search(/(?:\d+\s*-*\bft\.\s*)(\b\w+\b)/) !== -1) {
                measureTemplateType = specialAttack.match(/(?:\d+\s*-*\bft\.\s*)(\b\w+\b)/)[1];
                
                switch (measureTemplateType) {
                    case "Cone":
                    case "cone":
                        newSpecialAttack.data.measureTemplate.type = "cone";
                        break;
                    default:
                        break;
                }
            }
            newSpecialAttack.data.range.value = range.toString();
            newSpecialAttack.data.range.units = "ft";
            newSpecialAttack.data.measureTemplate.size = +range;
        }
        
        // Set Name
        newSpecialAttack.name = "Special Attack: " + capitalize(name);
        
        dataOutput.items.push(newSpecialAttack);
        
    };
    
}

// Map Spellbooks
async function mapSpellbooks (actorID) {
    console.log("sbc | START MAPPING SPELLBOOKS");
    
    // Suppose we are working with a particular pack named "dnd5e.spells"
    const spellPack = game.packs.get("pf1.spells");
    // We can load the index of the pack which contains all entity IDs, names, and image icons
    const spellPackIndex = await spellPack.getIndex().then(index => {
        index = index.name;
    });
    
    /*
        formattedInput.spellcasting[spellBook]= {
            "type": spellGroupSubType,
            "CL": spellGroupCL,
            "concentration": spellGroupConcentration,
            "spontaneous": spontaneousCasting,
            "spells": {}
        };
    */
    
    /* ------------------------------------ */
    /* Loop through Spellbooks           	*/
    /* ------------------------------------ */
    
    let spellbookKeys = Object.keys(formattedInput.spellcasting);
    for (let i=0; i<spellbookKeys.length; i++) {
        console.log("sbc | START MAPPING - " + i + " - SPELLBOOK");
        
        let spellBook = spellbookKeys[i];
                
        dataOutput.data.attributes.spells.spellbooks[spellBook].class = formattedInput.spellcasting[spellBook].type;
                
        dataOutput.data.attributes.spells.spellbooks[spellBook].cl.base = +formattedInput.spellcasting[spellBook].CL;
        dataOutput.data.attributes.spells.spellbooks[spellBook].cl.value = +formattedInput.spellcasting[spellBook].CL;
        dataOutput.data.attributes.spells.spellbooks[spellBook].cl.total = +formattedInput.spellcasting[spellBook].CL;
        
        dataOutput.data.attributes.spells.spellbooks[spellBook].concentration = formattedInput.spellcasting[spellBook].concentration;
        dataOutput.data.attributes.spells.spellbooks[spellBook].spontaneous = formattedInput.spellcasting[spellBook].spontaneous;
        
        /* ------------------------------------ */
        /* Loop through Rows in the Spellbook  	*/
        /* ------------------------------------ */
        
        let spellRows = Object.keys(formattedInput.spellcasting[spellBook].spells);
        for (let j=0; j<spellRows.length; j++) {
            console.log("sbc | START MAPPING - " + j + " - SPELLROW");
            
            // Get the complete Row
            let tempSpellRow = formattedInput.spellcasting[spellBook].spells[spellRows[j]];
            
            /* ------------------------------------ */
            /* Variables at Spellbook Level     	*/
            /* ------------------------------------ */
            
            
            
            // Get Spell Level if available
            let spellLevel = 0;
            if (tempSpellRow.search(/(0|\d+(?=st|nd|rd|th))/) !== -1) {
                spellLevel = tempSpellRow.match(/(0|\d+(?=st|nd|rd|th))/)[0];
            }
            let spellLevelString = "spell" + spellLevel;
            
            // Get Uses
            let uses = {
                "value": 0,
                "max": 0,
                "per": ""
            };
            
            if (tempSpellRow.search(/(\d+)\/(\b\w+\b)(?=[^-]*\-)/) !== -1) {
                uses.value = tempSpellRow.match(/(\d+)\/(\b\w+\b)(?=[^-]*\-)/)[1];
                uses.max = tempSpellRow.match(/(\d+)\/(\b\w+\b)(?=[^-]*\-)/)[1];
                uses.per =tempSpellRow.match(/(\d+)\/(\b\w+\b)(?=[^-]*\-)/)[2];
            }
            
            dataOutput.data.attributes.spells.spellbooks[spellBook].spells[spellLevelString].value = +uses.value;
            dataOutput.data.attributes.spells.spellbooks[spellBook].spells[spellLevelString].max = +uses.max;
            dataOutput.data.attributes.spells.spellbooks[spellBook].spells[spellLevelString].base = uses.max;
            
            /* ------------------------------------ */
            /* Variables at Spell Level         	*/
            /* ------------------------------------ */
            
            // Set spellTemplate
            let spells = {
                "spellLevel": spellLevel,
                "uses": {
                    "value": uses.value,
                    "max": uses.max,
                    "per": uses.per
                },
                "preparation": {
                    "preparedAmount": 1,
                    "maxAmount": 1,
                    "spontaneousPrepared": true,
                },
                "atWill": false,
                "spellList": tempSpellRow.replace(/(.*\-)/, "").split(/,/),
            };
            
            // set atWill variable
            if (tempSpellRow.search(/at will/) !== -1) {
                spells.atWill = true;
            }
            
            // If Spontaneous            
            switch (formattedInput.spellcasting[spellBook].groupType) {
                    
                case "Spell-Like Abilities":
                case "spelllike":
                    console.log("Spell-Like Abilities");
                    
                    spells.preparation.preparedAmount = +uses.max;
                    spells.preparation.maxAmount = +uses.max;
                    
                    break;
                    
                case "Spells Prepared":
                    console.log("Spells Prepared");
                    // Variables at Spellbook Level
                    
                    // Variables at Spell Level
                    spells.preparation.preparedAmount = 1;
                    spells.preparation.maxAmount = 1;
                    break;
                    
                case "Spells Known":
                    console.log("Spells Known");
                    // Variables at Spellbook Level
                    
                    // Variables at Spell Level
                    spells.preparation.spontaneousPrepared = true;
                    break;
                    
                default:
                    ui.notifications.info("sbc | Error: Could not set the type of Spellcasting! Input was: " + formattedInput.spellcasting[spellBook].groupType)
                    break;
            }
            
            /* ------------------------------------ */
            /* Loop through the Spells in the Row 	*/
            /* ------------------------------------ */
            
            let spellArray = [];
            
            let spellKeys = Object.keys(spells.spellList);
            for (let k=0; k<spellKeys.length; k++) {
                console.log("sbc | START MAPPING - " + k + " - SPELL");
                let spell = spells.spellList[spellKeys[k]].replace(/^ | $/g, "");
                let spellDC = 0;
                let spellName = "";
                let domainSpell = "";
                
                // Search for DC
                if (spell.search(/(?:\bDC\b\s*)(\d+)/) !== -1) {
                    spellDC = spell.match(/(?:\bDC\b\s*)(\d+)/)[1];
                }
                
                // Check, if its a Domain Spell
                if (spell.search(/(D$)/) !== -1) {
                    domainSpell = "Domain Spell";
                }
                
                // Search for Name
                spellName = spell.match(/^([^(D\n]*)/)[0].replace(/^ | $/g, "");
                spellName = spellName.replace(/(ACG)$/,"");
                spellName = spellName.replace(/(APG)$/,"");
                spellName = spellName.replace(/(’)/,"'");
                
                let spellInput = {
                    "name": spellName,
                    "uses": {
                        "value": spells.spellUses,
                        "max": spells.spellUses,
                        "per": spells.spellUsesDenominator
                    },
                    "preparation": {
                      "preparedAmount": spells.preparation.preparedAmount,
                      "maxAmount": spells.preparation.maxAmount,
                      "spontaneousPrepared": true,
                    },
                    "atWill": spells.atWill,
                    "saveDC": spellDC,
                    "effectNotes": domainSpell,
                    "level": spells.spellLevel
                }

                console.log("sbc | FINISH MAPPING - " + k + " - SPELL");
                spellArray.push(spellInput);                
                
            };
            
            await setSpellsItem(spellArray, actorID, spellBook, spellPack, spellPackIndex);
            
            console.log("sbc | FINISH MAPPING - " + j + " - SPELLROW");
            
        };
        
        console.log("sbc | FINISH MAPPING - " + i + " - SPELLBOOK");
        
    };
    
    //await setSpellsItem(spellEntities, actorID, spellBook, spellPack, spellPackIndex);
    
    console.log("sbc | FINISH MAPPING SPELLBOOKS");

}


// Set Spell Item
// THIS IS A FOUNDRY ONLY FUNCTION AND WILL NOT WORK IN A STAND ALONE VERSION AS THE REST CURRENTLY WOULD

async function setSpellsItem (spellArray, actorID, spellBook, spellPack, spellPackIndex) {
    console.log("sbc | START SETTING SPELL");    
    
    const actor = await game.actors.get(actorID);

    // We can find a specific entry in the compendium by its name
    
    let spellOutputArray = [];
        
    for (let i=0; i<spellArray.length; i++) {
        let spellInput = spellArray[i];
        try{
                
            let entry =  spellPack.index.find(e => e.name.toLowerCase() === spellInput.name.toLowerCase());
            // Given the entity ID of "Acid Splash" we can load the full Entity from the compendium
            let spell = await spellPack.getEntity(entry._id)

            console.log(spell);
            spell.data.data.spellbook = spellBook;
            spell.data.data.level = spellInput.level;
            spell.data.data.uses.value = +spellInput.uses.value;
            spell.data.data.uses.max = +spellInput.uses.max;
            spell.data.data.uses.per = spellInput.uses.per;
            spell.data.data.preparation.preparedAmount = +spellInput.preparation.preparedAmount;
            spell.data.data.preparation.maxAmount = +spellInput.preparation.maxAmount;
            //spell.data.data.save.dc = spellInput.saveDC.toString();
            spell.data.data.effectNotes = spellInput.effectNotes;
            spell.data.data.atWill = spellInput.atWill;

            spellOutputArray.push(spell);
            dataOutput.items.push(spell.data);
            //actor.createEmbeddedEntity("OwnedItem", spell);

            console.log("sbc | FINISH SETTING SPELL");
        } catch (error) {
    
            console.log("sbc | Error: Spell '" + spellInput.name + "' could not be parsed!");
            ui.notifications.info("sbc | Error: Spell '" + spellInput.name + "' could not be parsed!")
        }
                
    };
        
    await actor.createEmbeddedEntity("OwnedItem", spellOutputArray);
    
}

// Set Special Ability Item
function setSpecialAbilityItem (specialAbility, featType, abilityType) {
            
    let existingItemFound = false;
    
    let specialAbilityName = "";
    let specialAbilityNameSuffix = "";
    let specialAbilityDescription = "";
    let specialAbilityType = "";
        
    if (specialAbility.search(/(?:[^\(]*\()(.*)(?:\))/) !== -1) {
        specialAbilityName = specialAbility.match(/([^\(]*)(?:\()/i)[1].replace(/^ | $/g, "");
        specialAbilityNameSuffix = " (" + specialAbility.match(/(?:[^\(]*\()(.*)(?:\))/)[1] + ")";
        specialAbilityDescription = specialAbility.match(/(?:\))([\s\S]*)/i)[1];
    } else {
        specialAbilityName = specialAbility.replace(/^ | $/g, "");
    }

    if (specialAbility.search(/(?:[^\(]*\()(Su|Sp|Ex)(?:\))/i) !== -1) {
        specialAbilityType = specialAbility.match(/(?:[^\(]*\()(Su|Sp|Ex)(?:\))/i)[1];
    }
    
    // Set featType
    let tempFeatType = "";
    let tempFeatTypeShort = "";
    
    switch(featType) {
        case "misc":
            tempFeatType = "Miscellaneous";
            tempFeatTypeShort = "misc";
            break;
        case "racial":
            tempFeatType = "Racial Trait";
            tempFeatTypeShort = "racial";
            break;
        case "trait":
            tempFeatType = "Trait";
            tempFeatTypeShort = "trait";
            break;
        case "class":
            tempFeatType = "Class Feature";
            tempFeatTypeShort = "classFeat";
            break;
        case "misc":
        default:
            tempFeatType = "Miscellaneous";
            tempFeatTypeShort = "misc";
            break;
    }
        
    // Check if there already is an item with the same name
    let itemKeys = Object.keys(dataOutput.items);
    
    let tempAbilityName = specialAbilityName.replace(/[/]/g, "\/");
            
    for (let i=0; i<itemKeys.length; i++) {
        let itemKey = itemKeys[i];
        
        //let searchString = new RegExp (specialAbilityName + specialAbilityNameSuffix.replace(/\+/g, "\\+"), "i");
        
        let searchString = new RegExp (tempAbilityName, "i");
                
        if (dataOutput.items[itemKey].name.search(searchString) !== -1) {
            
            existingItemFound = true;
            
            dataOutput.items[itemKey].name = abilityType + ": " + specialAbilityName + specialAbilityNameSuffix;
            
            dataOutput.items[itemKey].data.abilityType = specialAbilityType.toLowerCase();
            dataOutput.items[itemKey].abilityType = enumAbilityTypes[specialAbilityType.toLowerCase()];
            dataOutput.items[itemKey].abilityTypeShort = specialAbilityType;
            
            dataOutput.items[itemKey].data.description.value = specialAbilityDescription;
            
            // Set FeatType
            dataOutput.items[itemKey].data.featType = tempFeatTypeShort;
            dataOutput.items[itemKey].labels.featType = tempFeatType;
        }
    }
    
    if (existingItemFound == false) {
        // Create a new Item for new special Abilities
        let newSpecialAbility = JSON.parse(JSON.stringify(templateSpecialAbilityItem));
        
        newSpecialAbility.name = abilityType + ": " + specialAbilityName + specialAbilityNameSuffix;
        
        newSpecialAbility.data.abilityType = specialAbilityType.toLowerCase();
        newSpecialAbility.abilityType = enumAbilityTypes[specialAbilityType.toLowerCase()];
        newSpecialAbility.abilityTypeShort = specialAbilityType;
            
        newSpecialAbility.data.description.value = specialAbilityDescription;
        
        // Set FeatType
        newSpecialAbility.data.featType = tempFeatTypeShort;
        newSpecialAbility.labels.featType = tempFeatType;
        
        dataOutput.items.push(newSpecialAbility);
    }
}

// Map Statistics to data.attributes
function mapStatisticData () {
    console.log("MAP STATISTICS DATA");
    // Abilities
    let carryCapacity = 0;
    dataOutput.data.abilities.str.carryMultiplier = carrySizeModificators[formattedInput.size];
    dataOutput.data.abilities.str.carryBonus = 0;
    
    for (let i=0; i<enumAttributes.length; i++) {
        
        let item = enumAttributes[i];
        
        if (formattedInput[item].total !== "-") {
            dataOutput.data.abilities[item].total = +formattedInput[item].total;
            dataOutput.data.abilities[item].value = +formattedInput[item].total - +formattedInput[item].race;
            dataOutput.data.abilities[item].mod = getModifier(formattedInput[item].total);
            
            if (item.toLowerCase() === "str") {
                carryCapacity = getEncumbrance(formattedInput[item]) * dataOutput.data.abilities.str.carryMultiplier;
            }
            
        } else {
            
            // The sheet currently doesn't support - as input, so set everything to 0
            dataOutput.data.abilities[item].total = 0;
            dataOutput.data.abilities[item].value = 0;
            // And negate effects on the modificator in the conversion item
            dataOutput.data.abilities[item].mod = -5;
            
            // A Creature without Strength (e.g. incorporeal undead) can't carry stuff?!
            if (item.toLowerCase() === "str") {
                carryCapacity = 0;
            }
        }
        
    }
    
    // Finish Carry Capacity
    dataOutput.data.attributes.encumbrance.levels.light = Math.floor(1/3 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.medium = Math.floor(2/3 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.heavy = Math.floor(carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.carry = Math.floor(2 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.drag = Math.floor(5 * carryCapacity);
    
    // BAB, CMB, CMD
    dataOutput.data.attributes.bab.value = +formattedInput.bab;
    dataOutput.data.attributes.bab.total = +formattedInput.bab;
    dataOutput.data.attributes.cmb.value = +formattedInput.cmb.total;
    dataOutput.data.attributes.cmb.total = +formattedInput.cmb.total;
    dataOutput.data.attributes.cmbNotes = formattedInput.cmb.context;    
    dataOutput.data.attributes.cmd.value = formattedInput.cmd.total;
    dataOutput.data.attributes.cmd.total = formattedInput.cmd.total;
    dataOutput.data.attributes.cmdNotes = formattedInput.cmd.context;
    
    // Feats
    for (let i=0; i<formattedInput.feats.length; i++) {
        setFeatItem(formattedInput.feats[i]);
    }
    
    // Skills
    let skillKeys = Object.keys(formattedInput.skills);
    
    for (let i = 0; i < skillKeys.length; i++) {
        
        let skillKey = skillKeys[i];
        
        /*
            Climb (speedModifier): +8 when creature has a climb speed
            Fly (sizeModifier): Fine +8, Diminutive +6, Tiny +4, Small +2, Large –2, Huge –4, Gargantuan –6, Colossal –8.
            Fly (speedModifier): Clumsy –8, Poor –4, Average +0, Good +4, Perfect +8
            Intimidate (racialModifier): Half-Orcs get +2
            Perception (racialModifier): Elves, Half-Elves, Gnomes & Halflings get +2
            Perception (senseModifier): Creatures with Scent get +8 context to detect a scent
            Perception (senseModifier): Creatures with Tremorsense get +8 context vs. creatures touching the ground
            Craft/Profession (racialModifier): Gnomes get +2 to one Profession/Craft Skill
            Spellcraft (racialModifier): Elves get +2 context to identify magic items
            Spellcraft (classModifier): Wizards get +2 context for chosen schools and -5 for opposing schools
            Stealth (sizeModifier): Fine +16, Diminutive +12, Tiny +8, Small +4, Medium +0, Large -4, Huge -8, Gargantuan -12, Colossal -16
            Swim (speedModifier): +8 when creature has a swim speed
        */
                        
        let speedModifier = 0;
        let sizeModifier = 0;
        let racialModifier = 0;
        let senseModifier = 0;
        let classModifier = 0;
        let contextNotes = "";
        
        switch (skillKey) {
            case "climb":
                if (formattedInput.speed.climb.total !== 0) {
                    speedModifier = 8;
                };
                break;
                
            case "fly":
                if (formattedInput.speed.fly.total !== 0) {
                    switch(formattedInput.speed.fly.maneuverability.toLowerCase()) {
                        case "clumsy":
                            speedModifier = -8;
                            break;
                        case "poor":
                            speedModifier = -4;
                            break;
                        case "good":
                            speedModifier = 4;
                            break;
                        case "perfect":
                            speedModifier = 8;
                            break;
                        case "average":
                        default:
                            break;
                    }
                };
                switch (formattedInput.size.toLowerCase()) {
                    case "fine":
                        sizeModifier = 8;
                        break;
                    case "diminutive":
                        sizeModifier = 6;
                        break;
                    case "tiny":
                        sizeModifier = 4;
                        break;
                    case "small":
                        sizeModifier = 2;
                        break;
                    case "large":
                        sizeModifier = -2;
                        break;
                    case "huge":
                        sizeModifier = -4;
                        break;
                    case "gargantuan":
                        sizeModifier = -6;
                        break;
                    case "colossal":
                        sizeModifier = -8;
                        break;
                    default:
                        break;
                };
                break;
            case "intimidate":
                if (formattedInput.race.search(/half-orc/i) !== -1) {
                    racialModifier = 2;
                };
                break;
            case "perception":
                if (formattedInput.race.search(/half-elf|elf|gnome|halfling/i) !== -1) {
                    racialModifier = 2;
                };
                if (formattedInput.senses.search(/scent/i) !== -1) {
                    senseModifier = 8;
                    contextNotes = "+" + senseModifier + " to detect a scent";
                };
                if (formattedInput.senses.search(/tremor/i) !== -1) {
                    senseModifier = 8;
                    contextNotes = "+" + senseModifier + " to detect vibrations in the ground";
                };
                break;
            case "craft":
            case "profession":
                contextNotes = "gnomes get +2 to one craft/profession";
                break;
            case "spellcraft":
                if (formattedInput.race.search(/elf/i) !== -1) {
                    contextNotes = "+2 to identify magic items";
                };
                
                let classKeys = Object.keys(formattedInput.classes);
                
                for (let j=0; j<classKeys.length; j++) {
                    
                    let item = classKeys[j];
                    
                    if (item.search(/wizard|necromancer|diviner|evoker|illusionist|transmuter|abjurer|conjurer|enchanter/i) !== -1) {
                        let specialistWizard = item.match(/(wizard|necromancer|diviner|evoker|illusionist|transmuter|abjurer|conjurer|enchanter)/i)[0];
                        let wizardSchool = "";
                        
                        switch (specialistWizard) {
                            case "necromancer":
                                wizardSchool = "Necromancy";
                                break;
                            case "diviner":
                                wizardSchool = "Divination";
                                break;
                            case "evoker":
                                wizardSchool = "Evocation";
                                break;
                            case "illusionist":
                                wizardSchool = "Illusion";
                                break;
                            case "transmuter":
                                wizardSchool = "Transmutation";
                                break;
                            case "abjurer":
                                wizardSchool = "Abjuration";
                                break;
                            case "conjurer":
                                wizardSchool = "Conjuration";
                                break;
                            case "enchanter":
                                wizardSchool = "Enchantment";
                                break;
                            default:
                                wizardSchool = "Universalist";
                                break;
                        }
                        
                        contextNotes = "+2 for " + wizardSchool + " Spells, -5 for Spells of Opposing Schools";                        
                    }
                    
                };
                break;
                
            case "stealth":
                switch (formattedInput.size.toLowerCase()) {
                    case "fine":
                        sizeModifier = 16;
                        break;
                    case "diminutive":
                        sizeModifier = 12;
                        break;
                    case "tiny":
                        sizeModifier = 8;
                        break;
                    case "small":
                        sizeModifier = 4;
                        break;
                    case "large":
                        sizeModifier = -4;
                        break;
                    case "huge":
                        sizeModifier = -8;
                        break;
                    case "gargantuan":
                        sizeModifier = -12;
                        break;
                    case "colossal":
                        sizeModifier = -16;
                        break;
                    default:
                        break;
                };
                break;
            case "swim":
                if (formattedInput.speed.swim.total !== 0) {
                    speedModifier = 8;
                };
                break;
                
                
            default: break;
        }
        
        
        
                        
        // Skills with Sublevels
        if (skillKey.match(/\bcraft\b|\bperform\b|\bprofession\b|\bknowledge\b/i)) {
            
            let skillSubKeys = Object.keys(formattedInput.skills[skillKey]);
            
            // Get the Sublevel Keys
            for (let j = 0; j < skillSubKeys.length; j++) {
                let skillSubKey = skillSubKeys[j];
                
                // Set the skills
                let tempAttrShort = "";
                if (skillKey == "knowledge") {
                                            
                    if (JSON.stringify(enumSkills[skillKey]).search(skillSubKey) === -1) {
                        // if its not a valid knowledge subskill
                        tempAttrShort = "createCustomSkill";
                    } else {
                        // if its a valid knowledge subskill
                        tempAttrShort = enumSkills[skillKey][skillSubKey];
                    }
                    
                } else {
                    tempAttrShort = enumSkills[skillKey];
                }
                                
                if (tempAttrShort !== "createCustomSkill") {
                    // Check if the Skill is a classSkill in any of the items
                    let searchString = '"' + tempAttrShort + '":true';
                    let tempClassSkillModifier = 0;

                    if (JSON.stringify(dataOutput.items).search(searchString) !== -1) {
                        tempClassSkillModifier = 3;
                    }

                    let tempAttr = templateSkills[tempAttrShort].ability;
                    let tempAttrModifier = getModifier(formattedInput[tempAttr].total);

                    // Calculate the Rank (e.g. Total - Attribute-Modifier, maybe ClassSkillBonus)
                    
                    if (skillKey == "knowledge") {
                        if (formattedInput.skills[skillKey][skillSubKey].total !== 0) {
                            dataOutput.data.skills[tempAttrShort].rank = +formattedInput.skills[skillKey][skillSubKey].total -+formattedInput.skills[skillKey][skillSubKey].race - +tempAttrModifier - +tempClassSkillModifier;
                            dataOutput.data.skills[tempAttrShort].mod = formattedInput.skills[skillKey][skillSubKey].total;
                            dataOutput.data.skills[tempAttrShort].notes = formattedInput.skills[skillKey][skillSubKey].context;
                        }
                    } else if (formattedInput.skills[skillKey][skillSubKey] !== 0) {

                        // Get length of subSkills in this skillKey
                        let subSkillTotal = formattedInput.skills[skillKey][skillSubKey];
                        let tempSkillKeys = Object.keys(formattedInput.skills[skillKey]);
                                                
                        let templateSubSkill =  {
                            "name": "",
                            "ability": "",
                            "rank": 0,
                            "notes": "",
                            "mod": 0,
                            "rt": false,
                            "acp": false,
                            "cs": false,
                            "value": null
                        }
                        
                        for (let k=0; k<tempSkillKeys.length; k++) {
                            
                            let item = tempSkillKeys[k];
                            
                            if (item === skillSubKey) {
                                
                                let tempSubAttrShort = tempAttrShort + (k+1);
                                
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort] = JSON.parse(JSON.stringify(templateSubSkill));
                                
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].name = item;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].ability = dataOutput.data.skills[tempAttrShort].ability;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].rank = +subSkillTotal - +tempAttrModifier - +tempClassSkillModifier;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].notes = formattedInput.skills[skillKey].context;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].mod = +subSkillTotal;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].rt = dataOutput.data.skills[tempAttrShort].rt;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].acp = dataOutput.data.skills[tempAttrShort].acp;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].cs = dataOutput.data.skills[tempAttrShort].cs;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].value = dataOutput.data.skills[tempAttrShort].value;
                                
                            };
                            
                        };
  
                    }
                } else {
                    //Create a custom skill                    
                    let templateCustomSkill = {
                        "custom": {
                            "name": "custom",
                            "ability": "int",
                            "rank": 0,
                            "notes": "",
                            "mod": 0,
                            "rt": false,
                            "cs": false,
                            "acp": false,
                            "background": false,
                            "custom": true,
                            "value": null
                        }
                    };
                    
                    let customSkillName = skillKey + " (" + skillSubKey + ")";
                    
                    dataOutput.data.skills[customSkillName] = JSON.parse(JSON.stringify(templateCustomSkill));
                    dataOutput.data.skills[customSkillName].name = customSkillName;
                    dataOutput.data.skills[customSkillName].ability = "int";
                    dataOutput.data.skills[customSkillName].rank = +formattedInput.skills[skillKey][skillSubKey].total;
                    dataOutput.data.skills[customSkillName].notes = "sbc | Converted Custom Skill";
                    dataOutput.data.skills[customSkillName].mod = +formattedInput.skills[skillKey][skillSubKey].total;
                    dataOutput.data.skills[customSkillName].rt = false;
                    dataOutput.data.skills[customSkillName].cs = false;
                    dataOutput.data.skills[customSkillName].acp = false;
                    dataOutput.data.skills[customSkillName].background = false;
                    dataOutput.data.skills[customSkillName].custom = true;
                    dataOutput.data.skills[customSkillName].value = null;
                }
      
            }
            
        } else {
            // Skill without a sublevel
            let tempAttrShort = enumSkills[skillKey];
            
            // Check if the Skill is a classSkill in any of the items
            let searchString = '"' + tempAttrShort + '":true';
            let tempClassSkillModifier = 0;
            // If yes, use the bonus added to classSkills for further calculations
            if (JSON.stringify(dataOutput.items).search(searchString) !== -1) {
                tempClassSkillModifier = 3;
            }
            
            let tempAttr = templateSkills[tempAttrShort].ability;
            let tempAttrModifier = getModifier(formattedInput[tempAttr].total);
            
            // Calculate the Rank (e.g. Total - Attribute-Modifier, maybe - ClassSkillBonus?)
            if (formattedInput.skills[skillKey].total !== 0 || formattedInput.skills[skillKey].context !== "") {
                
                dataOutput.data.skills[tempAttrShort].rank =
                      +formattedInput.skills[skillKey].total
                    - +formattedInput.skills[skillKey].race
                    - +tempAttrModifier
                    - +tempClassSkillModifier
                    - +speedModifier
                    - +sizeModifier
                    - +racialModifier;

                dataOutput.data.skills[tempAttrShort].mod = formattedInput.skills[skillKey].total - +formattedInput.skills[skillKey].race;
                dataOutput.data.skills[tempAttrShort].notes = formattedInput.skills[skillKey].context;
                
            }

        }
        
    }
    
    // Languages
    let tempKnownLanguages = [];
    let tempUnknownLanguages = "";
        
    if (formattedInput.languages) {
        
        for (let i=0; i<formattedInput.languages.length; i++) {
            
            let item = formattedInput.languages[i];
            
            let tempItem = item.replace(/\+/i, "\\+");

            if (JSON.stringify(enumLanguages).search(tempItem.toLowerCase()) !== -1) {
                tempKnownLanguages.push(tempItem.toLowerCase());
            } else {
                tempUnknownLanguages += item + ", ";
            }
            
        }
    
    }
    
    dataOutput.data.traits.languages.value = tempKnownLanguages;
    dataOutput.data.traits.languages.custom = tempUnknownLanguages.replace(/, $/,"");
    
}

// Map Notes in HTML
function mapNotesData() {
    let tempNotes = "";
    
    // H2 - DESCRIPTION
    if (formattedInput.description !== "") {
        let tempDescriptionSection = "<section id='tactics'><h2>DESCRIPTION</h2>";
        tempDescriptionSection += "<p>" + formattedInput.description + "</p>";
        tempDescriptionSection += "</section>";
        tempNotes += tempDescriptionSection;
    }
    
    // H2 - TACTICS
    if (dataInputHasTactics === true) {
        let tempTacticsSection = "<section id='tactics'><h2>TACTICS</h2>";
        if (formattedInput.tactics.before_combat !== "") {
            tempTacticsSection += "<p><span style='font-weight: 900'>Before Combat:</span> " + formattedInput.tactics.before_combat + "</p>";
        }
        if (formattedInput.tactics.during_combat !== "") {
            tempTacticsSection += "<p><span style='font-weight: 900'>During Combat:</span> " + formattedInput.tactics.during_combat + "</p>";
        }
        if (formattedInput.tactics.morale !== "") {
            tempTacticsSection += "<p><span style='font-weight: 900'>Morale:</span> " + formattedInput.tactics.morale + "</p>";
        }
        tempTacticsSection += "</section>";
        tempNotes += tempTacticsSection;
    }
    
    // H2 - DEFENSIVE ABILITIES
    if (formattedInput.defensive_abilities !== "") {
        let tempDefensiveAbilitiesSection = "<section id='defensiveAbilities'><h2>DEFENSIVE ABILITIES</h2>";
        tempDefensiveAbilitiesSection += "<p>" + formattedInput.defensive_abilities + "</p>";
        tempDefensiveAbilitiesSection += "</section>";
        
        tempNotes += tempDefensiveAbilitiesSection;
    }
    
    // H2 - SPECIAL QUALITIES
    if (formattedInput.special_qualities[0] !== null && formattedInput.special_qualities[0] !== undefined && formattedInput.special_qualities[0] !== "") {
        let tempSpecialQualities = "<section id='defensiveAbilities'><h2>SPECIAL QUALITIES</h2>";
        tempSpecialQualities += "<p>";
        
        for (let i=0; i<formattedInput.special_qualities.length; i++) {
            tempSpecialQualities += formattedInput.special_qualities[i] + ", ";
        }
        
        tempSpecialQualities = tempSpecialQualities.replace(/, $/,"");
        tempSpecialQualities += "</p>";
        tempSpecialQualities += "</section>";
        
        tempNotes += tempSpecialQualities;
    }
    
    // H2 - RAW STATBLOCK
    let tempStatblockSection = "<section id='statblock'><h2>IMPORTED RAW DATA</h2>";
    tempStatblockSection += "<p>" + dataInput + "</p></section>";
    
    tempNotes += tempStatblockSection;
    
    // WRITE EVERYTHING TO THE NOTES
    dataOutput.data.details.notes.value = tempNotes;
}

/* ------------------------------------ */
/* CREATE ACTOR WITH INPUT DATA			*/
/* ------------------------------------ */

async function createNewActor () {
    // Create Actor
    
    let newActor = await Actor.create(dataOutput);
    if(DEBUG==true) { console.log("sbc-pf1 | Creating a new Actor with id=" + newActor.id) };
    
    if(DEBUG==true) { console.log("sbc-pf1 | Updating the Actor to include conversion changes") };
    
    //await game.actors.get(newActor.id).update(dataOutput);
    
    if(DEBUG==true) { console.log("sbc-pf1 | Spellcasting - Creating embeddedEntities") };
    
    await mapSpellbooks(newActor.id);
    
    const tempActor = await game.actors.get(newActor.id);
    
    await game.actors.get(newActor.id).update(dataOutput);
    await game.actors.get(newActor.id).update(dataOutput);
        
    await newActor.render(true);
    
    return newActor;
    
}

/* ------------------------------------ */
/* MISC FUNCTIONS    					*/
/* ------------------------------------ */
function getModifier(attr) {
    return Math.floor(((attr-10)/2));
}

function getEncumbrance (str) {
    // If(Str <= 10) MaxCarryingCapacity = 10*Str
    // If(Str > 10) MaxCarryingCapacity = 5/4 * 2^Floor(Str/5)* Round[20 * 2^(Mod(Str,5)/5)]
    
    if(str <= 10) {
        return str*10;
    } else {
        return 5/4 * (2 ** Math.floor(str/5)) * Math.round(20 * ( 2 ** ( (str % 5) / 5 ) ) );
    }
}

function getDiceAverage (diceSize) {
    let sum = 0;
    for (let i=1; i<=diceSize; i++) {
        sum += i;
    }
        
    return sum/diceSize;
}

function makeValueRollable(inputText) {
        
    var output = inputText.replace(/(\d+d\d+)/g, "[[$1]]");
    
    return output;
}
/*
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
*/

function capitalize (str) {
    return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
        return letter.toUpperCase();
    })
}

/* ------------------------------------ */
/* FOUNDRY COMPENDIUM FUNCTIONS    					*/
/* ------------------------------------ */

async function createSpellFromCompendium(spellName, actor_id) {
    
    // Suppose we are working with a particular pack named "dnd5e.spells"
    const pack = game.packs.get("pf1.spells");

    // We can load the index of the pack which contains all entity IDs, names, and image icons
    let packIndex = await pack.getIndex().then(index => {
        index = index.name;
    });

    // We can find a specific entry in the compendium by its name
    let entry = await pack.index.find(e => e.name === spellName);
            
    // Given the entity ID of "Acid Splash" we can load the full Entity from the compendium
    await pack.getEntity(entry._id).then(spell => {
        return spell;
    });
}

async function getItemFromCompendium(packInput, item) {
    const pack = game.packs.get(packInput);

    // We can load the index of the pack which contains all entity IDs, names, and image icons
    let packIndex = await pack.getIndex().then(index => {
        index = index.name;
    });

    // We can find a specific entry in the compendium by its name
    let entry = await pack.index.find(e => e.name === item);
            
    // Given the entity ID we can load the full Entity from the compendium
    let output = await pack.getEntity(entry._id).then(entity => {
        return entity;
    });
    
    return output;
    
}

