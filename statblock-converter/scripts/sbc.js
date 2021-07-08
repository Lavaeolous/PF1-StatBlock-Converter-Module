/*
 * sbc | Statblock Converter for Pathfinder 1. Edition on FoundryVTT
 *
 * Author: Lavaeolous
 * Version: 3.3.1
 *
 */

import { registerSettings, initializeSettings, sbcSettings } from "./sbcSettings.js";
import { sbcInputDialog } from "./sbcInput.js";
import { sbcUtils } from "./sbcUtils.js";
import { sbcConfig } from "./sbcConfig.js";
import { initMapping } from "./sbcParsers.js";
import { sbcData } from "./sbcData.js";

/* ------------------------------------ */
/* sbc                          		*/
/* ------------------------------------ */

export class sbcApp {

    static async startSBC () {
        sbcConfig.options.debug && sbcUtils.log("Opening the input dialog")
        await sbcInputDialog.renderInputDialog()

    }

    /* ------------------------------------ */
    /* Reset and re-initialize sbc      	*/
    /* ------------------------------------ */

    static async resetSBC() {
        sbcConfig.options.debug && sbcUtils.log("Reset")

        // Reset data
        sbcUtils.resetData()

        // Reset errorLogging
        sbcUtils.resetErrorLog()

        // Reset input
        sbcUtils.resetInput()

        // Reset preview
        sbcUtils.resetPreview()

        // Reset flags
        sbcUtils.resetFlags()

        // Initialize sbc again
        await this.initializeSBC()
        
    }

    /* ------------------------------------ */
    /* Initialize sbc                      	*/
    /* ------------------------------------ */

    static async initializeSBC() {
        sbcConfig.options.debug && sbcUtils.log("Initializing sbc v" + sbcConfig.modData.version)

        let customFolderId = ""
        let customFolderName = game.settings.get(sbcConfig.modData.mod, "importFolder")
        let searchForExistingFolder = await game.folders.find(entry => entry.data.name === customFolderName && entry.data.type === "Actor")

        // Check, if a custom input folder still exists, as it could have been deleted after changing the module settings
        if(searchForExistingFolder === null || searchForExistingFolder === undefined) {
            let newFolder = await Folder.create({name: customFolderName, type:"Actor", color: "#e76f51", parent:null});
            let info = "sbc-pf1 | Created a custom folder for imported statblocks."
            ui.notifications.info(info)
            sbcConfig.options.debug && sbcUtils.log(info)
            customFolderId = newFolder.id
        } else {
            customFolderId = searchForExistingFolder.id
        }

        // Save the customFolderId
        sbcData.customFolderId = customFolderId

        // If the default actor is PC, change the value down the line
        let defaultActorType = +game.settings.get(sbcConfig.modData.mod, "defaultActorType")
        if (defaultActorType === 1) {
            sbcData.actorType = 1
        } else {
            sbcData.actorType = 0
        }

        
        let sbcActor = await sbcUtils.createTempActor()

        sbcData.characterData = {
            actorData: sbcActor,
            items: [],
            spells: [],
            abilityDescriptions: [],
            characterDescriptions: [],
            conversionValidation: {
                "context": {},
                "attributes": {},
                "skills": {},
                "spellBooks": {}
            }
        }
        

    }

}

/* ------------------------------------ */
/* Hooks            					*/
/* ------------------------------------ */

// Run when Foundry gets initialized
Hooks.once("init", async function() { 

    /* Why did i stop the enter propagation in the old sbc?
    window.addEventListener("keydown",function(e) {
        if(e.keyIdentifier=="U+000A" || e.keyIdentifier=="Enter") {
            if(e.target.id=="sbcInput") {
                e.stopPropagation()
                return false
            }
        }
    },true);
    */
   
    
});

// Do anything after initialization but before ready
Hooks.once("setup", function() {
    registerSettings()
});

// Do anything once the module is ready
Hooks.once("ready", async function() {
    
    await initializeSettings()
    sbcConfig.initializeConfig()
    initMapping();
});

// Render the sbcButton when the actorDirectory is visible
Hooks.on("renderActorDirectory", (app, html, data) => {
    sbcConfig.options.debug && sbcUtils.log("Rendering sbc button")  
    const startSBCButton = $("<button id='startSBCButton' class='create-entity sbcButton'><i class='fas fa-file-import'></i></i>sbc | Convert Statblock</button>");
    html.find(".directory-footer").append(startSBCButton)
    startSBCButton.click(async (ev) => {
        await sbcApp.initializeSBC()
        sbcApp.startSBC()
    });
    
});

// When the inputDialog gets closed, reset sbc
Hooks.on("closesbcInputDialog", (app, html, data) => {
    sbcApp.resetSBC()
})







