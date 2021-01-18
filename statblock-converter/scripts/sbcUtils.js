import { sbcConfig } from "./sbcConfig.js"
import { sbcData, sbcError, sbcErrorLevels } from "./sbcData.js"
import { sbcMapping } from "./sbcParsers.js"

export class sbcUtils {
    static openingBrackets = ['(', '[', '{'];
    static closingBrackers = [')', ']', '}'];
    static matchingClosingBrackets = {'(': ')', '[' : ']', '{': '}'};

    /* ------------------------------------ */
    /* Resetting and Updating   			*/
    /* ------------------------------------ */

    static resetData () {
        sbcData.errors = []
        sbcData.input = ""
        sbcData.preparedInput = {}
        sbcData.parsedInput = {}
        sbcData.characterData = {}
        sbcData.notes = {}
        sbcData.foundCategories = 0
        sbcData.parsedCategories = 1
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
        console.log(sbcData.characterData.actorData)
        this.resetPreview()
        let previewArea = $(".sbcContainer #sbcPreview")
        let preview = await renderTemplate('modules/pf1-statblock-converter/templates/sbcPreview.hbs' , {data: sbcData.characterData.actorData.data, notes: sbcData.notes })
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
            
        let tempActor = await Actor.create({
            name: sbcData.characterData.actorData.data.name,
            type: sbcConfig.const.actorType[sbcData.actorType],
            folder: sbcData.characterData.actorData.data.folder,
            sort: 12000,
            data: {},
            token: {},
            items: [],
            flags: {}
        }, {temporary: true} );

        sbcData.characterData = {
            actorData: tempActor,
            items: [],
            spells: [],
            abilityDescriptions: [],
            characterDescriptions: [],
            conversionValidation: {
                "context": {},
                "attributes": {},
                "skills": {}
            }
        }

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

        let customCompendiums = game.settings.get(sbcConfig.modData.mod, "customCompendiums")
        let compendiums = []
        compendiums.push(compendium)
        if (customCompendiums !== "") {
            compendiums.unshift(customCompendiums)
        }

        let searchTerms = input.name.split(" ")
                
        let foundEntity = false
        let searchResult = {}

        for (let i=0; i<compendiums.length; i++) {
            
            if (!foundEntity) {

                let currentCompendium = compendiums[i]

                let pack = game.packs.get(currentCompendium)

                if (pack) {

                    // WIP: MAKE THIS SEARCH MORE FUZZY!!!
                    // Example: LEt it find "Shortsword" when the input is "Short Sword"
                    // Example: Let it find "Holy Symbol (Silver)" when the in put is "Silver Holy Symbol"
                    let search = await pack.getIndex().then(p => p.find(o => o.name.toLowerCase() === input.name.toLowerCase()))

                    if (search) {

                        searchResult = await pack.getEntity(search._id).then(entity => {
                            sbcConfig.options.debug && sbcUtils.log("Found " + input.name + " in " + currentCompendium + ".")
                            foundEntity = true
                            return entity
                        })

                    }

                }

            }

        }

        if (foundEntity) {

            return searchResult

        } else {

            sbcConfig.options.debug && sbcUtils.log("Failed to find " + input.name + " in the compendiums [" + compendiums + "]")
            return searchResult

        }

    }

