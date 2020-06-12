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
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() { 
	console.log('sbc-pf1 | Initializing Statblock Converter Module');

	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings();
	
	// Preload Handlebars templates
    await preloadTemplates();

    MinorQOL.initSetup();
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
  hookRenderSBCButton();
});

// Add any additional hooks if necessary
function hookRenderSBCButton() {
        
    // Appends a button onto the actor directory to open the modal dialog.
    Hooks.on("renderActorDirectory", (app, html, data) => {
        console.log("HOOK RENDER ACTOR DIRECTORY");
        const importButton = $('<button class="create-entity sbc-button"><i class="fas fa-user"></i>Import Statblock</button>');
        html.find(".directory-footer").append(importButton);
        importButton.click((ev) => {
            //SBC.playlistImporter.playlistDirectoryInterface();
            console.log("CLICK!");
            statBlockConverterModalDialog.openModalDialog();
        });
    });
}



