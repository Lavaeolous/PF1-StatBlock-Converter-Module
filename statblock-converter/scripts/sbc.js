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
var inputClassHD = 0;
var dataInputHasNonPlayableRace = false;
var dataInputHasPlayableRace = false;
var dataInputHasRacialHD = true;
var dataInputHasTactics = false;
var dataInputHasSpecialAbilities = false;
var dataInputHasEcology = false;
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
    ]

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
    ]

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
]

// Get HTML Elements
var inputTextArea = document.getElementById("input");
// Make function visible outside the esmodule
window.convertStatBlock = convertStatBlock;

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
        console.log('sbc-pf1 | Statblock Converter PF1 Ready');
        const importButton = $('<button class="create-entity sbcButton"><i class="fas fa-user"></i>Import StatBlock</button>');
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
            width: 500,
            height: 400,
            id: "sbcModal"
        };
        
        const content = '<p>Enter the StatBlock you want to import and convert</p><textarea class="statBlockInput" id="input" form="statBlockInputForm" placeholder="Paste Statblock here"></textarea>';
        
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
    inputClassHD = 0;
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
    
    // Set some flags for (optional) data blocks found in the input
    // mandatory
    let foundDefenseData = false;
    let foundOffenseData = false;
    let foundStatisticsData = false;
    // optional
    let foundTacticsData = false;
    let foundSpecialAbilitiesData = false;
    let foundEcologyData = false;
    
    // Check if enough Data to start conversion is available
    if(dataInput.search(/(\n\bAC\b(?:[\s\S]*)\nhp)/gmi) !== -1) { foundDefenseData = true; }
    if(dataInput.search(/(\n\bSpeed\b)/mi) !== -1) { foundOffenseData = true; }
    if(dataInput.search(/(\n\bSTR\b)/gmi) !== -1) { foundStatisticsData = true; }
    // Check for optional Datablocks marked by keywords for now
    if(dataInput.search(/\nTACTICS\n/gmi) !== -1) { foundTacticsData = true; dataInputHasTactics = true; }
    if(dataInput.search(/\nSPECIAL ABILITIES\n/gmi) !== -1) { foundSpecialAbilitiesData = true; dataInputHasSpecialAbilities = true; }
    if(dataInput.search(/\nECOLOGY\n/gmi) !== -1) { foundEcologyData = true; dataInputHasEcology = true; }
    
    // 
    if( (foundDefenseData == false) || (foundOffenseData == false) || (foundStatisticsData == false) ) {
        ui.notifications.info("Something went wrong! Please activate the Debug-Mode and check the console (F12)")
        return;
    }
    
    // Output the prelimenary analysis of the input
    /*
    statusOutput.innerHTML += "Input-Analysis:<br/>Mandatory: <ul>";
    statusOutput.innerHTML += "<li>Offense-Data found: " + foundOffenseData + " (WIP, currently only read and not parsed)</li>";
    statusOutput.innerHTML += "<li>Defense-Data found: " + foundDefenseData + "</li>";
    statusOutput.innerHTML += "<li>Statistic-Data found: " + foundStatisticsData + "</li></ul><br/>";
    statusOutput.innerHTML += "Optional: <ul>";
    statusOutput.innerHTML += "<li>Tactics-Data found: " + foundTacticsData + "</li>";
    statusOutput.innerHTML += "<li>Special Abilities-Data found: " + foundSpecialAbilitiesData + "</li>";
    statusOutput.innerHTML += "<li>Ecology-Data found: " + foundEcologyData + "</li></ul>";
    */
    
    let tempInputRest = "";

    // Split stringGeneralData, e.g. everything between the Start of the Input and "AC", removing "DEFENSE"
    splitInput = dataInput.split(/(?=(^AC))/m);
    tempInputRest = splitInput[2];
    stringGeneralData = splitInput[0].replace(/(DEFENSE)/gm,"");
    splitInput = "";
            
    // Split stringDefenseData, everything between AC and Speed
    splitInput = tempInputRest.split(/(?=(^Speed))/mi);
    tempInputRest = splitInput[2];
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
            tempSplit = tempInputRest.split(/SPECIAL ABILITIES/gmi)
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
    
    /*
    if(dataInput.indexOf("SPECIAL ABILITIES") !== -1) {
        splitInput = tempInputRest.split("SPECIAL ABILITIES");
        tempInputRest = splitInput[1];
        stringStatisticsData = splitInput[0];
        splitInput = "";
    }
    
    if(dataInput.indexOf("GEAR") !== -1) {
        splitInput = tempInputRest.split("GEAR");
        tempInputRest = splitInput[1];
        stringSpecialAbilitiesData = splitInput[0];
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
    if(foundTacticsData === true) {
        await splitTacticsData(stringTacticsData);
    }
    
    // Take Statistics Data and extract Attribute, BAB, CMB, CMD, Feats, Skills, Languages, SQs and Gear
    await splitStatisticsData(stringStatisticsData);
    
    
    // Map SchemaData to TemplateData
    await mapInputToTemplateFoundryVTT(formattedInput);
    
    if(DEBUG==true) { 
        console.log("sbc-pf1 | CHECK HERE FOR DIFFERENCES BETWEEN RAW INPUT, PARSED AND SAVED DATA");
        console.log("==============================================================================================");
        console.log("sbc-pf1 | RAW INPUT AFTER MINOR CLEANUP");
        console.log(dataInput);
        console.log("sbc-pf1 | PARSED AND FORMATTED DATA IN NEUTRAL TEMPLATE");
        console.log(formattedInput);
        console.log("==============================================================================================");
        console.log("sbc-pf1 | DATA CONVERTED INTO A PF1 ACTOR");
        console.log(dataOutput);
        console.log("==============================================================================================");
    };  
    
    // CREATE NEW ACTOR
    await createNewActor();
    
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
    if (splitGeneralData.search(/(\bXP\b)/) !== -1) {
        splitXP = splitGeneralData.match(/(?:XP )([\d,.]+)/)[0].replace(/([\D]|[,?]|[\.?])/g,"");
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
    
    console.log("regExClassesAndLevel: " + regExClassesAndLevel);
    console.log("splitClasses: " + splitClasses);
    
    // If there are classes, get them, their level and the race / gender as well
    if ( (splitClasses !== null) && (splitClasses !== "") ) {
        // Set Flag
        dataInputHasClasses = true;
        // Get Class(es)
        splitClasses.forEach( function(item, index) {
                        
            if ( item !== undefined ) {
                
                console.log("item: " + item);
                
                // Check for className (first for classes with two words e.g. vampire hunter)
                let classNameAndLevel = "";
                let className = "";
                let classNameSuffix = "";
                let classLevel = "";

                // Get Classlevel and words in between class an level
                //let regExClassAndLevel = new RegExp("(" + item + ")" + "(?:[\\s]*?)([\\w\\s()]*?)(?:[\\s]*?)(\\d+)", "ig");
                
                //classNameAndLevel = splitGeneralData.match(regExClassAndLevel);
                classNameAndLevel = item;
                
                console.log("classNameAndLevel: " + classNameAndLevel);
                
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

                formattedInput.classes[className] = {
                    "name" : className[0],
                    "nameSuffix" : classNameSuffix,
                    "level" : +classLevel
                }
            }

        });
        
        // Get Gender and Race if available
        let regExGenderAndRace = new RegExp("(?:[0-9]*?)([^0-9]*)(?:" + enumClasses.join("|") + ")", "ig");

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
            formattedInput.race = foundRace;
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
        splitGeneralDataInBrackets.forEach( function (item,index) {
            let foundSubtypes = item.match(regExSubtypes);
            if(foundSubtypes !== null) {
                splitSubtypes = foundSubtypes;
            }
        }, splitGeneralDataInBrackets);
        
    }
    
    // Initiative (positive and negative)
    let splitInit = splitGeneralData.match(/(?:Init\s*)(\+\d+|-\d+)/)[1];
    
    // Senses
    let splitSenses = "";
    if (splitGeneralData.search(/\bSenses\b/gmi) !== -1) {
        splitSenses = splitGeneralData.match(/(?:\bSenses\b\s*)(.*?)(?:\n|$|\s*Aura)/igm)[0].replace(/\bSenses\b\s*|\s*Aura\b/g,"");
    }
    
    // Aura
    let splitAura = "";
    if (splitGeneralData.search(/Aura\b/igm) !== -1) {
        splitAura = splitGeneralData.match(/(?:Aura\s*)(.*?)(?:;|\n|$)/igm)[0].replace(/Aura\s*/,"");
        console.log("splitAura: " + splitAura);
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
        splitACBonusTypes.forEach( function ( item, index) {

            // get the bonus type
            let foundBonusType = item.match(/([a-zA-Z]+)/i)[0];
            let foundBonusValue = item.match(/(\+[\d]*)|(-[\d]*)/i)[0].replace(/\+/,"");

            formattedInput.ac_bonus_types[foundBonusType] = +foundBonusValue;

        });
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
    let splitHPTotal = splitDefenseData[1].split(/(?:hp )([\d]*)/)[1];
    //let stringHitDice = JSON.stringify(splitDefenseData[1].match(/\([\s\S]*?\)/));
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
    
    // Extract HitDie and separate DicePools containing number and size of the die as well as the bonus
    let splitHitDice = {};
    let splitHitDie = {
        "hd": 0,
        "hdSize": 0,
    }
    
    // Calculate HP for Class and Race Items
    
    // Get different DicePools, e.g. XdY combinations, mostly for combinations of racial and class hitDice
    let hitDicePool = JSON.stringify(stringHitDice).match(/(\d+?d\d+)/gi);
        
    // Find the Dicepool for class(es)
    if (dataInputHasClasses == true) {

        let classKey = Object.keys(formattedInput.classes);
        let hitDicePoolKey = Object.keys(hitDicePool);
        
        for (let i = 0; i < classKey.length; i++) {
            
            let tempLevel = formattedInput.classes[classKey[i]].level;
            
            let foundClassHD = 0;
            
            for (let j = 0; j < hitDicePoolKey.length; j++) {
                
                let tempRegEx = new RegExp("(?:" + tempLevel + "d)(\\d+)", "i");
                
                if ( (hitDicePool[j].search(tempRegEx) !== -1) && (foundClassHD !== classKey.length) ) {
                    // Set HP for classItem
                    let tempDiceSize = hitDicePool[j].match(tempRegEx)[1];
                    formattedInput.hp.class = Math.floor(+tempLevel * +getDiceAverage(tempDiceSize));
                    formattedInput.hp.race = 0;
                    inputHDTotal += +tempLevel;
                    foundClassHD++;
                } else if ( foundClassHD === classKey.length ) {
                    // Set HP for RacialHDItem                    
                    let tempDiceSize = hitDicePool[j].match(/(?:d)(\d+)/)[1];
                    let tempRacialHD = hitDicePool[j].match(/(\d+)(?:d)/)[1];
                    
                    formattedInput.hp.race = Math.floor(+tempRacialHD * +getDiceAverage(tempDiceSize));
                    inputHDTotal += +tempRacialHD;
                }
            }
        }

    } else {

        // Set racialHD when no class is given
        let hitDicePoolKey = Object.keys(hitDicePool);
        for (let j = 0; j < hitDicePoolKey.length; j++) {
            
            // Set HP for RacialHDItem        
            let tempDiceSize = hitDicePool[j].match(/(?:d)(\d+)/)[1];
            let tempRacialHD = hitDicePool[j].match(/(\d+)(?:d)/)[1];
            
            formattedInput.hp.race = Math.floor(+tempRacialHD * +getDiceAverage(tempDiceSize));
            inputHDTotal += +tempRacialHD;
        }
    }
    
    formattedInput.hit_dice.hd = inputHDTotal;
        
    //let hitDiceBonusPool = JSON.stringify(stringHitDice).match(/[^d+\(](\d+)/gi);
    let hitDiceBonusPool = stringHitDice[0].replace(/(\d+d\d+)/gi,"").match(/\d+/g);
    
    let hitDiceBonus = 0;
        
    // Get the sum of all the additional bonus hp, denoted for example by "+XX" and / or "plus XX"
    if (hitDiceBonusPool !== null) {
        
        for (let i = 0; i < hitDiceBonusPool.length; i++) {
            hitDiceBonus += +hitDiceBonusPool[i];
        }
    
    }

    formattedInput.hp.total = splitHPTotal;
    
    // Extract Saves    
    let splitSaves;
    
    for (var i = 0; i < splitDefenseData.length; i++) {
        if (splitDefenseData[i].search(/Fort/i) !== -1) {
            splitSaves = splitDefenseData[i].split(/,|;/);
        }
    }
    
    //let splitSaves = splitDefenseData[2].split(/,/);    
    splitSaves.forEach( function (item, index) {
        if (this[index].match(/(fort)/i)) {
            let splitFort = item.match(/(\+[\d]*)|(-[\d]*)/g)[0];
            formattedInput.fort_save.total = splitFort.replace(/\+/,"");
        } else if (this[index].match(/(ref)/i)) {
            let splitRef = item.match(/(\+[\d]*)|(-[\d]*)/g)[0];
            formattedInput.ref_save.total = splitRef.replace(/\+/,"");
        } else if (this[index].match(/(will)/i)) {
            let splitWill = item.match(/(\+[\d]*)|(-[\d]*)/g)[0];
            formattedInput.will_save.total = splitWill.replace(/\+/,"");
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
        splitWeaknesses = splitWeaknesses.replace(/vulnerable to | and /gi, "")
        formattedInput.weaknesses = splitWeaknesses;
    }
    
    // Spell Resistance
    if (searchableDefenseData.search(/\bSR\b/i) !== -1) {
        let splitSR = searchableDefenseData.match(/(?:\bSR\b )(.*?)(?:;)/i)[0].replace(/\bSR\b /i, "");
        splitSR = splitSR.replace(/;|,| |\n/g, "");
        formattedInput.spell_resistance = splitSR;
    }
    
    // Defensive Abilities
    // Spell Resistance
    if (searchableDefenseData.search(/\bDefensive Abilities\b/i) !== -1) {
        let splitDefensiveAbilities = searchableDefenseData.match(/(?:\bDefensive Abilities\b )(.*?)(?:;)/i)[0].replace(/\bDefensive Abilities\b /i, "");
        splitDefensiveAbilities = splitDefensiveAbilities.replace(/;|,|\n/g, ",").replace(/,\s+$|,$/g, "");
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
    let landSpeed = splitSpeed.match(/\d+/);
    
    // Check for other Speeds
    if (splitSpeed.search(/,/g) !== -1) {
        let splitSpeeds = splitSpeed.replace(/, /g, ",").replace(/\d+ ft.,/, "").split(/,/g);
                
        splitSpeeds.forEach ( function (item, index) {
            let speedType = item.match(/\b\w*\b/);
            let speedSpeed = item.match(/\d+/);
                        
            if (speedSpeed !== "" && speedSpeed !== null) {
                // If its a movementType with speed (e.g. land, fly, climb or burrow)
                formattedInput.speed[speedType].base = speedSpeed;
            } else {
                // If it's not one of the normal movementTypes the probability is high, that it's a special ability
                formattedInput.special_abilities[item] = { "name": item };
            }
            
            
            if (item.search(/fly/) !== -1) {
                let flyManeuverability = item.match(/(?:\((.+)\))/)[1];
                formattedInput.speed.fly.maneuverability = flyManeuverability;
            }
        });
    }
        
    formattedInput.speed.land.base = landSpeed;
    
    // Create usable Strings for melee, ranged and special attacks
    
    // Melee
    // If there are ranged or special attacks
    
    let splitMeleeAttacks = "";
    let splitRangedAttacks = "";
    let splitSpecialAttacks = "";
    let splitSpaceAndReach = "";
    
    // Melee, Ranged and Special
    
    /* THIS NEEDS TO BE WAY MORE ROBUST
     * SPLITTING IS INCONSISTEN DEPENDING ON WHERE WHICH STRING IS FOUND
     */
    
    // REWORKED SPLITTING
    
    if (splitOffenseData.search(/(?:Melee )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im) !== -1) {
        splitMeleeAttacks = splitOffenseData.match(/(?:Melee )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
        // Replace ", or " with " or "
        splitMeleeAttacks = splitMeleeAttacks.replace(/, or /, " or ");
        
    }
    
    if (splitOffenseData.search(/(?:Ranged )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im) !== -1) {
        splitRangedAttacks = splitOffenseData.match(/(?:Ranged )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
        // Replace ", or " with " or "
        splitRangedAttacks = splitRangedAttacks.replace(/, or /, " or ");
    }
    
    if (splitOffenseData.search(/(?:Special Attacks )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im) !== -1) {
        splitSpecialAttacks = splitOffenseData.match(/(?:Special Attacks )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
    }
    
    if (splitOffenseData.search(/\bSpace\b/im) !== -1) {
        splitSpaceAndReach = splitOffenseData.match(/(?:Space )(.*)(?:(?:\n+)(?:(\b.+?\b)|(?:\+)|(?:\d))|$)/im)[1];
    }
        
    formattedInput.meleeAttacks = splitMeleeAttacks.replace(/Melee /i, "");
    formattedInput.rangedAttacks = splitRangedAttacks.replace(/Ranged /i, "");
    formattedInput.specialAttacks = splitSpecialAttacks.replace(/Special Attacks /i, "");
    if(DEBUG==true) { console.log("sbc-pf1 | splitMeleeAttacks: " + splitMeleeAttacks) };
    if(DEBUG==true) { console.log("sbc-pf1 | splitRangedAttacks: " + splitRangedAttacks) };
    if(DEBUG==true) { console.log("sbc-pf1 | splitSpecialAttacks: " + splitSpecialAttacks) };
    
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
        let tempItem = item.replace(/^\s/,"").split(/\s/);
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
    if (stringStatisticsData.search(/\bcmb\b/im) !== -1) {
        formattedInput.cmb = stringStatisticsData.match(/(?:Cmb[\s+-]*)([\d]*)/i)[1];
    };
    if (stringStatisticsData.search(/\bcmd\b/im) !== -1) {
        formattedInput.cmd = stringStatisticsData.match(/(?:CMD )(.*)/i)[1];
    }
    
    // Feats (String from "Feats" to next linebreak)
    if (stringStatisticsData.search(/(?:Feats )/) !== -1) {
        let splitFeats = stringStatisticsData.match(/(?:Feats )([\s\S]*)(?:Skills)/gim)[0];
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
            } else if (splitSkills.search(/(\b\w*\b [+-]\d+ \([+-]\d+[a-zA-Z0-9,; ]+\))/) !== -1) {
                if(DEBUG==true) { console.log("sbc-pf1 | ADD SUPPORT FOR context Modifier") };
                
                // !!!! ADD SUPPORT FOR CONTEXT MODIFIER HERE
            }
            
        }
                
        splitSkills = splitSkills.split(/,/);
        
        splitSkills.forEach (function (item, index) {
                        
            let skillTotal = item.match(/(-\d+|\d+)/)[0];
            let skillName = item.replace(/(^\s*|\s*-[\d].*|\s*\+.*)/g, "");

            // Cases with sublevels (Knowledge, Profession, Perform, Craft)
            if (skillName.search(/\bcraft\b|\bperform\b|\bprofession\b|\bknowledge\b/i) !== -1) {
                let skillSubtype = skillName.match(/\(([^)]+)\)/)[1].replace(/^ | $/g,"");
                let tempSkillName = skillName.replace(/\s*\(([^)]+)\)/g, "");
                tempSkillName = tempSkillName.replace(/^ | $/g, "");
                
                // Parse Knowledge, because these may have special notations
                if (skillName.search(/\bKnowledge\b/i) !== -1) {
                    
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
                    } else if (skillSubtype.match(/\bany\b\s.*/i) !== null){
                        
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
                            
                            if (alreadyPickedSubskills.search(randomSubskill) === -1) {
                                
                                formattedInput.skills.knowledge[enumKnowledgeSubskills[i]].total = +skillTotal;
                                alreadyPickedSubskills += randomSubskill;
                            
                            } else {
                                i--;
                            }
                            
                            
                        }
                        
                        
                    } else {
                        // No special notation, just a normal knowledge subkey
                        formattedInput.skills[tempSkillName.toLowerCase()][skillSubtype.toLowerCase()].total = +skillTotal;
                    }
                } else {
                    // Not a knowledge skill
                    formattedInput.skills[tempSkillName.toLowerCase()][skillSubtype.toLowerCase()] = +skillTotal;
                }
                
            } else {
                // Skill without subskills
                formattedInput.skills[skillName.toLocaleLowerCase()].total = +skillTotal;
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
            tempSQs = splitSQ.split(/,|;/g);
        } else {
            tempSQs[0] = splitSQ;
        }
        
        formattedInput.special_qualities = tempSQs;
    }
    
    // Gear

    if(DEBUG==true) { console.log("sbc-pf1 | DONE parsing statistics data") };
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
    
    // Create a custom Item for Conversion Stuff (e.g. Changes to AC, Saves)
    await setConversionItem(formattedInput);
    
    // Map defenseData
    await mapDefenseData(formattedInput);
    
    // Map OffenseData
    await mapOffenseData(formattedInput);
    
    // Map statisticData
    await mapStatisticData(formattedInput);

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
    dataOutput.data.details.cr = +formattedInput.cr;
    dataOutput.data.details.xp.value = formattedInput.xp;
    dataOutput.data.details.alignment = formattedInput.alignment;
    
    // Changes for Undead Creatures
    let tempHPTotal = 0;
    if (formattedInput.creature_type === "undead") {
        dataOutput.data.attributes.hpAbility = "cha";
        dataOutput.data.attributes.savingThrows.fort.ability = "cha";
        dataOutput.data.attributes.hp.value = dataOutput.data.attributes.hp.max = formattedInput.hp.total;
    }
    
    // Attributes
    dataOutput.data.attributes.init.value = formattedInput.initiative - getModifier(formattedInput.dex.total);
    dataOutput.data.attributes.init.total = formattedInput.initiative;
    
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
    dataOutput.token.dimSight = 120;
    dataOutput.token.brightSight = 60;
    
    // Aura
    if (formattedInput.aura !== "") {
        // CURRENTLY THERE IS NO SEPARATE FIELD IN THE SHEET FOR AURAS
    }
    
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
        classEntry.name = classInput[tempClassName].name;
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
        
        itemEntry.data.level = classInput[classKey[i]].level;
        inputClassHD = classInput[classKey[i]].level;
        itemEntry.data.hp = +formattedInput.hp.class;
        
        // "low"-progression: floor(@level / 3)
        // "high"-progression: 2 + floor(@level / 2)
        let saveKey = Object.keys(itemEntry.data.savingThrows);

        for (var i=0; i < saveKey.length; i++) {
            if (itemEntry.data.savingThrows[saveKey[i]].value == "low") {
                formattedInput[saveKey[i]+"_save"].class = Math.floor(itemEntry.data.level / 3);            
            } else if (itemEntry.data.savingThrows[saveKey[i]].value == "high") {
                formattedInput[saveKey[i]+"_save"].class = 2 + Math.floor(itemEntry.data.level / 2);
            } else {
                formattedInput[saveKey[i]+"_save"].class = 0;
            }
        }

        dataOutput.items.push(itemEntry);
    }
}

