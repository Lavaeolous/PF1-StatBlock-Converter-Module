import { sbcUtils } from "./sbcUtils.js"
import { sbcConfig } from "./sbcConfig.js"

export class sbcSettings {

    // Toggle Debug Mode, which will post log data to the console
    static toggleDebugMode () {
        sbcConfig.options.debug && sbcUtils.log("Toggling debug mode")
        sbcConfig.options.debug = game.settings.get(sbcConfig.modData.mod, "debug")
    }

    // Updates the array of custom compendia, which is used to find items, feats, etc. with a higher priority then the pf1.compendia
    static updateCustomCompendiums (isInitializing = false) {
        sbcConfig.options.debug && sbcUtils.log("Updating custom compendiums")

        let customCompendiums = game.settings.get(sbcConfig.modData.mod, "customCompendiums")
        let validCompendiums = []
        let invalidCompendiums = []

        if (customCompendiums.length > 0) {

            // Replace semi-colons with commas
            customCompendiums = customCompendiums.replace(/;/g,",").split(",")
            
            // Get the names of all available compendiums
            let packKeys = Array.from(game.packs.keys())

            // Loop through the custom compendiums ...
            for(let i=0; i<customCompendiums.length; i++) {

                let customCompendium = customCompendiums[i].trim()
                
                // ... and check if its available
                if (!packKeys.includes(customCompendium)) {
                    // save invalid compendiums for the error message
                    invalidCompendiums.push(customCompendium)
                } else {
                    // save valid compendiums to overwrite the settings
                    validCompendiums.push(customCompendium)
                }
            }

            if(!isInitializing) {
                // If there are invalid compendiums, let the user know
                if (invalidCompendiums.length > 0) {
                    let error = "sbc-pf1 | Failed to add the following compendiums to sbc, please check for typos (" + invalidCompendiums.toString() + ")"
                    ui.notifications.error(error)
                    sbcConfig.options.debug && sbcUtils.log(error)
                } 

                if (validCompendiums.length > 0) {
                    let info = "sbc-pf1 | Added the following compendiums to sbc (" + validCompendiums.toString() + ")"
                    ui.notifications.info(info)
                    sbcConfig.options.debug && sbcUtils.log(info)
                }
            }
            
        }        
    }

    // Update the default folder into which statblocks get imported
    static async updateImportFolder () {
        sbcConfig.options.debug && sbcUtils.log("Updating custom import folder")
        
        // Get the custom folder name from the settings
        let customFolderName = game.settings.get(sbcConfig.modData.mod, "importFolder")
        
        if (customFolderName !== "") {

            let searchForExistingFolder = null

            try {
                searchForExistingFolder = await game.folders.find(entry => entry.data.name === customFolderName && entry.data.type === "Actor");
            } catch (err) {
                let info = "sbc-pf1 | Something went wrong while searching for an existing import folder."
                ui.notifications.info(info)
                sbcConfig.options.debug && sbcUtils.log(info)
            }

            if(searchForExistingFolder === null) {
                // No existing folder found
                let newFolder = await Folder.create({name: customFolderName, type:"Actor", color: "#e76f51", parent:null});
                
                let info = "Created a custom folder for imported statblocks."
                ui.notifications.info(info)
                sbcConfig.options.debug && sbcUtils.log(info)
                return newFolder._id
            } else {
                // Existing folder found
                return searchForExistingFolder._id
            }

        } else {
            // No custom import folder defined
        }
        
    }

    // Updates the default actor type
    static updateDefaultActorType () {
        sbcConfig.options.defaultActorType = game.settings.get(sbcConfig.modData.mod, "defaultActorType")
    }

    // Updates the input delay before updating the preview
    static updateInputDelay () {
        sbcConfig.options.inputDelay = game.settings.get(sbcConfig.modData.mod, "inputDelay")
    }

    // called by the module settings to set the prototype token defaults
    static updatePrototypeTokenSettings(tokenSetting, attributeKeys = []) {

        switch(tokenSetting) {
            case "disposition": {
                sbcConfig.options.tokenSettings.disposition = +game.settings.get(sbcConfig.modData.mod, "disposition")
                break
            }
            case "vision": {
                sbcConfig.options.tokenSettings.vision = game.settings.get(sbcConfig.modData.mod, "vision")
                break
            }
            case "displayName": {
                sbcConfig.options.tokenSettings.displayName = +game.settings.get(sbcConfig.modData.mod, "displayName")
                break
            }
            case "displayBars": {
                sbcConfig.options.tokenSettings.displayBars = +game.settings.get(sbcConfig.modData.mod, "displayBars")
                break
            }
            case "attributeBar1": {
                let attributeBar1Key = +game.settings.get(sbcConfig.modData.mod, "bar1")
                if (attributeBar1Key !== 0) {
                    let attributeBar1 = attributeKeys[attributeBar1Key]
                    sbcConfig.options.tokenSettings.bar1.attribute = "attributes." + attributeBar1
                } else {
                    sbcConfig.options.tokenSettings.bar1 = {}
                }
                break
            }
            case "attributeBar2": {
                let attributeBar2Key = +game.settings.get(sbcConfig.modData.mod, "bar2")
                if (attributeBar2Key !== 0) {
                    let attributeBar2 = attributeKeys[attributeBar2Key]
                    sbcConfig.options.tokenSettings.bar2.attribute = "attributes." + attributeBar2
                } else {
                    sbcConfig.options.tokenSettings.bar2 = {}
                }
                break
            }
            default: {
                let error = "sbc-pf1 | Default Token Settings: Could not set " + tokenSetting
                sbcUtils.log(error)
                break
            }
        }
        
    }
}

