import { sbcApp } from "./sbc.js";
import { sbcConfig } from "./sbcConfig.js"
import { sbcData, sbcError, sbcErrorLevels } from "./sbcData.js"
import { sbcMapping } from "./sbcParsers.js"

export class sbcUtils {
    static openingBrackets = ['(', '[', '{'];
    static closingBrackers = [')', ']', '}'];
    static matchingClosingBrackets = {'(': ')', '[' : ']', '{': '}'};
    static uncapitals = ["a", "an", "the", "for", "and", "nor", "but", "or", "yet", "so", "at", "around", "by", "after", "for", "from", "of", "on", "to", "with", "without"];
    

    static async createTempActor () {

        let tempActor = await Actor.create({
            name: "sbc | Actor Template",
            type: sbcConfig.const.actorType[sbcData.actorType],
            //_id: randomID(16),
            folder: sbcData.customFolderId
        }, {temporary: true})

        return tempActor
    }

    /* ------------------------------------ */
    /* Resetting and Updating               */
    /* ------------------------------------ */

    static resetData () {
        sbcData.errors = []
        sbcData.input = ""
        sbcData.preparedInput = {}
        sbcData.parsedInput = {}
        sbcData.characterData = {}
        sbcData.notes = {}
        this.resetCategoryCounter()
    }

    static resetCategoryCounter () {
        sbcData.foundCategories = 0
        sbcData.parsedCategories = 1
    }