// Create Race Item
function setRaceItem (raceInput) {
    
    let itemEntry;
    
    // If it's a playable race
    if (dataInputHasNonPlayableRace == true) {
        // DEEP COPY
        itemEntry = JSON.parse(JSON.stringify(templateRaceItem["default"]));
        itemEntry.name = raceInput;
    } else if (dataInputHasPlayableRace == true) {
        // DEEP COPY
        itemEntry = JSON.parse(JSON.stringify(templateRaceItem[raceInput.toLowerCase()]));
    } else {
        if(DEBUG==true) { console.log("sbc-pf1 | Something went wrong parsing the race") };
    }
    
    let raceChanges = itemEntry.data.changes;
    
    raceChanges.forEach ( function (item, index) {
        
        // Set Changes for Abilities
        if (item[1] == "ability") {
            formattedInput[item[2]].race = item[0];
        } else if (item[1] == "skill") {
            // Else check if its a change to skills
            let skillShort = item[2].replace(/skill./,"");
            
            for (var key in enumSkills) {
                if (enumSkills[key] === skillShort) {
                    if (key === "knowledge") {
                        formattedInput.skills.knowledge[key].race = item[0];
                    } else {
                        formattedInput.skills[key].race = item[0];
                    }
                }
            }  
        } else if (item[1] == "ac") {
            // Else if change to ac (e.g. Adaro)
            /*
                [
                "2",
                "ac",
                "nac",
                "base"
              ]
              */
            formattedInput.ac_race_bonus = item[0];
        }
        
        
    });
    
    dataOutput.items.push(itemEntry);
}