export const registerSettings = function () {

    // setup array for tokenBar attributes
    let attributeKeys = Object.keys(game.system.model.Actor.npc.attributes)
    attributeKeys.unshift("NONE")
    
    game.settings.register(sbcConfig.modData.mod, "debug", {
        name: "Enable Debug Mode",
        hint: "Enable the Debug Mode to get additional information in the console of your browser (F12). Default: False",
        default: false,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: _ => sbcSettings.toggleDebugMode()
    });

    game.settings.register(sbcConfig.modData.mod, "defaultActorType", {
        name: "Default Actor Type",
        hint: "Set the default actor type used by sbc. Default: NPC",
        default: 0,
        scope: "world",
        type: String,
        choices: {0:"NPC",1:"PC"},
        config: true,
        onChange: _ => sbcSettings.updateDefaultActorType()
    });

    game.settings.register(sbcConfig.modData.mod, "inputDelay", {
        name: "Input Delay",
        hint: "Set the delay in ms before changes in the input field trigger an update of the preview. Default: 750",
        default: 750,
        scope: "world",
        type: Number,
        range: {min: 250, max: 2000, step: 10},
        config: true,
        onChange: _ => sbcSettings.updateInputDelay()
    });
    
    game.settings.register(sbcConfig.modData.mod, "importFolder", {
        name: "Import Folder",
        hint: "You can save imported actors to a separate folder in the actor directory. If no folder with this name is available, a new one will be created. Default: 'sbc | Imported Statblocks'.",
        default: "sbc | Imported Statblocks",
        scope: "world",
        type: String,
        config: true,
        onChange: _ => sbcSettings.updateImportFolder()
    });

    game.settings.register(sbcConfig.modData.mod, "customCompendiums", {
        name: "Custom Compendiums",
        hint: "Select custom compendiums to be included in the conversion process, separated by comma or semicolon. Default: NONE (Format: <scope>.<compendiumName>, e.g. 'world.myFeats). You can check available compendiums by entering 'game.packs' into the console",
        default: "",
        scope: "world",
        type: String,
        config: true,
        onChange: _ => sbcSettings.updateCustomCompendiums()
    });

    game.settings.register(sbcConfig.modData.mod, "vision", {
        name: "Vision",
        hint: "Define if tokens have Vision activated. Default: True",
        default: true,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("vision")
    });

    game.settings.register(sbcConfig.modData.mod, "disposition", {
        name: "Disposition",
        hint: "Define the disposition of created tokens (which results in differently colored token borders). Default: Hostile",
        default: "-1",
        scope: "world",
        type: String,
        choices: {"-1": "Hostile", "0": "Neutral", "1": "Friendly"},
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("disposition")
    });

    game.settings.register(sbcConfig.modData.mod, "displayName", {
        name: "Name Visibility",
        hint: "Define the visibility of the token name. Default: Owner Hover",
        default: 20,
        scope: "world",
        type: String,
        choices: {0: "none", 10: "control", 20: "owner_hover", 30: "hover", 40: "owner", 50: "always"},
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("displayName")
    });

    game.settings.register(sbcConfig.modData.mod, "displayBars", {
        name: "Bar Visibility",
        hint: "Define the visibility of the token bars. Default: Owner Hover",
        default: 20,
        scope: "world",
        type: String,
        choices: {0: "none", 10: "control", 20: "owner_hover", 30: "hover", 40: "owner", 50: "always"},
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("displayBars")
    });

    game.settings.register(sbcConfig.modData.mod, "bar1", {
        name: "Attribute Bar 1",
        hint: "Define the attribute of the first bar. Default: hp",
        default: "24",
        scope: "world",
        type: String,
        choices: attributeKeys,
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("attributeBar1", attributeKeys)
    });

    game.settings.register(sbcConfig.modData.mod, "bar2", {
        name: "Attribute Bar 2",
        hint: "Define the attribute of the second bar. Default: NONE",
        default: "0",
        scope: "world",
        type: String,
        choices: attributeKeys,
        config: true,
        onChange: _ => sbcSettings.updatePrototypeTokenSettings("attributeBar2", attributeKeys)
    });
    
}

export const initializeSettings = async function () {

    // setup array for tokenBar attributes
    let attributeKeys = Object.keys(game.system.model.Actor.npc.attributes)
    attributeKeys.unshift("NONE")

    sbcConfig.options.actorReady = false
    sbcConfig.options.debug = game.settings.get(sbcConfig.modData.mod, "debug")
    sbcConfig.options.defaultActorType = game.settings.get(sbcConfig.modData.mod, "defaultActorType")
    sbcConfig.options.inputDelay = game.settings.get(sbcConfig.modData.mod, "inputDelay")
    sbcConfig.options.tokenSettings.disposition = game.settings.get(sbcConfig.modData.mod, "disposition")
    sbcConfig.options.tokenSettings.displayName = game.settings.get(sbcConfig.modData.mod, "displayName")
    sbcConfig.options.tokenSettings.displayBars = game.settings.get(sbcConfig.modData.mod, "displayBars")
    sbcConfig.options.customFolder = game.settings.get(sbcConfig.modData.mod, "importFolder")

    sbcSettings.updatePrototypeTokenSettings("attributeBar1", attributeKeys)
    sbcSettings.updatePrototypeTokenSettings("attributeBar2", attributeKeys)
    sbcSettings.updateCustomCompendiums(true)
    
    sbcConfig.options.debug && sbcUtils.log("Initialized Settings:")
    sbcConfig.options.debug && console.log(sbcConfig.options)
    
}