    static async reinitActor() {
        sbcData.characterData = {
            actorData: await sbcUtils.createTempActor(),
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

    static async resetCharacterData() {
        await this.reinitActor();

        this.resetCategoryCounter()
        await this.resetTraits()
        await this.resetTokenData()
    }

    static async resetTraits() {
        // Reset traits
        return sbcData.characterData.actorData.updateSource({
            traits: {
                cres: "",
                eres: "",
                eres: "",
                senses: "",
                size: "",
                stature: "",
                dr: "",
                regen: "",
                fastHealing: "",
                ci: {
                    custom: "",
                    value:[],
                },
                di: {
                    custom: "",
                    value:[],
                },
                dv: {
                    custom: "",
                    value:[],
                },
                languages: {
                    custom: "",
                    value:[],
                }
            }
        });
    }

    static async resetTokenData () {
        return sbcData.characterData.actorData.updateSource({
            prototypeToken: {
                displayName: sbcConfig.options.tokenSettings.displayName,
                sight: {
                    enabled: sbcConfig.options.tokenSettings.sight.enabled
                },
                disposition: sbcConfig.options.tokenSettings.disposition,
                displayBars: sbcConfig.options.tokenSettings.displayBars,
                bar1: sbcConfig.options.tokenSettings.bar1,
                bar2: sbcConfig.options.tokenSettings.bar2,
                brightSight: 0
            }
        })
    }

    static resetFlags () {
        sbcConfig.options.flags = {
            noStr: false,
            noDex: false,
            noCon: false,
            noInt: false,
            noWis: false,
            noCha: false,
            isUndead: false,
            hasWeaponFinesse: false
        }
    }

    static resetErrorLog () {
        sbcData.errors = []
        let errorArea = $(".sbcErrorContainer #sbcErrors")
        errorArea.html("")
        this.updateErrorArea()
    }

    static resetInput() {
        let inputArea = $(".sbcContainer #sbcInput")
        this.resetHighlights()
        inputArea.val(null)
        
    }

    static resetHighlights () {
        let highlights = $("#sbcHighlights")
        highlights.html("")
    }
    
    static resetPreview() {
        let previewArea = $(".sbcContainer #sbcPreview")
        previewArea.html("")
    }

    static resetNotes() {
        sbcData.notes = {}
    }

    static async updatePreview() {
        this.resetPreview()
        let previewArea = $(".sbcContainer #sbcPreview")
        console.log(sbcData.characterData.actorData)
        let preview = await renderTemplate('modules/pf1-statblock-converter/templates/sbcPreview.hbs' , {data: sbcData.characterData.actorData, notes: sbcData.notes })
        previewArea.append(preview)
    }

    static updateErrorArea() {
        sbcUtils.logErrors()
    }

    static async updateActorType() {

        let actorTypeToggle = $(".actorTypeToggle")

        if (sbcData.actorType === 0) {
            sbcData.actorType = 1
            actorTypeToggle.addClass("createPC")
        } else {
            sbcData.actorType = 0;
            actorTypeToggle.removeClass("createPC")
        }
        
        sbcData.characterData.actorData.updateSource({
            type: sbcConfig.const.actorType[sbcData.actorType]
        });

    }

    /* ------------------------------------ */
    /* ProgressBar Related Stuff            */
    /* ------------------------------------ */

    /*
     * TOTAL = 1
     * "preparation" = 0.1
     * "parsing" = 0.6
     * "entityCreation" = 0.2
     * "checkFlags" =  0.05
     * "generateNotes" = 0.05
     */

    static async updateProgressBar (process = "", subProcess = "", total = 1, step = 1) {

        let widthPreparation = 0.10
        let widthParsing = 0.60
        let widthEntities = 0.20
        let widthFlags =  0.05
        let widthPreview = 0.05

        let progressBar = $( "#sbcProgressBar" )
        let progressBarValue = $( "#sbcProgressValue" )
        let increment = 100 / total

        let newWidth = 0
        let progressBarText = ""

        switch (process.toLowerCase()) {
            case "preparation":
                progressBar.removeClass("ready")
                newWidth = Math.floor( widthPreparation * increment * step )
                progressBarText = process + ": " + subProcess
                break
            case "parsing":
                newWidth = Math.floor( 100 * ( widthPreparation ) + widthParsing * increment * step )
                progressBarText = process + ": " + subProcess
                break
            case "entities":
                newWidth = Math.floor( 100 * ( widthParsing + widthPreparation ) + widthEntities * increment * step )
                progressBarText = subProcess
                break
            case "flags":
                newWidth = Math.floor( 100 * ( widthEntities + widthParsing + widthPreparation ) + widthFlags * increment * step )
                progressBarText = subProcess
                break
            case "preview":
                newWidth = Math.floor( 100 * ( widthFlags + widthEntities + widthParsing + widthPreparation ) + widthPreview * increment * step )
                progressBarText = subProcess
                break
            case "actor":
                newWidth = 100
                progressBarText = subProcess
                progressBar.addClass("ready")
            default:
                break
        }

        progressBar.css("width", newWidth + "%")
        progressBarValue.empty().append(progressBarText)
    }
        

    /* ------------------------------------ */
    /* Log to the console and errorArea     */
    /* ------------------------------------ */

    static log(message) {
        sbcConfig.options.debug && console.log("sbc-pf1 | " + message);
    }

    static logErrors() {

        if (sbcData.errors.length > 0) {

            let errorLines = []

            let errorArea = $(".sbcErrorContainer #sbcErrors")
            errorArea.empty()
            errorArea.append("There were " + sbcData.errors.length + " issue(s) parsing the provided statblock:<br/>")

            let lastText = ""
            let lastId = 0
            let duplicateErrors = 2

            this.log("> There were " + sbcData.errors.length + " issue(s) parsing the provided statblock:");
            
            // Loop over all errors and create error messages as well as highlight problematic areas in the input
            for(let i=0; i<sbcData.errors.length; i++) {

                let error = sbcData.errors[i]

                let id = "sbcError-" + i
                let level = sbcErrorLevels[error.level]
                let keyword = error.keyword
                let text = error.message
                let line = error.line
                let message = level
                if (error.level < 2) {
                    message += " >> " + keyword + " failed "
                }
                message += " >> " + text

                if (text == lastText) {

                    let duplicateErrorIndicator = $("#" + lastId)
                    duplicateErrorIndicator.text(duplicateErrors)

                    duplicateErrorIndicator.addClass("active")
                    duplicateErrors++

                } else {

                    // Create a new error message in the error area
                    lastId = id
                    lastText = text
                    let errorMessage = `<div draggable='false' class='sbcErrors ${id}'><span id='${id}' class='identicalErrorIndicator'>${duplicateErrors}</span>${message}</div>`
                    this.log("> " + text)
                    
                    errorArea.append(errorMessage)
                    duplicateErrors = 2

                    if (line !== -1) errorLines.push(line)
                    
                }
   
            }
            
            // Highlight the lines, in which an error occured
            if (sbcData.preparedInput.data) {
                let highlights = $("#sbcHighlights")
                let inputArea = $("#sbcInput")
                let highlightedText = this.applyHighlights(errorLines)

                inputArea.scrollTop(0)
                highlights.html(highlightedText)
            }

        }
        
    }

    /* ------------------------------------ */
    /* Compendiums and Entities             */
    /* ------------------------------------ */

    static async findEntityInCompendium(compendium, input, line = -1) {

        // Create an array for all compendiums to search through
        let searchableCompendiums = []

        // Push the default compendium given when calling findEntityInCompendium
        if (compendium !== null) {
            searchableCompendiums.push(compendium)
        }
        
        // If there are customCompendiums, given as a string in the module settings,
        // split them and add them to the searchableCompendiums
        let customCompendiums = []
        let customCompendiumSettings = game.settings.get(sbcConfig.modData.mod, "customCompendiums")

        if (customCompendiumSettings !== "") {
            customCompendiums = customCompendiumSettings.split(/[,;]/g)
            searchableCompendiums = customCompendiums.concat(searchableCompendiums)
        }
                
        let searchResult = {}
        let foundEntity = {}
        
        let searchOptions = {
            "packs" : searchableCompendiums
        }

        searchResult = await globalThis.pf1.utils.findInCompendia(input.name, searchOptions)

        // Return the searchResult, which either is a clone of the found entity or null
        if (searchResult !== false) {
            let packName = searchResult.pack.metadata.id;

            let pack = await game.packs.get(packName);
            foundEntity = await pack.getDocument(searchResult.index._id);

            let clone = await Item.create(foundEntity, {temporary: true})
            return clone;

        } else {
            return null
        }

    }

    static async generatePlaceholderEntity (input, line = -1) {
        // If the input is NOT found in any of the given compendiums, create a placeholder

        let entityData = {
            name: input.name ? input.name : "undefined",
            type: input.type ? input.type : null,
            
            // Creature-related
            creatureType: input.creatureType ? input.creatureType : null,
            subTypes: input.subTypes ? input.subTypes : null,
            img: input.img ? input.img : "systems/pf1/icons/skills/yellow_36.jpg",
            
            // Gear-related
            subtext: input.subtext ? input.subtext : null,
            currency: input.currency ? input.currency : null,
            enhancement: input.enhancement ? input.enhancement : null,
            mwk: input.mwk ? input.mwk : null,
            
            // Class-related
            wizardClass: input.wizardClass ? input.wizardClass : null,
            suffix: input.suffix ? input.suffix : null,
            archetype: input.archetype ? input.archetype : null,
            level: input.level ? input.level : null,

            // Ability-related
            specialAbilityType: input.specialAbilityType ? input.specialAbilityType : null,
            desc: input.desc ? input.desc : "sbc | Placeholder"

            // Spell-related
            // WIP
            
        }

        let entity = null

        switch (input.type) {
            case "container":
                entity = await Item.create({
                    _id: randomID(16),
                    name: "Money Pouch: " + sbcUtils.capitalize(entityData.name),
                    type: "container",
                    data: {
                        description: {
                            value: "sbc | All currency carried was put into this container."
                        },
                        currency: {
                            pp: entityData.currency.pp,
                            gp: entityData.currency.gp,
                            sp: entityData.currency.sp,
                            cp: entityData.currency.cp
                        }
                    },
                    img: "systems/pf1/icons/items/inventory/pouch-sealed.jpg"
                }, {temporary:true})
                break
            case "feats":
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: "feat",
                    data: {
                        description: {
                            value: "sbc | As " + entityData.name + " could not be found in any compendium, a placeholder was generated."
                        },
                        
                    },
                    img: entityData.img
                }, {temporary:true})
                break
            case "race":
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: "race",
                    data: {
                        description: {
                            value: "sbc | As no playable race was found a placeholder was generated."
                        },
                        creatureType: entityData.creatureType,
                        subTypes: entityData.subTypes
                    },
                    img: entityData.img
                }, {temporary:true})
                break
            case "misc":
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: "feat",
                    data: {
                        description: {
                            value: entityData.desc
                        },
                        featType: "misc"
                    },
                    img: entityData.img
                }, {temporary:true})
                break
            case "attack":
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: "attack",
                    data: {
                        description: {
                            value: entityData.desc
                        },
                        attackType: "misc"
                    },
                    img: entityData.img
                }, {temporary:true})
                break
            case "classFeat":
            case "class-abilities":
                if (entityData.specialAbilityType !== null) {
                    entity = await Item.create({
                        _id: randomID(16),
                        name: sbcUtils.capitalize(entityData.name),
                        type: "feat",
                        data: {
                            abilityType: entityData.specialAbilityType,
                            description: {
                                value: entityData.desc
                            },
                            featType: "classFeat"
                        },
                        img: entityData.img
                    }, {temporary:true})
                } else {
                    entity = await Item.create({
                        _id: randomID(16),
                        name: sbcUtils.capitalize(entityData.name),
                        type: "feat",
                        data: {
                            abilityType: "",
                            description: {
                                value: entityData.desc
                            },
                            featType: "classFeat"
                        },
                        img: entityData.img
                    }, {temporary:true})
                }
                break
            case "domains":
            case "mysteries":
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: "feat",
                    data: {
                        description: {
                            value: "sbc | As there is no dedicated field for " + entityData.type + ", this placeholder was created."
                        },
                        featType: "classFeat"
                    },
                    img: entityData.img
                }, {temporary:true})
                break
            default:
                entity = await Item.create({
                    _id: randomID(16),
                    name: sbcUtils.capitalize(entityData.name),
                    type: entityData.type,
                    data: {
                        description: {
                            value: "sbc | As " + entityData.name + " could not be found in any compendium, a placeholder was generated."
                        }
                    },
                    img: entityData.img
                }, {temporary:true})
                break
        }

        return entity
    }

    /* ------------------------------------ */
    /* Conversion Validation                */
    /* ------------------------------------ */

    static async conversionValidation(actorID) {
        sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | Conversion Validation")
        
        try {

            const actor = await game.actors.get(actorID)

            const conversionValidation = sbcData.characterData.conversionValidation

            const stage1changes = [], stage2changes = []
            let contextNotes = []

            let valueInAcTypes = 0

            // Validate the spellBooks
            let spellBooksToValidate = Object.keys(conversionValidation.spellBooks)
            const bookUpdates = {};
            for (let i=0; i<spellBooksToValidate.length; i++) {
                let spellBookToValidate = spellBooksToValidate[i]
                let casterLevelToValidate = conversionValidation.spellBooks[spellBookToValidate].casterLevel
                let concentrationBonusToValidate = conversionValidation.spellBooks[spellBookToValidate].concentrationBonus
                let casterLevelInActor = actor.system.attributes.spells.spellbooks[spellBookToValidate].cl.total

                let spellCastingAbility = actor.system.attributes.spells.spellbooks[spellBookToValidate].ability
                let spellCastingAbilityModifier = actor.system.abilities[spellCastingAbility].mod
                
                const concentrationBonusOnActor = actor.system.attributes.spells.spellbooks[spellBookToValidate].concentration.total;

                let differenceInCasterLevel = +casterLevelToValidate - +casterLevelInActor
                let differenceInConcentrationBonus = +concentrationBonusToValidate - concentrationBonusOnActor
                
                if (differenceInCasterLevel !== 0) {
                    bookUpdates[`data.attributes.spells.spellbooks.${spellBookToValidate}`] = {
                        cl: {
                            formula: differenceInCasterLevel.toString()
                        },
                        concentrationFormula: differenceInConcentrationBonus.toString()
                    }
                }
            }

            if (!isEmpty(bookUpdates)) {
                await actor.update(bookUpdates);
            }

            // Validate ability scores first as they can have cascading effects
            const abilityScoreKeys = ["str", "dex", "con", "int", "wis", "cha"];
            for (let abl of abilityScoreKeys) {
                const totalInActor = actor.system.abilities[abl].total
                let totalInStatblock = conversionValidation.attributes[abl.capitalize()]
                const difference = +totalInStatblock - +totalInActor
                if (difference === 0) continue;

                if (difference !== 0) {

                    let attributeChange = {
                        formula: difference.toString(),
                        modifier: "untypedPerm",
                        operator: "add",
                        priority: 0,
                        subTarget: abl,
                        target: "ability",
                        value: +difference,
                        id: randomID(16)
                    }

                    stage1changes.push(attributeChange)
                }
            }

            // Stage 1 conversion buff to allow ability score cascading effects to not interfere with other corrections
            // This might be better off as direct modification to the actor, however.
            if (stage1changes.length) {
                let conversionBuffItem1 = {
                    name: "sbc | Conversion Buff (Ability Scores)",
                    type: "buff",
                    data: {
                        description: {
                            value: `<h2>sbc | Conversion Buff (Ability Scores)</h2>
                            This Buff was created by <strong>sbc</strong> to compensate for differences between the statblock input and FoundryVTTs automatically calculated values.
                            <br><br>
                            As differences in ability scores can have cascading effects, these get handled first and in a separate conversion buff.`
                        },
                        active: true,
                        buffType: "perm",
                        changes: stage1changes,
                        hideFromToken: true,
                        level: 0,
                        tag: "sbcConversionBuff1",
                        useCustomTag: true,
                    },
                    img: "systems/pf1/icons/skills/yellow_36.jpg"
                };

                await actor.createEmbeddedDocuments("Item", [conversionBuffItem1]);
            }

            // Get an array of all attributes that need to be validated
            let attributesToValidate = Object.keys(conversionValidation.attributes);
            // And push "acNormal", "acTouch" and "acFlatFooted" to the end of that array so it gets validated after the acTypes
            attributesToValidate.splice(attributesToValidate.indexOf("acNormal"),1)
            attributesToValidate.splice(attributesToValidate.indexOf("acTouch"),1)
            attributesToValidate.splice(attributesToValidate.indexOf("acFlatFooted"),1)
            attributesToValidate.push("acNormal", "acTouch", "acFlatFooted")

            // Get an array of all items the actor currently owns
            let currentItems = await actor.items
     
            //let currentItemsKeys = Object.keys(currentItems)
            let currentItemsKeys = currentItems//.keys()

            // Loop through the attributes ...
            for (let i=0; i<attributesToValidate.length; i++) {
                let attribute = attributesToValidate[i]
                let modifier = ""
                let target = ""
                let subTarget = ""
                let totalInStatblock = conversionValidation.attributes[attribute]
                let totalInActor = 0
                let valueInItems = 0
                let difference = 0

                // (1) ... and loop through the current items looking for relevant changes
                for (let i=0; i<currentItemsKeys.length; i++) {
                    
                    let currentItemKey = currentItemsKeys[i]
                    let currentItem = currentItems[currentItemKey]
                    let currentItemChanges = currentItem.data.changes

                    // Check, if the currentItem has changes to be considered
                    if (Array.isArray(currentItemChanges) && currentItemChanges.length) {
                        
                        let currentItemChange = currentItemChanges.find( function (element) {

                            if(element.subTarget === attribute.toLowerCase()) {
                                return element
                            }
                        })

                        // If the item had changes relevant to the current attribute,
                        // add these to valueInItems
                        if (currentItemChange !== undefined) {
                            valueInItems += +currentItemChange.formula
                        }

                    }

                }

                // Generate Changes for the conversionBuff
                switch (attribute.toLowerCase()) {
                    case "str":
                    case "dex":
                    case "con":
                    case "int":
                    case "wis":
                    case "cha":
                        // Ignore here
                        break
                    case "cmd":
                    case "cmb":
                    case "init":
                        totalInActor = actor.system.attributes[attribute].total
                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = attribute
                        if (totalInActor !== totalInStatblock) {
                            difference = +totalInStatblock - +totalInActor
                        }
                        break
                    case "hpbonus":
                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = "mhp"
                        difference = +totalInStatblock
                        break
                    case "hptotal":
                        totalInActor = actor.system.attributes.hp.max

                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = "mhp"
                        
                        difference = +totalInStatblock - +totalInActor

                        break
                    case "acnormal":
                        totalInActor = actor.system.attributes.ac.normal.total
                        modifier = "untypedPerm"
                        target = "ac"
                        subTarget = "aac"
                        difference = +totalInStatblock - +totalInActor - +valueInAcTypes
                        break
                    case "base":
                    case "enhancement":
                    case "dodge":
                    case "inherent":
                    case "deflection":
                    case "morale":
                    case "luck":
                    case "sacred":
                    case "insight":
                    case "resistance":
                    case "profane":
                    case "trait":
                    case "racial":
                    case "competence":
                    case "circumstance":
                    case "alchemical":
                    case "penalty":
                        modifier = attribute
                        target = "ac"
                        subTarget = "ac"
                        difference = +totalInStatblock - +valueInItems
                        valueInAcTypes += +totalInStatblock
                        break
                    case "rage":
                        modifier = "untypedPerm"
                        target = "ac"
                        subTarget = "ac"
                        difference = +totalInStatblock
                        break
                    case "fort":
                    case "ref":
                    case "will":
                        modifier = "untypedPerm"
                        target = "savingThrows"
                        subTarget = attribute
                        totalInActor = actor.system.attributes.savingThrows[attribute].total ?? 0
                        difference = +totalInStatblock - +totalInActor
                        break
                    default:
                        break
                }

                // If the total in the statblock differs from the total in foundry, add a change to the conversion buff
                if (difference !== 0) {

                    let attributeChange = {
                        formula: difference.toString(),
                        modifier: modifier,
                        operator: "add",
                        priority: 0,
                        subTarget: subTarget,
                        target: target,
                        value: +difference,
                        id: randomID(16)
                    }

                    stage2changes.push(attributeChange)
                }

            }

            // Add context notes to the buff
            let contextNotesToAdd = Object.keys(conversionValidation.context)

            for (let i=0; i<contextNotesToAdd.length; i++) {
                let contextNoteType = contextNotesToAdd[i]
                let contextNoteToAdd = conversionValidation.context[contextNoteType]

                if (contextNoteToAdd !== "") {
                    let contextNote = {
                        subTarget: contextNoteType,
                        target: "misc",
                        text: contextNoteToAdd
                    }
                    contextNotes.push(contextNote)
                }

            }

            // Handle Skill Information in the conversionValidation
            // (1) Create skillContext Objects to add to the Buff
            // (2) Adjust for differences between calculated skillTotals and statblockTotals
            let skillKeys = Object.keys(conversionValidation.skills)
            
            for (let i=0; i<skillKeys.length; i++) {

                let skillKey = skillKeys[i]
                let parentSkillKey = skillKey.replace(/(\d+)/, "")
                let skillToValidate = conversionValidation.skills[skillKey]
                let skillModInActor = 0
                
                let skillSubKeys = Object.keys(actor.system.skills[parentSkillKey])

                // For Skills with subskill --> subTarget: "skill.prf.subSkills.prf1"
                let subTarget = ""

                if (!skillSubKeys.includes("subSkills")) {
                    const skInfo = actor.getSkillInfo(skillKey);
                    skillModInActor = skInfo.mod ?? 0
                    subTarget = "skill." + skillKey
                } else {
                    const subSkillInfo = actor.getSkillInfo(`${parentSkillKey}.subSkills.${skillKey}`);
                    skillModInActor = subSkillInfo.mod ?? 0
                    subTarget = "skill." + parentSkillKey + ".subSkills." + skillKey
                }

                // (1) Create skillContext Objects to add to the Buff
                if (skillToValidate.context !== "") {
                    let contextNote = skillToValidate.context
                    let skillContext = {
                        subTarget: subTarget,
                        target: "skill",
                        text: contextNote
                    }
                    contextNotes.push(skillContext)
                }

                // (2) Adjust for differences between calculated skillTotals and statblockTotals
                if (+skillToValidate.total !== +skillModInActor) {
                    let difference = +skillToValidate.total - +skillModInActor
                    
                    if (difference !== 0) {
                        let skillChange = {
                            formula: difference.toString(),
                            modifier: "untypedPerm",
                            operator: "add",
                            priority: 0,
                            subTarget: subTarget,
                            target: "skill",
                            value: +difference,
                            id: randomID(16)
                        }
                        stage2changes.push(skillChange)
                    }
                    
                }

            }

            // Create the conversionBuffItem as an embedded entity
            /*let conversionBuffItem = await Item.create({
                "name": "sbc | Conversion Buff",
                "type": "buff",
                "data": {
                    "description": {
                        "value": `<h2>sbc | Conversion Buff</h2>
                        This Buff was created by <strong>sbc</strong> to compensate for differences between the input and the values FoundryVTT calculates automatically.
                        <br><br>
                        Especially when the pathfinder system gets upgraded, entries in compendiums get updated or foundry changes in some way, this buff may become outdated.
                        <br><br>
                        For most mooks the conversion should more or less work, but for important NPCs or creatures it is adviced to double check the conversion manually.`
                    },
                    "active": true,
                    "buffType": "perm",
                    "changeFlags": {
                        "heavyArmorFullSpeed": false,
                        "loseDexToAC": false,
                        "mediumArmorFullSpeed": false,
                        "noDex": false,
                        "noEncumbrance": false,
                        "noStr": false,
                        "oneCha": false,
                        "oneInt": false,
                        "oneWis": false
                    },
                    "changes": changes,
                    "contextNotes": contextNotes,
                    "hideFromToken": true,
                    "level": 0,
                    "links": {children: Array(0)},
                    "tag": "sbcConversionBuff",
                    "tags": [],
                    "useCustomTag": true,
                    "uses": {value: 0, max: 0}
                },
                "img": "systems/pf1/icons/skills/yellow_36.jpg"
            }, { temporary : true })
            */

            let conversionBuffItem2 = {
                name: "sbc | Conversion Buff",
                type: "buff",
                data: {
                    description: {
                        value: `<h2>sbc | Conversion Buff</h2>
                        This Buff was created by <strong>sbc</strong> to compensate for differences between the input and the values FoundryVTT calculates automatically.
                        <br><br>
                        Especially when the pathfinder system gets upgraded, entries in compendiums get updated or foundry changes in some way, this buff may become outdated.
                        <br><br>
                        For most mooks the conversion should more or less work, but for important NPCs or creatures it is adviced to double check the conversion manually.`
                    },
                    active: true,
                    buffType: "perm",
                    changes: stage2changes,
                    contextNotes: contextNotes,
                    hideFromToken: true,
                    level: 0,
                    tag: "sbcConversionBuff2",
                    useCustomTag: true,
                },
                img: "systems/pf1/icons/skills/yellow_36.jpg"
            };

            await actor.createEmbeddedDocuments("Item", [conversionBuffItem2]);
            
            Hooks.callAll("sbc.validated", actor);
            
        } catch (err) {

            let errorMessage = "Failed to validate the conversion and create a conversion buff"
            let error = new sbcError(1, "Validation", errorMessage)
            sbcData.errors.push(error)
            throw err

        }

        sbcConfig.options.debug && console.groupEnd()

    }

    /* ------------------------------------ */
    /* Workers                              */
    /* ------------------------------------ */

    static sbcSplit(input) {
        // Split the input string at commas, excluding commas in parenthesis, and return an array of the items

        let items = []
        
        // Remove Commas in large Numbers, e.g. 3,000 GP --> 3000 GP
        let tempInput = input.replace(/(\d{1})(,)(\d{1})/g, "$1$3").trim()

        // Check if there are commas or semicolons
        if (tempInput.search(/,|;/g) !== -1) {

            // Check if there are parenthesis including commas in the input
            if (tempInput.match(/([^,;]+\([^(]+?(?:,|;)[^(]+?\))+?/gi) !== null) {
                // Get the input with parenthesis and commas inside the parenthesis
                let itemsWithCommasInParenthesis = tempInput.match(/([^,;]+\([^(]+?(?:,|;)[^(]+?\)[^,]*)+?/gi)
                let itemsWithCommasInParenthesisKeys = Object.keys(itemsWithCommasInParenthesis)
                
                for (let i=0; i<itemsWithCommasInParenthesisKeys.length; i++) {

                    let tempKey = itemsWithCommasInParenthesisKeys[i]
                    let tempItem = itemsWithCommasInParenthesis[tempKey].trim()

                    let patternTempItem = new RegExp (tempItem.replace(/\(/g,"\\(").replace(/\*/g,"\\*").replace(/\)/g,"\\)").replace(/\+/g,"\\+"), "i")

                    tempInput = tempInput.replace(patternTempItem, "").replace(/,\s*,/, ",").replace(/^,/, "").trim()

                    items.push(tempItem)

                }

                // Add any items without parenthesis back into the "items"-array
                let itemsWithoutParenthesis = []

                if (tempInput !== "") {
                    itemsWithoutParenthesis = tempInput.replace(/,\s*,/, ",").replace(/[;,]\s*$/, "").split(/[,;]/g)
                }
                
                if (itemsWithoutParenthesis.length > 0) {
                    //items = items.concat(...itemsWithoutParenthesis)
                    items = itemsWithoutParenthesis.concat(...items)
                }                

            } else {

                // If there are no parenthesis with commas, just split at commas/semi-colons
                items = tempInput.split(/[,;]/g)

            }

        } else {

            // When there is only one item, split at the first closing bracket and put it into the array
            items = tempInput.replace(/\)\s/, ");").split(/;/)

        }

        return items

    }

    // 
    static parseSubtext(value) {

        // Remove punctuation at the end of the input
        let input = value.replace(/(^[,;.: ]*|[,;.: ]+$)/g, "")

        let startSubtextIndex = input.indexOf('(')
        let endSubtextIndex = input.indexOf(')')

        if (startSubtextIndex > -1 && endSubtextIndex > startSubtextIndex) {
            let baseValue = input.substring(0, startSubtextIndex).trim()
            let subValue = input.substring(startSubtextIndex+1, endSubtextIndex).trim()
            let restValues = []
            
            // Check, if there is something left and parse that again
            if (endSubtextIndex+1 < input.length) {
                let rest = input.substring(endSubtextIndex+1).replace(/(^[,;.: ]*|[,;.: ]+$)/g, "").trim()
                restValues = this.parseSubtext(rest)
            }

            if (!Array.isArray(restValues) || !restValues.length) {
                return [baseValue, subValue]
            } else {
                return [baseValue, subValue, restValues]
            }
            
        } else {
            return [value]
        }
    }

    static getKeyByValue(object, value) { 
        return Object.keys(object).find(key => object[key].toLowerCase() === value.toLowerCase()); 
    } 

    static applyHighlights(errorLines) {

        let highlightedText = []

        for (let i=0; i<sbcData.preparedInput.data.length; i++) {  

            if (errorLines.includes(i)) {
                let highlightedLine = "<mark>" + sbcData.preparedInput.data[i] + "</mark><br>"
                highlightedText.push(highlightedLine)
            } else {
                //sbcData.preparedInput.data[i] !== "<br>" && highlightedText.push(sbcData.preparedInput.data[i] + "<br>")
                if (sbcData.preparedInput.data[i] !== "") {
                    highlightedText.push("<div class='lineNumbers'>" + sbcData.preparedInput.data[i] + "</div>")
                } else {
                    highlightedText.push("<div class='lineNumbers'><br></div>")
                }
            }

        }

        return highlightedText
      }

    static getModifier(attribute) {
        return Math.floor(((attribute-10)/2));
    }
    
    static getSumOfChangeModifiers(changePool) {
        let sumOfChanges = 0;
        let changeKeys = Object.keys(changePool)
        for (let i=0; i<changeKeys.length; i++) {
            sumOfChanges += changePool[changeKeys[i]];
        }
        return sumOfChanges;
    }
    
    static getEncumbrance (strength) {
        // If(Str <= 10) MaxCarryingCapacity = 10*Str
        // If(Str > 10) MaxCarryingCapacity = 5/4 * 2^Floor(Str/5)* Round[20 * 2^(Mod(Str,5)/5)]
        
        if(strength <= 10) {
            return strength*10;
        } else {
            return 5/4 * (2 ** Math.floor(strength/5)) * Math.round(20 * ( 2 ** ( (strength % 5) / 5 ) ) );
        }
    }
    
    static getDiceAverage (diceSize) {
        let sum = 0;
        for (let i=1; i<=diceSize; i++) {
            sum += i;
        }
            
        return sum/diceSize;
    }
    
    static makeValueRollable(string) {
            
        var output = string.replace(/(\d+d\d+)/g, "[[$1]]");
        
        return output;
    }
    
    static capitalize (string) {
        if (!string) return "";
        let words = string.split(/ +/).map((el, idx, arr) => {
            if (idx == 0 || idx == arr.length - 1)
                return el.substring(0, 1).toUpperCase() + el.substring(1);
            if (this.uncapitals.includes(el))
                return el;
            return el.substring(0, 1).toUpperCase() + el.substring(1);    
        });
        return words.join(" ");
    }

    static camelize(text) {
        if (!text) {
            return text
        }

        return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();        
        });
    }

    static stringContains(string, subString, bCaseSensitive = true) {
        if (bCaseSensitive) {
            return string.includes(subString);
        }
        return string.toLowerCase().includes(subString.toLowerCase());
    }

    static stringStartsWith(string, searchString, bCaseSensitive = true) {
        if (!string) return false;
        if (!searchString) return false;

        try {
            if (searchString.length > string.length) {
                return false;
            }

            if (bCaseSensitive) {
                return string.startsWith(searchString);
            } else {
                let startPart = string.substring(0, searchString.length);
                return startPart.toLowerCase() === searchString.toLowerCase();
            }
        } catch (err) {
            sbcUtils.log(`stringStartsWith('${string}', '${searchString}', ${bCaseSensitive}) threw an error: ${err}`);
            throw err;
        }
    }

    static switchValue(obj){
        const ret = {};
        Object.keys(obj).forEach(key => {
            ret[obj[key]] = key;
        });
        return ret;
    }
}