// Create Item for RacialHD
async function setRacialHDItem () {
    
    // Create Item for the Class starting from the template
    // DEEP COPY
    let itemEntry = JSON.parse(JSON.stringify(templateRacialHDItem[formattedInput.creature_type.toLowerCase()]));
    
    itemEntry.data.level = +formattedInput.hit_dice.hd - inputClassHD;
    itemEntry.data.hp = +formattedInput.hp.race;

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
    if (formattedInput.con.total === "-" && formattedInput.creature_type === "undead") {
        
        // calculating hp total for undead with no con (so with cha instead)
        calculatedHPTotal = +formattedInput.hp.race + +formattedInput.hp.class + (+formattedInput.hit_dice.hd * +getModifier(formattedInput.cha.total));
        
    } else if (formattedInput.con.total === "-") {
        // calculating hp total for con = -
        calculatedHPTotal = +formattedInput.hp.race + +formattedInput.hp.class + (+formattedInput.hit_dice.hd * +getModifier(10));
    } else {
        calculatedHPTotal = +formattedInput.hp.race + +formattedInput.hp.class + (+formattedInput.hit_dice.hd * +getModifier(formattedInput.con.total));
    }
    
    if (+calculatedHPTotal !== +formattedInput.hp.total) {

        let tempHPDifference = +formattedInput.hp.total - +calculatedHPTotal;
        
        let hpChange = [
            tempHPDifference.toString(),
            "misc",
            "mhp",
            "untyped"
        ];
                
        itemEntry.data.changes.push(hpChange);
    }
    
    // Add Changes to Init if needed
    let calculatedInitTotal = +getModifier(formattedInput.dex.total);
    if (calculatedInitTotal !== formattedInput.initiative) {
        let tempInitDifference = +formattedInput.initiative - +calculatedInitTotal;
        
        let initChange = [];
        initChange.push(tempInitDifference.toString());
        initChange.push("misc");
        initChange.push("init");
        initChange.push("untyped");
        
        itemEntry.data.changes.push(initChange);
        
    }

    // Add Changes to AC
    for (var key in formattedInput.ac_bonus_types) {
        // Exclude dex, size and natural, as these are included elsewhere in the sheet
        if ( (key.toLowerCase() !== "dex") && (key.toLowerCase() !== "size") && (key.toLowerCase() !== "natural") ) {
            
            let acChange = [];
            
            // Special Treatment for Armor and Shield Boni
            if ( ( key.toLowerCase() == "armor" ) || ( key.toLowerCase() == "shield" ) ) {
                acChange.push(formattedInput.ac_bonus_types[key].toString());
                acChange.push("ac");
                if ( key == "armor") {
                    acChange.push("aac");
                } else {
                    acChange.push("sac");
                }
                acChange.push("untyped");
            } else {
                acChange.push(formattedInput.ac_bonus_types[key].toString());
                acChange.push("ac");
                acChange.push("ac");
                acChange.push(key);
            }

            itemEntry.data.changes.push(acChange);  
        }
    }
    
    // Add SavingThrow Values in Changes, decreased by the corresponding attribute modifiers
    // and the values derived from the saving throw progression of racialHD and class
    // "low"-progression: floor(@level / 3)
    // "high"-progression: 2 + floor(@level / 2)
    enumSaves.forEach( function (item, index) {
        let saveChange = [];
        let tempSaveString = item + "_save";
        
        if (item === "fort" && formattedInput.con.total === "-") {
            let tempSaveChange = +formattedInput[tempSaveString].total - +formattedInput[tempSaveString].racial - +formattedInput[tempSaveString].class;
            saveChange.push(tempSaveChange.toString());
        } else {
            let attrModifier = +getModifier(formattedInput[enumSaveModifier[index]].total);
            
            let tempSaveChange = +formattedInput[tempSaveString].total - +formattedInput[tempSaveString].racial - +formattedInput[tempSaveString].class - +attrModifier;
            saveChange.push(tempSaveChange.toString());
        }
        
        saveChange.push("savingThrows");
        saveChange.push(item);
        saveChange.push("untyped");

        itemEntry.data.changes.push(saveChange);  
    });
    
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
    
    // SR
    dataOutput.data.attributes.sr.total = +formattedInput.spell_resistance;
    dataOutput.data.attributes.sr.formula = formattedInput.spell_resistance;
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
    
    // Immunities    
    // Set Condition Immunities
    let tempImmunities = formattedInput.immunities;
    tempImmunities = tempImmunities.replace(/Electricity/gi, "electric");
    enumConditions.forEach( function (item, index) {
        if (tempImmunities.search(item) !== -1) {
            dataOutput.data.traits.ci.value.push(item);
            tempImmunities = tempImmunities.replace(item, "");
        }
    });
    
    // Set Damage Immunities
    enumDamageTypes.forEach( function (item, index) {
        if (tempImmunities.search(item) !== -1) {
            dataOutput.data.traits.di.value.push(item);
            tempImmunities = tempImmunities.replace(item, "");
        }
    });
    
    // If there is anything left in tempImmunities, treat it as a custom immunity
    if (tempImmunities.search(/(\w+)/gi) !== -1) {
        //ability damage, ability drain, charm effects, compulsion effects, , death effects, , energy drain, petrification, and ;
        
        // Remove empty fields
        tempImmunities = tempImmunities.replace(/, , |, /g, ",")
        tempImmunities = tempImmunities.replace(/\band\b/g, "")
        tempImmunities = tempImmunities.replace(/;$/g, "")
        tempImmunities = tempImmunities.replace(/, $/g, "");
        
        // Now way to find out if its damage or a condition, so set it just to condition
        dataOutput.data.traits.ci.custom = tempImmunities;
    }
    
    // Resistances    
    let tempResistances = formattedInput.resistances;
    tempResistances = tempResistances.replace(/Electricity/gi, "electric");

    enumDamageTypes.forEach( function (item, index) {
        let tempResistanceRegEx = new RegExp("(\\b" + item + "\\b \\d+)", "ig");
        if (tempResistances.search(tempResistanceRegEx) !== -1) {
            let tempResistance = tempResistances.match(tempResistanceRegEx);
            dataOutput.data.traits.eres += tempResistance + ", ";
        }
    });
    
    dataOutput.data.traits.eres = dataOutput.data.traits.eres.replace(/, $/,"");
        
    // Weaknesses / Vulnerabilities    
    // Set DamageType Vulnerabilities
    let tempWeaknesses = formattedInput.weaknesses;
    tempWeaknesses = tempWeaknesses.replace(/Electricity/gi, "electric");
    
    enumDamageTypes.forEach( function (item, index) {
        if (tempWeaknesses.search(item) !== -1) {
            dataOutput.data.traits.dv.value.push(item);
            tempWeaknesses = tempWeaknesses.replace(item, "");
        }
    });
    
    // If there is anything left in tempWeaknesses, treat it as a custom weakness
    if (tempWeaknesses.search(/(\w+)/gi) !== -1) {
        let tempCustomWeakness = tempWeaknesses.match(/(\w+)/gi).join(", ");
        
        dataOutput.data.traits.dv.custom = tempCustomWeakness;
    }
    
    
    
    
    // Reset Max Dex Bonus for now
    // dataOutput.data.attributes.maxDexBonus = 0;
}