    static async generatePlaceholderEntity (input, line = -1) {
        // If the input is NOT found in any of the given compendiums, create a placeholder

        let entityData = {
            "name": input.name ? input.name : null,
            "type": input.type ? input.type : null,
            
            // Creature-related
            "creatureType": input.creatureType ? input.creatureType : null,
            "subTypes": input.subTypes ? input.subTypes : null,
            "img": input.img ? input.img : null,
            
            // Gear-related
            "subtext": input.subtext ? input.subtext : null,
            "currency": input.currency ? input.currency : null,
            "enhancement": input.enhancement ? input.enhancement : null,
            "mwk": input.mwk ? input.mwk : null,
            
            // Class-related
            "wizardClass": input.wizardClass ? input.wizardClass : null,
            "suffix": input.suffix ? input.suffix : null,
            "archetype": input.archetype ? input.archetype : null,
            "level": input.level ? input.level : null,

            // Ability-related
            "specialAbilityType": input.specialAbilityType ? input.specialAbilityType : null,
            "desc": input.desc ? input.desc : "sbc | Placeholder"
        }

        let entity = null

        switch (input.type) {
            case "container":
                entity = await Item.create({
                    "name": "Money Pouch: " + sbcUtils.capitalize(entityData.name),
                    "type": "container",
                    "data": {
                        "description": {
                            "value": "sbc | All currency carried was put into this container."
                        },
                        "currency": {
                            "pp": entityData.currency.pp,
                            "gp": entityData.currency.gp,
                            "sp": entityData.currency.sp,
                            "cp": entityData.currency.cp
                        }
                    },
                    "img": "systems/pf1/icons/items/inventory/pouch-sealed.jpg"
                }, { temporary : true })
                break
            case "feats":
                entity = await Item.create({
                    "name": sbcUtils.capitalize(entityData.name),
                    "type": "feat",
                    "data": {
                        "description": {
                            "value": "sbc | As " + entityData.name + " could not be found in any compendium, a placeholder was generated."
                        },
                        
                    },
                    "img": "systems/pf1/icons/skills/yellow_36.jpg"
                }, { temporary : true })
                break
            case "race":
                entity = await Item.create({
                    "name": sbcUtils.capitalize(entityData.name),
                    "type": "race",
                    "data": {
                        "description": {
                            "value": "sbc | As the statblock did not include a race, a custom one was generated."
                        },
                        "creatureType": entityData.creatureType,
                        "subTypes": entityData.subTypes
                    },
                    "img": entityData.img
                }, { temporary : true })
                break
            case "misc":
                entity = await Item.create({
                    "name": sbcUtils.capitalize(entityData.name),
                    "type": "feat",
                    "data": {
                        "description": {
                            "value": entityData.desc
                        },
                        "featType": "misc"
                    },
                    "img": "systems/pf1/icons/skills/yellow_36.jpg"
                }, { temporary : true })
                break
            case "classFeat":
            case "class-abilities":
                if (entityData.specialAbilityType !== null) {
                    entity = await Item.create({
                        "name": sbcUtils.capitalize(entityData.name),
                        "abilityType": sbcUtils.capitalize(CONFIG['PF1'].abilityTypes[entityData.specialAbilityType].long),
                        "abilityTypeShort": sbcUtils.capitalize(entityData.specialAbilityType),
                        "type": "feat",
                        "data": {
                            "abilityType": entityData.specialAbilityType,
                            "description": {
                                "value": entityData.desc
                            },
                            "featType": "classFeat"
                        },
                        "img": "systems/pf1/icons/skills/yellow_36.jpg"
                    }, { temporary : true })
                } else {
                    entity = await Item.create({
                        "name": sbcUtils.capitalize(entityData.name),
                        "abilityType": "",
                        "abilityTypeShort": "",
                        "type": "feat",
                        "data": {
                            "abilityType": "",
                            "description": {
                                "value": entityData.desc
                            },
                            "featType": "classFeat"
                        },
                        "img": "systems/pf1/icons/skills/yellow_36.jpg"
                    }, { temporary : true })
                }
                break
            default:
                entity = await Item.create({
                    "name": sbcUtils.capitalize(entityData.name),
                    "type": entityData.type,
                    "data": {
                        "description": {
                            "value": "sbc | As " + entityData.name + " could not be found in any compendium, a placeholder was generated."
                        }
                    },
                    "img": "systems/pf1/icons/skills/yellow_36.jpg"
                }, { temporary : true })
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

            let changes = []
            let contextNotes = []

            // Attribute Validation
            let attributesToValidate = Object.keys(conversionValidation.attributes)

            // Get the currentItems
            let currentItems = await actor.data.items
            let currentItemsKeys = Object.keys(currentItems)

            for (let i=0; i<attributesToValidate.length; i++) {
                let attribute = attributesToValidate[i]
                let modifier = ""
                let target = ""
                let subTarget = ""
                let totalInStatblock = conversionValidation.attributes[attribute]
                let totalInActor = 0
                let valueInItems = 0
                let difference = 0

                for (let i=0; i<currentItemsKeys.length; i++) {
                    
                    let currentItemKey = currentItemsKeys[i]
                    let currentItem = currentItems[currentItemKey]
                    let currentItemChanges = currentItem.data.changes

                    // Check, if the currentItem has changes to be considered
                    if (Array.isArray(currentItemChanges) && currentItemChanges.length) {

                        let currentItemChange = currentItemChanges[0]
                        let itemValues = Object.values(currentItemChange)
                        
                        if (itemValues.includes(attribute)) {
                            
                            valueInItems += +currentItemChange.formula

                        }

                    }

                }

                // Generate Changes for the conversionBuff
                switch (attribute) {
                    case "cmd":
                    case "cmb":
                    case "init":
                        totalInActor = actor.data.data.attributes[attribute].total
                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = attribute
                        if (totalInActor !== totalInStatblock) {
                            difference = +totalInStatblock - +totalInActor
                        }
                        break
                    case "hpBonus":
                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = "mhp"
                        difference = +totalInStatblock
                        break
                    case "hpTotal":
                        let hpBonus = sbcData.characterData.conversionValidation.attributes.hpBonus
                        totalInActor = actor.data.data.attributes.hp.max
                        modifier = "untypedPerm"
                        target = "misc"
                        subTarget = "mhp"
                        if (hpBonus !== 0) {
                            difference = +totalInStatblock - +totalInActor - +hpBonus
                        } else {
                            difference = +totalInStatblock - +totalInActor
                        }
                        break
                    case "armor":
                        // Armor and Shield have no specific place in the sheet apart from the items granting these boni,
                        // but for the conversionValidation we need to separate them, as they use separate subTargets ("sac", "aac")
                        modifier = "untypedPerm"
                        target = "ac"
                        subTarget = "aac"
                        difference = +totalInStatblock - +valueInItems
                        break
                    case "shield":
                        // Armor and Shield have no specific place in the sheet apart from the items granting these boni,
                        // but for the conversionValidation we need to separate them, as they use separate subTargets ("sac", "aac")
                        modifier = "untypedPerm"
                        target = "ac"
                        subTarget = "sac"
                        difference = +totalInStatblock - +valueInItems
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
                        break
                    case "fort":
                    case "ref":
                    case "will":
                        modifier = "untypedPerm"
                        target = "savingThrows"
                        subTarget = attribute
                        totalInActor = actor.data.data.attributes.savingThrows[attribute].total
                        difference = +totalInStatblock - +totalInActor
                        break
                    default:
                        break
                }

                // If the total in the statblock differs from the total in foundry, add a change to the conversion buff
                if (difference !== 0) {

                    let attributeChange = {
                        "formula": difference.toString(),
                        "modifier": modifier,
                        "operator": "add",
                        "priority": 0,
                        "subTarget": subTarget,
                        "target": target,
                        "value": +difference,
                        "_id": randomID(8)
                    }
                    changes.push(attributeChange)
                }

            }

            // Add context notes to the buff
            let contextNotesToAdd = Object.keys(conversionValidation.context)

            for (let i=0; i<contextNotesToAdd.length; i++) {
                let contextNoteType = contextNotesToAdd[i]
                let contextNoteToAdd = conversionValidation.context[contextNoteType]

                if (contextNoteToAdd !== "") {
                    let contextNote = {
                        "subTarget": contextNoteType,
                        "target": "misc",
                        "text": contextNoteToAdd
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
                
                let skillSubKeys = Object.keys(actor.data.data.skills[parentSkillKey])

                if (!skillSubKeys.includes("subSkills")) {
                    skillModInActor = await actor.data.data.skills[skillKey].mod
                } else {
                    skillModInActor = await actor.data.data.skills[parentSkillKey].subSkills[skillKey].mod
                }

                // (1) Create skillContext Objects to add to the Buff
                if (skillToValidate.context !== "") {
                    let contextNote = skillToValidate.context
                    let skillContext = {
                        "subTarget": "skill." + skillKey,
                        "target": "skill",
                        "text": contextNote
                    }
                    contextNotes.push(skillContext)
                }

                // (2) Adjust for differences between calculated skillTotals and statblockTotals
                if (+skillToValidate.total !== +skillModInActor) {
                    let difference = +skillToValidate.total - +skillModInActor

                    if (difference !== 0) {
                        let skillChange = {
                            "formula": difference.toString(),
                            "modifier": "untypedPerm",
                            "operator": "add",
                            "priority": 0,
                            "subTarget": "skill." + skillKey,
                            "target": "skill",
                            "value": +difference,
                            "_id": randomID(8)
                        }
                        changes.push(skillChange)
                    }
                    
                }

            }

            // Create the conversionBuffItem as an embedded entity
            let conversionBuffItem = await Item.create({
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

            await actor.createEmbeddedEntity("OwnedItem", conversionBuffItem)
            
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
        let tempInput = input.replace(/(\d{1})(,)(\d{1})/g, "$1$3")

        // Check if there are commas or semicolons
        if (tempInput.search(/,|;/g) !== -1) {

            // Check if there are parenthesis including commas in the input
            if (tempInput.match(/([^,]+\([^(.]+?(?:,|;)[^(.]+?\))+?/gi) !== null) {
                // Get the input with parenthesis and commas inside the parenthesis
                let itemsWithCommasInParenthesis = tempInput.match(/([^,]+\([^(.]+?(?:,|;)[^(.]+?\)[^,]*)+?/gi)
                let itemsWithCommasInParenthesisKeys = Object.keys(itemsWithCommasInParenthesis)

                for (let i=0; i<itemsWithCommasInParenthesisKeys.length; i++) {

                    let tempKey = itemsWithCommasInParenthesisKeys[i]
                    let tempItem = itemsWithCommasInParenthesis[tempKey].trim()

                    let patternTempItem = new RegExp (tempItem.replace(/\(/,"\\(").replace(/\)/,"\\)").replace(/\+/,"\\+"), "i")
                    tempInput = tempInput.replace(patternTempItem, "").replace(/,\s*,/, ",").replace(/^,/, "")

                    items.push(tempItem)

                }

                let itemsWithoutParenthesis = tempInput.replace(/,\s*,/, ",").split(/[,;]/)

                items = items.concat(...itemsWithoutParenthesis)

            } else {

                // If there are no parenthesis with commas, just split at commas/semi-colons
                items = tempInput.split(/[,;]/)

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
                let highlightedLine = "<mark>" + sbcData.preparedInput.data[i] + "</mark><br/>"
                highlightedText.push(highlightedLine)
            } else {
                sbcData.preparedInput.data[i] !== "<br>" && highlightedText.push(sbcData.preparedInput.data[i] + "<br/>")
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
        return string.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
            return letter.toUpperCase();
        })
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

    

    

    /* ------------------------------------ */
    /* Functions from the Starfinder Parser */
    /* ------------------------------------ */

    /** Will try to find an entry in the specified compendium that matches all the terms, will return the first entry that does. */
    
    static async fuzzyFindCompendiumAsync(compendiumName, searchString) {
        if (!compendiumName) {
            sbcUtils.log("No compendium name specified.");
            return null;
        }

        if (!searchString) {
            sbcUtils.log("No search string specified.");
            return null;
        }

        let compendium = game.packs.find(element => element.title.includes(compendiumName));
        if (compendium == undefined) {
            sbcUtils.log("Could not find compendium named " + compendium + ".");
            return null;
        }

        let rawString = this.parseSubtext(searchString)[0];
        
        // Let the compendium load
        await compendium.getIndex();
        
        let terms = rawString.toLowerCase().replace("(ex)","").replace("(su)","").replace("(sp)","").trim().replace(/[*,;()\[\]'"]/g,"").split(' ');
        let entryWeWant = null;
        for (let entry of compendium.index) {
            let rawEntryName = this.parseSubtext(entry.name)[0];
            let entryName = rawEntryName.toLowerCase().replace("(ex)","").replace("(su)","").replace("(sp)","").trim();
            let entryTerms = entryName.replace(/[*,;()\[\]'"]/g,"").split(' ');

            if (terms.length !== entryTerms.length) {
                continue;
            }
            
            let bAllTermsPresent = true;
            for (let term of terms) {
                if (!entryTerms.includes(term)) {
                    bAllTermsPresent = false;
                    break;
                }
            }

            if (!bAllTermsPresent) {
                continue;
            }

            entryWeWant = compendium.getEntry(entry._id);
            break;
        }

        if (entryWeWant != undefined) {
            //sbcUtils.log("Item " + JSON.stringify(entryWeWant));
        } else {
            //sbcUtils.log("Item " + entryName + " not found.");
        }
        return entryWeWant;
    }
    

    static async fuzzyFindItemAsync(statBlockItemName) {
        statBlockItemName = statBlockItemName.toLowerCase();

        // Common substitutions
        statBlockItemName = statBlockItemName.replace("grenades", "grenade");
        if (statBlockItemName.endsWith("grenade 1")) {
            statBlockItemName = statBlockItemName.replace("grenade 1", "grenade i");
        } else if (statBlockItemName.endsWith("grenade 2")) {
            statBlockItemName = statBlockItemName.replace("grenade 2", "grenade ii");
        } else if (statBlockItemName.endsWith("grenade 3")) {
            statBlockItemName = statBlockItemName.replace("grenade 3", "grenade iii");
        } else if (statBlockItemName.endsWith("grenade 4")) {
            statBlockItemName = statBlockItemName.replace(" 4", "grenade iv");
        } else if (statBlockItemName.endsWith("grenade 5")) {
            statBlockItemName = statBlockItemName.replace("grenade 5", "grenade v");
        }

        statBlockItemName = statBlockItemName.replace("batteries", "battery");
        if (sbcUtils.stringContains(statBlockItemName, "battery", false)) {
            if (!sbcUtils.stringContains(statBlockItemName, "capacity", false)) {
                statBlockItemName += ", standard";
            }
        }
        return this.fuzzyFindCompendiumAsync("Equipment", statBlockItemName);
    }

    static async fuzzyFindSpellAsync(statBlockSpellName) {
        statBlockSpellName = statBlockSpellName.replace("/ ", "/");
        statBlockSpellName = statBlockSpellName.replace(" /", "/");
        return this.fuzzyFindCompendiumAsync("Spells", statBlockSpellName);
    }

    

    static splitEntries(baseString, additionalEntrySplitters = null) {
        let textualEntrySplitters = ["or", "and"];
        if (additionalEntrySplitters) {
            textualEntrySplitters = textualEntrySplitters.concat(additionalEntrySplitters);
        }

        let results = null;
        let stack = [];
        let entry = "";
        for (let i = 0; i<baseString.length; i++) {
            let character = baseString[i];
            let stackTop = stack.length > 0 ? stack[stack.length-1] : '';
            if (sbcUtils.openingBrackets.includes(character)) {
                entry += character;
                stack.push(character);
            } else if (stackTop && character == sbcUtils.matchingClosingBrackets[stackTop]) {
                entry += character;
                stack.pop();
            } else if (character === ',' || character === ';') {
                if (stack.length === 0 && entry.length > 0) {
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    entry = "";
                } else {
                    entry += character;
                }
            } else {
                entry += character;
                for (let splitter of textualEntrySplitters) {
                    let ending = " " + splitter;
                    if (entry.toLowerCase().endsWith(ending) && stack.length == 0 && baseString[i+1] == ' ') {
                        entry = entry.substring(0, entry.length - splitter.length);
                        if (!results) {
                            results = [entry.trim()];
                        } else {
                            results.push(entry.trim());
                        }
                        entry = "";
                    }
                }
            }
        }

        entry = entry.trim();
        if (entry) {
            if (!results) {
                results = [entry];
            } else {
                results.push(entry);
            }
        }

        return results;
    }
}