// Map Offense Data
function mapOffenseData () {
    
    // Speed(s)
    let speedKeys = Object.keys(formattedInput.speed);
    
    for (let i = 0; i < speedKeys.length; i++) {
        dataOutput.data.attributes.speed[speedKeys[i]].base = +formattedInput.speed[speedKeys[i]].base;
        dataOutput.data.attributes.speed[speedKeys[i]].total = +formattedInput.speed[speedKeys[i]].base;
        if (speedKeys[i] === "fly") {
            dataOutput.data.attributes.speed.fly.maneuverability = formattedInput.speed.fly.maneuverability.toLowerCase();
        }
    }
    
    
    // Melee Attack Groups
    // For Attacks that can be made in one Full Attack
    // e.g. 2 Slams +10 (1d8+18), 2 Wings +5 (1d4+18) or Bite +10 (1d8+24 plus Grab)
    // Where the attack groups are seperated by "or"
    if (formattedInput.meleeAttacks !== "") {
        let meleeAttackGroups = formattedInput.meleeAttacks.split(/\bor\b/g);
        setAttackItem(meleeAttackGroups, "mwak");
    }
    
    if (formattedInput.rangedAttacks !== "") {
        let rangedAttackGroups = formattedInput.rangedAttacks.split(/\bor\b/g);    
        setAttackItem(rangedAttackGroups, "rwak");
    }
       
}

// Set Attack Items
function setAttackItem (attackGroups, attackType) {
    
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
            // 2 Slams +10 (1d8+18)                             Multiple attacks
            // +3 Longsword +15 (1d8+12)                        Magic Enhancement
            // scimitar +0 (1d6/18-20)                          Mundane Weapon and Crit-Range
            // mwk quarterstaff +0 (1d6–1)                      masterwork Weapon
            // bite +24 (3d8+14/19–20 plus poison)              Natural Attacks - Primary, plus Secondary Effect Poison
            // tail +19 (3d6+7 plus grab)                       Natural Attacks - Secondary
            // swarm (2d6 plus distraction and infestation)     Swarm Attacks
            
            // mwk greatsword +16/+11 (3d6+14/19–20)            Iterative Attacks

            let attack = attacks[j].replace(/^ | $/, "");
            let numberOfAttacks = 1;
            let enhancementBonus = 0;
            let attackName = "";
            let attackModifier = 0;
            let numberOfDamageDice = 0;
            let damageDie = 0;
            let damageBonus = 0;
            let damageModifier = 0;
            let damageType = "undefined";
            let weaponSpecial = "-";
            let critRange = 20;
            let critMult = 2;
            let attackEffects = "";
            let mwkWeapon = false;
            let numberOfIterativeAttacks = 0;
            let attackNotes = "";
                        
            // Check if its Melee or Ranged
            let attackAttrModifier = 0;
            if (attackType == "mwak") {
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
            if (attack.match(/(\b[a-zA-Z]+)(?:[ +0-9(/]+\()/) !== null) {
                attackName = attack.match(/(\b[a-zA-Z ]+)(?:[ +0-9(/]+\()/)[1].replace(/^ | $/g, "").replace(/\bmwk\b /i, "");
                
                // Special ActionType for swarmAttacks
                if (attackName.search(/\bSwarm\b/i) !== -1) {
                    attackType = "other";
                }
                
                attackNotes += attackName + " ";
            }
            
            // attackModifier
            if (attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\()/) !== null) {
                attackModifier = attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\()/)[1];
                attackNotes += attackModifier;
                // Subtract BAB, ATTR-MOD and SIZE-MOD
                attackModifier = +attackModifier - +formattedInput.bab - +enumSizeModifiers[formattedInput.size] - attackAttrModifier;
                                
                if (enhancementBonus !== 0) {
                    attackModifier = (attackModifier - enhancementBonus);
                } else if (enhancementBonus !== 0 && mwkWeapon === true) {
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
                    damageBonus = attack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1] - enhancementBonus;
                    attackNotes += damageBonus;
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
                                        
                    damagePool.forEach ( function ( damageComponent, index ) {
                        
                        let tempItem = damageComponent.split(/ plus /);
                        
                        tempItem.forEach ( function ( damageSubComponent, subIndex) {
                            
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
                                }
                            } else {
                                // If there is just a specialEffect
                                let specialEffect = damageSubComponent;
                                attackNotes += specialEffect;
                                attackEffects += specialEffect;
                            }

                            if (subIndex < tempItem.length-1) {
                                attackNotes += " plus ";
                                attackEffects += ", ";
                            }
                            
                        });

                    });
                    
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
                
                if (calculatedAttackModifier !== attackModifier) {
                    secondaryAttackModifier = +attackModifier - +calculatedAttackModifier;
                }
                
            }
            
            // Set the attackBonus: Modifier - secondaryAttackModifier 
            tempAttackItem.data.attackBonus = (+attackModifier - +secondaryAttackModifier).toString();
            
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
                let damageTypeRegex = new RegExp("(\\b" + attackName.replace(/\bmwk\b /i,"") + "\\b)", "ig");
            
                for (let i=0; i < tempAttackDamageTypeKeys.length; i++) {
                    if (tempAttackDamageTypeKeys[i].search(damageTypeRegex) !== -1) {
                        damageType = enumAttackDamageTypes[tempAttackDamageTypeKeys[i]].type;
                        weaponSpecial = enumAttackDamageTypes[tempAttackDamageTypeKeys[i]].special;
                        
                        // If the weapon has special properties, add that to the attackNotes
                        if (weaponSpecial !== "-") {
                            attackNotes += " [" + weaponSpecial + "]";
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
            
            dataOutput.items.push(tempAttackItem);

        } // End of Melee Attack
    } // End of Melee Attack Group
    
}

// Map Statistics to data.attributes
function mapStatisticData () {
    
    // Abilities
    let carryCapacity = 0;
    dataOutput.data.abilities.str.carryMultiplier = carrySizeModificators[formattedInput.size];
    dataOutput.data.abilities.str.carryBonus = 0;
    
    enumAttributes.forEach ( function (item, index) {
                
        if (formattedInput[item].total !== "-") {
            dataOutput.data.abilities[item].total = +formattedInput[item].total - +formattedInput[item].race;
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
    });
    
    // Finish Carry Capacity
    dataOutput.data.attributes.encumbrance.levels.light = Math.floor(1/3 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.medium = Math.floor(2/3 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.heavy = Math.floor(carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.carry = Math.floor(2 * carryCapacity);
    dataOutput.data.attributes.encumbrance.levels.drag = Math.floor(5 * carryCapacity);
    
    // BAB, CMB, CMD
    dataOutput.data.attributes.bab.total = "+" + +formattedInput.bab;
    dataOutput.data.attributes.cmb.total = "+" + +formattedInput.cmb;
    dataOutput.data.attributes.cmd.total = formattedInput.cmd;
    
    // Feats
    formattedInput.feats.forEach ( function (item, index) {
        setFeatItem(item);
    });
    
    // Skills
    let skillKeys = Object.keys(formattedInput.skills);
    
    for (let i = 0; i < skillKeys.length; i++) {
        
        let skillKey = skillKeys[i];
                        
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
                            
                        tempSkillKeys.forEach ( function (item, index) {
                            if (item === skillSubKey) {

                                
                                let tempSubAttrShort = tempAttrShort + (+index+1);
                                
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort] = JSON.parse(JSON.stringify(templateSubSkill));
                                
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].name = item;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].ability = dataOutput.data.skills[tempAttrShort].ability;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].rank = +subSkillTotal - +tempAttrModifier - +tempClassSkillModifier;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].notes = "";
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].mod = +subSkillTotal;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].rt = dataOutput.data.skills[tempAttrShort].rt;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].acp = dataOutput.data.skills[tempAttrShort].acp;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].cs = dataOutput.data.skills[tempAttrShort].cs;
                                dataOutput.data.skills[tempAttrShort].subSkills[tempSubAttrShort].value = dataOutput.data.skills[tempAttrShort].value;
                                
                            }
                            
                        });
  
                    }
                } else {
                    //Create a custom skill                    
                    let templateCustomSkill = {
                        "custom": {
                            "name": "custom",
                            "ability": "int",
                            "rank": 4,
                            "notes": "",
                            "mod": 4,
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
                    dataOutput.data.skills[customSkillName].rank = +formattedInput.skills[skillKey][skillSubKey];
                    dataOutput.data.skills[customSkillName].notes = "CHECK IF CORRECT";
                    dataOutput.data.skills[customSkillName].mod = +formattedInput.skills[skillKey][skillSubKey];
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
            if (formattedInput.skills[skillKey].total !== 0) {
                
                dataOutput.data.skills[tempAttrShort].rank = +formattedInput.skills[skillKey].total - +formattedInput.skills[skillKey].race - +tempAttrModifier - +tempClassSkillModifier;

                dataOutput.data.skills[tempAttrShort].mod = formattedInput.skills[skillKey].total - +formattedInput.skills[skillKey].race;
            }

        }
        
    }
    
    // Languages
    let tempKnownLanguages = [];
    let tempUnknownLanguages = "";
        
    if (formattedInput.languages) {
        formattedInput.languages.forEach ( function (item, index) {
            
            let tempItem = item.replace(/\+/i, "\\+");

            if (JSON.stringify(enumLanguages).search(tempItem.toLowerCase()) !== -1) {
                tempKnownLanguages.push(tempItem.toLowerCase());
            } else {
                tempUnknownLanguages += item + ", ";
            }

        });
    }
    
    dataOutput.data.traits.languages.value = tempKnownLanguages;
    dataOutput.data.traits.languages.custom = tempUnknownLanguages.replace(/, $/,"");
    
}

// Map Notes in HTML
function mapNotesData() {
    let tempNotes = "";
    
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
    if (formattedInput.special_qualities !== "") {
        let tempSpecialQualities = "<section id='defensiveAbilities'><h2>SPECIAL QUALITIES</h2>";
        tempSpecialQualities += "<p>";
        formattedInput.special_qualities.forEach ( function (item) {
            tempSpecialQualities += item + ", ";
        })
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
    game.actors.get(newActor.id).update(dataOutput);
    
    newActor.render(true);
    
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
        
    var output = inputText.replace(/(\d+d\d+)/, "[[$1]]");
    
    return output;
}
