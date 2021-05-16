import { sbcUtils } from "./sbcUtils.js"
import { sbcData, sbcError } from "./sbcData.js"
import { sbcConfig } from "./sbcConfig.js"
import { sbcContent } from "./sbcContent.js"

export class sbcParsing { }
export class sbcMapping { }

/** Convenience helper, tries to parse the number to integer, if it is NaN, will return 0 instead. */
sbcParsing.parseInteger = (value) => { let p = parseInt(value); return isNaN(p) ? 0 : p; };

/** Convenience helper, returns an array with the base text and the sub text if found. Format: base text (sub text) */
sbcParsing.parseSubtext = (value) => { return sbcUtils.parseSubtext(value); }

sbcParsing.parseValueToPath = async (obj, path, value) => {

    var parts = path.split('.');
    var curr = obj;
    for (var i = 0; i < parts.length - 1; i++)
        curr = curr[parts[i]] || {};
    curr[parts[parts.length - 1]] = value;
}


// Base class for specialized parsers
export class sbcParserBase {
    constructor() {

    }

    async parse(key, value) {
        return {};
    }
}

// parses values into a child of sbcData.notes, which gets read when creating the styled preview statblock
class notesParser extends sbcParserBase {
    constructor(targetFields) {
        super()
        this.targetFields = targetFields
    }
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " into " + this.targetFields)
        sbcData.notes[value] = value
        try {
            for (const field of this.targetFields) {
                await sbcParsing.parseValueToPath(sbcData.notes, field, value)
            }
            return true
        } catch (err) {
            let errorMessage = `Failed to parse ${value} into notes.${targetFields}`
            let error = new sbcError(2, "Parse", errorMessage, line)
            sbcData.errors.push(error)
            return false
        }
    }
}

// Writes a given value into all fields defined in sbcMapping
class singleValueParser extends sbcParserBase {
    constructor(targetFields, supportedTypes) {
        super()
        this.targetFields = targetFields
        this.supportedTypes = supportedTypes
    }

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " into " + this.targetFields)
        // Check if the given value is one of the supported ones
        if (typeof (value) === this.supportedTypes) {
            try {
                for (const field of this.targetFields) {
                    await sbcParsing.parseValueToPath(sbcData.characterData.actorData.data, field, value)
                }
                return true
            } catch (err) {
                let errorMessage = `Failed to parse ${value} into ${targetFields}`
                let error = new sbcError(0, "Parse", errorMessage, line)
                sbcData.errors.push(error)
                return false
            }
        } else {
            let errorMessage = `The input ${value} is not of the supported type ${this.supportedTypes}`
            let error = new sbcError(1, "Parse", errorMessage, line)
            sbcData.errors.push(error)
            return false
        }
    }
}

// Parse Entities of a given type, mainly used for feats
class entityParser extends sbcParserBase {
    
    async parse(value, line, type) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as " + type + ".")
        
        try {

            let compendium = "pf1." + type

            let patternSupportedEntities = new RegExp("(" + sbcConfig[type].join("\\b|\\b") + ")", "gi")
    
            let array = value.split(/,/)

            for (let i=0; i<array.length; i++) {

                let input = array[i].trim()

                let searchEntity = {
                    "name": sbcUtils.parseSubtext(input.replace(/\+*\d+/g, "").trim())[0],
                    "type": type
                }

                // If the input is found in one of the compendiums, generate an entity from that
                let entity = await sbcUtils.findEntityInCompendium(compendium, searchEntity)

                if (entity !== null) {
                    sbcData.characterData.items.push(entity)
                } else {
                    let placeholder = await sbcUtils.generatePlaceholderEntity(searchEntity, line)
                    sbcData.characterData.items.push(placeholder)
                }

            }

            // entities were created successfully
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as " + type + "."
            let error = new sbcError(1, "Parse/" + type.toUpperCase(), errorMessage, line)
            sbcData.errors.push(error)
            throw err

        }
        
    }
}

// Try to find a matching parser for a given category
export async function parseCategories(category, data, startLine) {

    switch (category) {
        case "base":
            await parseBase(data, startLine)
            sbcData.parsedCategories++
            break
        case "defense":
            await parseDefense(data, startLine)
            sbcData.parsedCategories++
            break
        case "offense":
            await parseOffense(data, startLine)
            sbcData.parsedCategories++
            break
        case "statistics":
            await parseStatistics(data, startLine)
            sbcData.parsedCategories++
            break
        case "tactics":
            await parseTactics(data, startLine)
            sbcData.parsedCategories++
            break
        case "ecology":
            await parseEcology(data, startLine)
            sbcData.parsedCategories++
            break
        case "special abilities":
            await parseSpecialAbilities(data, startLine)
            sbcData.parsedCategories++
            break
        case "description":
            await parseDescription(data, startLine)
            sbcData.parsedCategories++
            break
        default:
            let errorMessage = `No Parser found for category: ${category}`
            let error = new sbcError(1, "Parse/Categories", errorMessage)
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false
            break
    }
}

/* ------------------------------------ */
/* Parser for base data                 */
/* ------------------------------------ */
export async function parseBase(data, startLine) {

    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING BASE DATA")

    let parsedSubCategories = []
    sbcData.notes["base"] = {}

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {

            let lineContent = data[line]

            if (!parsedSubCategories["name"]) {
                if (!parsedSubCategories["name"]) {
                    // Parse the name
                    let parserName = sbcMapping.map.base.name
                    let name = lineContent.replace(/\(?\s*CR\s*(\d+\/*\d*|-)\)?.*/, "").trim()
                    parsedSubCategories["name"] = await parserName.parse(sbcUtils.capitalize(name), line)
                }
            }

            // Parse Challenge Rating
            if (!parsedSubCategories["cr"]) {
                if (lineContent.search(/\s*CR\s*/) !== -1) {
                    let parserCR = sbcMapping.map.base.cr
                    let cr = lineContent.match(/\s*CR\s*(\d+\/*\d*|-)/)[1].trim()

                    sbcData.notes.base["cr"] = cr
                    if (sbcConfig.const.crFractions[cr] != null) {
                        cr = sbcConfig.const.crFractions[cr];
                    }
                    parsedSubCategories["cr"] = await parserCR.parse(+cr, line)
                }
            }

            // Parse Mythic Rank (uses notesParser, as mr currently is not supported by FVTT PF1)
            if (!parsedSubCategories["mr"]) {
                if (lineContent.search(/\s*MR\s*/) !== -1) {
                    let parserMR = sbcMapping.map.base.mr
                    let mr = lineContent.match(/\s*MR\s*(\d+)/)[1].trim()
                    parsedSubCategories["mr"] = await parserMR.parse(mr, line)
                }
            }

            if (line !== 0) {

                // Parse Source (uses notesParser, the source has no separate field in FVTT PF1)
                if (!parsedSubCategories["source"]) {
                    if (lineContent.search(/^Source/) !== -1) {
                        let parserSource = sbcMapping.map.base.source
                        let source = lineContent.match(/^Source\s+(.*)/)[1].trim()
                        parsedSubCategories["source"] = await parserSource.parse(source, line)
                    }
                }

                // Parse XP 
                if (!parsedSubCategories["xp"]) {
                    if (lineContent.search(/^XP/) !== -1) {
                        let parserXP = sbcMapping.map.base.xp
                        let xp = lineContent.match(/^XP\s+([\d,.]*)/)[1].replace(/\.,/g,"").trim()
                        sbcData.notes.base.xp = xp
                        // We just save the xp into our notes, as foundry calculates them automatically
                        parsedSubCategories["xp"] = await parserXP.parse(xp, line)
                    }
                }

                // Parse Gender
                if (!parsedSubCategories["gender"]) {
                    let patternGender = new RegExp("(\\bmale\\b|\\bfemale\\b)", "i")
                    
                    if (lineContent.search(patternGender) !== -1) {
                        let gender = lineContent.match(patternGender)[1]
                        let parserGender = sbcMapping.map.base.gender
                        parsedSubCategories["gender"] = await parserGender.parse(gender, line)
                    }
                }

                // Parse Race
                if (!parsedSubCategories["race"]) {
                    let patternRace = new RegExp("(" + sbcConfig.races.join("\\b|\\b") + ")", "i")
                    
                    if (lineContent.search(patternRace) !== -1) {
                        let race = lineContent.match(patternRace)[1]
                        let parserRace = sbcMapping.map.base.race
                        parsedSubCategories["race"] = await parserRace.parse(race, line)
                    }
                }
                
                // Parse Classes
                if (!parsedSubCategories["classes"]) {

                    // Check for classes only in lines that do not start with an alignment
                    // So as not to match the class "MEDIUM" when it's a Medium Humanoid for example
                    let isAlignmentLine = lineContent.match(/^(\\*A|LG|LN|LE|NG|N|TN|NE|CG|CN|CE)\s*/)

                    // Check for classes only in lines that do not start with "Source"
                    // So as not to match the class "Witch" when it's included in "Source Pathfinder #72: The Witch Queen's Revenge pg. 86"
                    let isSourceLine = lineContent.match(/^(Source)\s*/)

                    if (!isAlignmentLine && !isSourceLine) {
                        let patternClasses = new RegExp("(" + sbcConfig.classes.join("\\b|\\b") + "\\b|\\b" + sbcConfig.prestigeClassNames.join("\\b|\\b") + "\\b|\\b" + sbcContent.wizardSchoolClasses.join("\\b|\\b") + ")(.*)", "gi")
                        if (lineContent.search(patternClasses) !== -1) {
                            // Take everything from the first class found up until the end of line
                            let classes = lineContent.match(patternClasses)[0]
                            let parserClasses = sbcMapping.map.base.classes
                            parsedSubCategories["classes"] = await parserClasses.parse(classes, line)
                        }
                    }
                }
                

                // Parse Alignment
                if (!parsedSubCategories["alignment"]) {
                    let patternAlignment = new RegExp("^(\\*A|LG|LN|LE|NG|N|TN|NE|CG|CN|CE)\\s+", "")
                    if (lineContent.search(patternAlignment) !== -1) {
                        let parserAlignment = sbcMapping.map.base.alignment
                        let alignment = lineContent.match(patternAlignment)[1].trim()
                        sbcData.notes.base.alignment = alignment
                        parsedSubCategories["alignment"] = await parserAlignment.parse(alignment.replace(/\bN\b/, "TN").toLowerCase(), line)
                    }
                }

                // Parse Size and Space / Token Size
                if (!parsedSubCategories["size"]) {
                    let patternSize = new RegExp("^(?:\\*A|LG|LN|LE|NG|N|TN|NE|CG|CN|CE)\\s+(" + Object.values(CONFIG.PF1.actorSizes).join("\\b|\\b") + ")", "i")
                    if (lineContent.search(patternSize) !== -1) {
                        let parserSize = sbcMapping.map.base.size
                        let size = lineContent.match(patternSize)[1].trim()
                        sbcData.notes.base.size = size
                        let actorSize = sbcUtils.getKeyByValue(CONFIG.PF1.actorSizes, size)

                        // Values derived from Size
                        let parserSpace = new singleValueParser(["token.height", "token.width"], "number")
                        let parserScale = new singleValueParser(["token.scale"], "number")
                        let space = CONFIG.PF1.tokenSizes[actorSize].w
                        let scale = CONFIG.PF1.tokenSizes[actorSize].scale

                        parsedSubCategories["size"] = {
                            "size": await parserSize.parse(actorSize, line),
                            "space": await parserSpace.parse(space, line),
                            "scale": await parserScale.parse(scale, line)
                        }

                    }
                }

                // Parse Creature Type and Subtype, but only when they are found after a size declaration
                if (!parsedSubCategories["creatureType"]) {
                    let patternCreatureType = new RegExp("(?:" + Object.values(CONFIG.PF1.actorSizes).join("\\b|\\b") + ")\\s*(" + Object.values(CONFIG.PF1.creatureTypes).join("\\b.*|\\b") + ")", "i")
                    if (lineContent.search(patternCreatureType) !== -1) {
                        let creatureType = lineContent.match(patternCreatureType)[1]
                        let parserCreatureType = sbcMapping.map.base.creatureType
                        parsedSubCategories["creatureType"] = await parserCreatureType.parse(creatureType, line)
                    }
                }

                // Parse Initiative
                if (!parsedSubCategories["init"]) {
                    if (lineContent.search(/^Init\b/i) !== -1) {
                        let parserInit = sbcMapping.map.base.init
                        let init = lineContent.match(/(?:Init\s*)(\+\d+|-\d+|\d+)/)[1].trim()
                        sbcData.characterData.conversionValidation.attributes["init"] = +init
                        parsedSubCategories["init"] = await parserInit.parse(+init, line)
                    }
                }

                // Parse Senses
                if (!parsedSubCategories["senses"]) {
                    if (lineContent.search(/\bSenses\b/i) !== -1) {
                        let parserSenses = sbcMapping.map.base.senses
                        let senses = lineContent.match(/(?:\bSenses\b\s*)(.*?)(?:\n|$|\s*Aura)/igm)[0].replace(/\bSenses\b\s*|\s*Aura\b/g,"")
                        parsedSubCategories["senses"] = await parserSenses.parse(senses, line)
                    }
                }

                // Parse Aura
                if (!parsedSubCategories["aura"]) {
                    if (lineContent.search(/\bAura\b/i) !== -1) {
                        let parserAura = sbcMapping.map.base.aura
                        let aura = lineContent.match(/(?:\bAura\b\s*)(.*)/igm)[0].replace(/\s*Aura\b/g,"")
                        parsedSubCategories["aura"] = await parserAura.parse(aura, line)
                    }
                }
            }

        } catch (err) {

            let errorMessage = "Parsing the base data failed at the highlighted line"
            let error = new sbcError(1, "Parse/Base", errorMessage, (startLine+line) )
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false
            return false
        }

    }

    // Parse errors and warnings
    if (!parsedSubCategories["cr"] && sbcData.actorType === 0) {
        let errorMessage = `No CR for this NPC detected, please check the highlighted line`
        let error = new sbcError(2, "Parse/Base", errorMessage, 0)
        sbcData.errors.push(error)
    }

    if (!parsedSubCategories["creatureType"]) {
        let errorMessage = `No creature type found!`
        let error = new sbcError(1, "Parse/Base", errorMessage)
        sbcData.errors.push(error)
    }

    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING BASE DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse Race
class raceParser extends sbcParserBase {
    
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as race")
        
        try {

            let race = {
                "name": value.toLowerCase()
            }
            sbcData.notes.base.race = sbcUtils.capitalize(race.name)

            let compendium = "pf1.races"
            let raceItem = await sbcUtils.findEntityInCompendium(compendium, race, line)

            sbcData.characterData.items.push(raceItem)
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as race."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }
}

// Parse Classes
class classesParser extends sbcParserBase {
    
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as class(es)")
        
        try {

            let compendium = "pf1.classes"

            let patternSupportedClasses = new RegExp("(" + sbcConfig.classes.join("\\b|\\b") + ")", "gi")
            let patternPrestigeClasses = new RegExp("(" + sbcConfig.prestigeClassNames.join("\\b|\\b") + ")(.*)", "gi")
            let patternWizardClasses = new RegExp("(" + sbcContent.wizardSchoolClasses.join("\\b|\\b") + ")(.*)", "gi")

            // Put the raw class info into the notes, to be used in the preview
            sbcData.notes.base.classes = sbcUtils.capitalize(value)

            // split the classes and handle each class separatly
            let classes = value.split(/\//)

            for (let i=0; i<classes.length; i++) {
                let classInput = classes[i]

                let isSupportedClass = false
                let isPrestigeClass = false
                let isWizardClass = false

                if (classInput.search(patternPrestigeClasses) !== -1) {
                    isPrestigeClass = true
                }
                if (classInput.search(patternSupportedClasses) !== -1) {
                    isSupportedClass = true
                }
                if (classInput.search(patternWizardClasses) !== -1) {
                    isWizardClass = true
                }

                // Supported Class, Prestige Class or Wizard Class found
                if (isPrestigeClass || isSupportedClass || isWizardClass) {
                    

                    let tempClassName = sbcUtils.parseSubtext(classInput.replace(/\d+/g, "").trim())

                    let classArchetype = ""
                    if (tempClassName[1]) {
                        classArchetype = tempClassName[1]
                    }

                    let classLevel = 0
                    if (classInput.match(/(\d+)/)[0]) {
                        classLevel = classInput.match(/(\d+)/)[0]
                    }

                    let classData = {
                        "name": "",
                        "wizardClass": "",
                        "suffix": "",
                        "archetype": classArchetype,
                        "level": classLevel
                    }

                    if (isSupportedClass) {
                        classData.name = tempClassName[0].match(patternSupportedClasses)[0]
                        classData.suffix = tempClassName[0].replace(classData.name, "").trim()
                    } else if (isPrestigeClass) {
                        classData.name = tempClassName[0].match(patternPrestigeClasses)[0]
                        classData.suffix = tempClassName[0].replace(classData.name, "").trim()
                    } else if (isWizardClass) {
                        classData.name = "wizard"
                        classData.wizardClass = tempClassName[0]
                        classData.suffix = tempClassName[0].replace(classData.wizardClass, "").trim()
                    } else {
                        return false
                    }

                    let classItem = await sbcUtils.findEntityInCompendium(compendium, classData, line)

                    /*
                     * If the input is a prestige class AND this prestige class could not be found,
                     * create a new placeholder
                     * otherwise
                     * enter stuff as normal
                     */

                    if (isPrestigeClass && !classItem) {
                        // If the input is a prestige class that could not be found in any compendium, create a placeholder item
                        // as these are currently not supported in the pf1 system

                        let className = sbcUtils.parseSubtext(classInput.replace(/\d+/g, "").trim())[0]
                        let classLevel = classInput.match(/(\d+)/)[1]

                        let classKey = Object.keys(sbcContent.prestigeClasses).find(key => key.toLowerCase() === className.toLowerCase())
                        let classTemplate = sbcContent.prestigeClasses[classKey]

                        let classSkills = {}
                        let skillKeys = Object.keys(CONFIG.PF1.skills)

                        for (let i=0; i<skillKeys.length; i++) {

                            let searchSkill = skillKeys[i]
                            if (classTemplate.classSkills.includes(searchSkill)) {
                                classSkills[searchSkill] = true
                            } else {
                                classSkills[searchSkill] = false
                            }

                        }
                        
                        let classItem = await Item.create({
                            "name": sbcUtils.capitalize(className),
                            "type": "class",
                            "data": {
                                "description": {
                                    "value": "sbc | As the PF1-System currently does not include prestige classes, a placeholder was generated."
                                },
                                "bab": classTemplate.bab,
                                "classType": "prestige",
                                "classSkills": classSkills,
                                "level": +classLevel,
                                "hd": +classTemplate.hd,
                                "hp": +classTemplate.hd + +Math.floor(sbcUtils.getDiceAverage(+classTemplate.hd) * (+classLevel-1)),
                                "savingThrows": {
                                    "fort": { "value": classTemplate.fort },
                                    "ref":  { "value": classTemplate.ref  },
                                    "will": { "value": classTemplate.will }
                                },
                                "skillsPerLevel": +classTemplate.skillsPerLevel,
                                
                            },
                            "img": classTemplate.img
                        }, { temporary : true })

                        let infoMessage = "As the PF1-System currently does not include prestige classes, a placeholder will be generated for the class " + className + "."
                        let info = new sbcError(3, "Parse/Base/Class", infoMessage, line)
                        sbcData.errors.push(info)

                        sbcData.characterData.items.push(classItem)

                    } else {

                        // If the suffix contains an "of" the probability it names a deity is high. So, set that and hope for the best
                        if (classData.suffix.search(/^(of\b)/i) !== -1 && classData.archetype !== undefined) {
                            let deity = classData.suffix.replace(/^(of\b)/i, "").trim()
                            sbcData.characterData.actorData.data.data.details.deity = deity
                            classItem.data.name = sbcUtils.capitalize(classData.name) + " " + classData.suffix + " (" + sbcUtils.capitalize(classData.archetype) + ")"
                        } else if (classData.suffix.search(/^(of\b)/i) !== -1) {
                            let deity = classData.suffix.replace(/^(of\b)/i, "").trim()
                            sbcData.characterData.actorData.data.data.details.deity = deity
                            classItem.data.name = sbcUtils.capitalize(classData.name) + " " + classData.suffix
                        } else if (classData.archetype) {
                            classItem.data.name = sbcUtils.capitalize(classData.name) + " (" + sbcUtils.capitalize(classData.archetype) + ")"
                        } else if (classData.wizardClass !== "") {
                            classItem.data.name = sbcUtils.capitalize(classData.wizardClass)
                            classItem.data.data.tag = "wizard"
                            classItem.data.data.useCustomTag = true
                        } else {
                            classItem.data.name = sbcUtils.capitalize(classData.name)
                        }
        
                        classItem.data.data.level = +classData.level
                        classItem.data.data.hp = +classItem.data.data.hd + +Math.floor(sbcUtils.getDiceAverage(+classItem.data.data.hd) * (+classData.level-1))

                        sbcData.characterData.items.push(classItem)
                        
                    }

                    

                }  else {
                    let errorMessage = "Failed to create an item for the class " + value + "."
                    let error = new sbcError(1, "Parse/Base/Class", errorMessage, line)
                    sbcData.errors.push(error)
                    return false
                }

            }

            // classItems were created successfully
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as classes."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)
            throw err
            return false

        }
        
    }
}

// Parse Creature Type and Subtype
class creatureTypeParser extends sbcParserBase {
    
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as creatureType")
        
        try {

            let tempCreatureType = sbcParsing.parseSubtext(value)

            let creatureType = {
                "name": tempCreatureType[0],
                "type": "racial",
                "subTypes": ""
            }

            if (tempCreatureType.length > 1) {
                creatureType.subTypes = tempCreatureType[1]
            }

            let compendium = "pf1.racialhd"
            let creatureTypeItem = await sbcUtils.findEntityInCompendium(compendium, creatureType, line)
            creatureTypeItem.data.data.useCustomTag = true
            creatureTypeItem.data.data.tag = creatureType.name

            // Set flags for the conversion
            switch (creatureType.name.toLowerCase()) {
                case "undead":
                    sbcConfig.options.flags.isUndead = true
                    break
                default:
                    break
            }

            if (creatureType.subTypes !== "") {
                creatureTypeItem.data.name = sbcUtils.capitalize(creatureType.name) + " (" + sbcUtils.capitalize(creatureType.subTypes) + ")"
            }

            sbcData.notes.creatureType = creatureTypeItem.data.name
            sbcData.characterData.items.push(creatureTypeItem)

            // Check, if there already is a race item for this creatureType
            let currentItems = sbcData.characterData.items
            let raceFound = false

            for (let i=0; i<currentItems.length; i++) {
                if (currentItems[i].type === "race") {
                    // When a race was found, do not create a custom one to hold the creatureType and SubType
                    raceFound = true
                }
            }

            // When no existing race item was found, create a placeholder to save creature type and subtype
            if (!raceFound) {

                let subTypesArray = []
                creatureType.subTypes.split(/\s*,\s*/).map(function (elem) {
                    let elemContainer = []
                    elemContainer.push(elem)
                    subTypesArray.push(elemContainer)
                })


                let camelizedCreatureType = sbcUtils.camelize(creatureType.name)
                
                let race = {
                    "name": "Race: " + sbcUtils.capitalize(creatureType.name),
                    "type": "race",
                    "creatureType": camelizedCreatureType,
                    "subTypes": subTypesArray,
                    "img": creatureTypeItem.data.img
                    
                }
                
                let placeholder = await sbcUtils.generatePlaceholderEntity(race, line)
                sbcData.characterData.items.push(placeholder)
                
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as creatureType."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(err)
            return false

        }
        
    }
}

// Parse Senses
class sensesParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as senses")

        try {

            let systemSupportedSenses = Object.values(CONFIG["PF1"].senses).map(x => x.toLowerCase())
            
            let availableSenses = systemSupportedSenses.concat(sbcContent.additionalSenses)

            let parserSenses = new singleValueParser(["data.traits.senses"], "string")
            parserSenses.parse(value, line)

            for (let i=0; i<availableSenses.length; i++) {

                let searchSense = availableSenses[i]

                let senseFeatName = searchSense
                let senseImagePath = ""
                let senseAbilityType = "ex"

                if (value.search(searchSense) !== -1) {

                    switch (searchSense) {

                        case "all-around vision":
                            senseImagePath = "systems/pf1/icons/items/inventory/monster-eyes.jpg"
                            break
                        case "blindsight":
                        case "blindsense":
                            senseImagePath = "systems/pf1/icons/skills/light_01.jpg"
                            break
                        case "carrion sense":
                            senseImagePath = "systems/pf1/icons/skills/affliction_03.jpg"
                            break
                        case "darkvision":
                            let darkvisionRange = value.match(/\d+/)[0]
                            sbcData.characterData.actorData.data.token.brightSight = darkvisionRange
                            senseFeatName = searchSense + " " + darkvisionRange + "ft."
                            senseImagePath = "systems/pf1/icons/skills/shadow_12.jpg"
                            break
                        case "deathwatch":
                            senseImagePath = "systems/pf1/icons/skills/shadow_01.jpg"
                            break
                        case "deepsight":
                            senseImagePath = "systems/pf1/icons/skills/blue_17.jpg"
                            break
                        case "dragon senses":
                            senseImagePath = "systems/pf1/icons/races/creature-types/dragon.png"
                            break
                        case "low-light":
                            sbcData.characterData.actorData.data.token.flags = {
                                "pf1.lowLightVision" : true
                            }
                            senseFeatName = searchSense + " Vision"
                            senseImagePath = "systems/pf1/icons/skills/shadow_11.jpg"
                            break
                        case "lifesense":
                            senseImagePath = "systems/pf1/icons/skills/blood_04.jpg"
                            break
                        case "greensight":
                            senseImagePath = "systems/pf1/icons/skills/green_13.jpg"
                            break
                        case "minesight":
                            let minesightRange = "90"
                            sbcData.characterData.actorData.data.token.brightSight = minesightRange
                            senseFeatName = searchSense + " " + minesightRange + "90ft."
                            senseImagePath = "systems/pf1/icons/skills/shadow_12.jpg"
                            break
                        case "scent":
                            senseImagePath = "systems/pf1/icons/skills/blue_29.jpg"
                            break
                        case "see in darkness":
                            senseAbilityType = "su"
                            senseImagePath = "systems/pf1/icons/skills/shadow_17.jpg"
                            break
                        case "tremorsense":
                            senseImagePath = "systems/pf1/icons/skills/violet_14.jpg"
                            break
                        case "truesight":
                        case "true seeing":
                            senseAbilityType = "su"
                            senseImagePath = "systems/pf1/icons/skills/red_09.jpg"
                            break
                        case "water sense":
                            senseImagePath = "systems/pf1/icons/skills/emerald_11.jpg"
                            break
                        default:
                            let errorMessage = "No match found for " + value + ". This definitily should not have happened. Sorry!"
                            let error = new sbcError(1, "Parse/Base", errorMessage, line)
                            sbcData.errors.push(error)
                            break
                    }

                    // Create a new Item for parsed Senses
                    let sense = await Item.create({
                        "name": "Sense: " + sbcUtils.capitalize(senseFeatName),
                        "type": "feat",
                        "data": {
                            "description": {
                                "value": sbcContent.descriptions.senses[searchSense]
                            },
                            "featType": "racial",
                            "abilityType": senseAbilityType
                        },
                        "img": senseImagePath
                    }, { temporary : true })

                    sbcData.characterData.items.push(sense)

                }

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as senses."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }

}

// Parse Aura
class auraParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as aura")

        try {

            sbcData.notes.aura = value
            
            let auras = value.split(/(?:[^\.])(,)/)

            for (let i=0; i<auras.length; i++) {

                let auraInput = auras[i]

                if (auraInput !== "" && auraInput !== ",") {
        
                    let auraName = ""
                    let auraRange = 0
                    let auraDC = ""
                    let actionType = null
        
                    // Name = Everything before the opening parenthesis
                    auraName = auraInput.replace(/(\(.*\))/,"").trim()

                    // Range = Numbers before ".ft"
                    if (auraInput.search(/([^(,;]+)(?:ft.)/i) !== -1) {
                        auraRange = auraInput.match(/([^(,;]+)(?:ft.)/)[1].trim()
                    }
                    // DC = Number after "DC"
                    if (auraInput.search(/\bDC\b/) !== -1) {
                        auraDC = auraInput.match(/(?:DC\s*)([^)(,;]+)/)[1].trim()
                        actionType = "save"
                    }
        
                    let aura = await Item.create({
                        "name": "Aura: " + sbcUtils.capitalize(auraName),
                        "type": "feat",
                        "data": {
                            "abilityType": "none",
                            "actionType": actionType,
                            "activation": {
                                "cost": null,
                                "type": "passive"
                            },
                            "description": {
                                "value": ""
                            },
                            "duration": {
                                "value": null,
                                "units": "perm"
                            },
                            "featType": "racial",
                            "measureTemplate": {
                                "type": "circle",
                                "size": auraRange
                            },
                            "range": {
                               "value": auraRange,
                               "units": "ft" 
                            },
                            "save": {
                                "dc": auraDC,
                                "type": "will"
                            },
                            "tag": "aura",
                            "target": {
                                "value": "centered on self"
                            }
                        },
                        "img": "systems/pf1/icons/spells/runes-blue-3.jpg"
                    }, { temporary : true })
    
                    sbcData.characterData.items.push(aura)
                }
                
            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as aura."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }

}

/* ------------------------------------ */
/* Parser for defense data              */
/* ------------------------------------ */
export async function parseDefense(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING DEFENSE DATA")
    
    let parsedSubCategories = []
    sbcData.notes["defense"] = {}

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            // Parse Normal AC
            if (!parsedSubCategories["acNormal"]) {
                if (lineContent.search(/^AC\s*(\d+)/) !== -1) {
                    let parserAcNormal = sbcMapping.map.defense.acNormal
                    let acNormal = lineContent.match(/^AC\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acNormal"] = +acNormal

                    parsedSubCategories["acNormal"] = await parserAcNormal.parse(+acNormal, line+startLine)
                }
            }

            // Parse Touch AC
            if (!parsedSubCategories["acTouch"]) {
                if (lineContent.search(/Touch\s*(\d+)/i) !== -1) {
                    let parserAcTouch = sbcMapping.map.defense.acTouch
                    let acTouch = lineContent.match(/Touch\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acTouch"] = +acTouch

                    parsedSubCategories["acTouch"] = await parserAcTouch.parse(+acTouch, line+startLine)
                }
            }

            // Parse Flat-footed AC
            if (!parsedSubCategories["acFlatFooted"]) {
                if (lineContent.search(/flat-footed\s*(\d+)/i) !== -1) {
                    let parserAcFlatFooted = sbcMapping.map.defense.acFlatFooted
                    let acFlatFooted = lineContent.match(/flat-footed\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acFlatFooted"] = +acFlatFooted

                    parsedSubCategories["acFlatFooted"] = await parserAcFlatFooted.parse(+acFlatFooted, line+startLine)
                }
            }

            // Parse AC Types
            if (!parsedSubCategories["acTypes"]) {
                if (lineContent.search(/^(?:AC[^\(]*[\(])([^\)]*)/i) !== -1) {
                    let parserAcTypes = sbcMapping.map.defense.acTypes
                    let acTypes = lineContent.match(/^(?:AC[^\(]*[\(])([^\)]*)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acTypes"] = acTypes
                    
                    parsedSubCategories["acTypes"] = await parserAcTypes.parse(acTypes, line+startLine)
                }
            }

            // Parse HP and HD
            if (!parsedSubCategories["hp"]) {
                if (lineContent.search(/^(?:HP)(.*)/i) !== -1) {
                    let parserHp = sbcMapping.map.defense.hp
                    let hp = lineContent.match(/^(?:HP)(.*)/i)[1].trim()

                    parsedSubCategories["hp"] = await parserHp.parse(hp, line+startLine)
                }
            }

            // Parse Saves
            if (!parsedSubCategories["saves"]) {
                if (lineContent.search(/^(Fort\b.*)/i) !== -1) {
                    let parserSaves = sbcMapping.map.defense.saves
                    let saves = lineContent.match(/^(Fort.*)/i)[1].trim()
                    parsedSubCategories["saves"] = await parserSaves.parse(saves, line+startLine)
                }
            }

            // Parse Damage Reduction
            if (!parsedSubCategories["dr"]) {
                if (lineContent.search(/(\bDR\b)/i) !== -1) {
                    let parserDr = sbcMapping.map.defense.dr
                    let dr = lineContent.match(/(?:\bDR\b\s*)([^;,]*)/i)[1].trim()
                    parsedSubCategories["dr"] = await parserDr.parse(dr, line+startLine)
                }
            }

            // Parse Immunities
            if (!parsedSubCategories["immune"]) {
                if (lineContent.search(/(Immune\b.*)/i) !== -1) {
                    let parserImmune = sbcMapping.map.defense.immune
                    let immunities = lineContent.match(/(?:Immune)([\s\S]*?)(?=$|Resist|SR|Weakness)/i)[1].trim()
                    parsedSubCategories["immune"] = await parserImmune.parse(immunities, line+startLine)
                }
            }

            // Parse Resistances
            if (!parsedSubCategories["resist"]) {
                if (lineContent.search(/(Resist\b.*)/i) !== -1) {
                    let parserResist = sbcMapping.map.defense.resist
                    let resistances = lineContent.match(/(?:Resist\b)([\s\S]*?)(?=$|SR|Immune|Weakness)/i)[1].trim()
                    parsedSubCategories["resist"] = await parserResist.parse(resistances, line+startLine)
                }
            }

            // Parse Weaknesses / Vulnerabilities
            if (!parsedSubCategories["weakness"]) {
                if (lineContent.search(/(Weakness.*)/i) !== -1) {
                    let parserWeakness = sbcMapping.map.defense.weakness
                    let weaknesses = lineContent.match(/(?:Weaknesses|Weakness)([\s\S]*?)(?=$|Resist|Immune|SR)/i)[1].trim()
                    parsedSubCategories["weakness"] = await parserWeakness.parse(weaknesses, line+startLine)
                }
            }

            // Parse Spell Resistance
            if (!parsedSubCategories["sr"]) {
                if (lineContent.search(/(\bSR\b.*)/i) !== -1) {
                    let parserSr = sbcMapping.map.defense.sr
                    let sr = lineContent.match(/(?:\bSR\b\s*)([^;,]*)/i)[1].trim()
                    parsedSubCategories["sr"] = await parserSr.parse(sr, line+startLine)
                }
            }


            // Parse Defensive Abilities
            if (!parsedSubCategories["defensiveAbilities"]) {
                if (lineContent.search(/Defensive Abilities\b/i) !== -1) {
                    let parserDefensiveAbilities = sbcMapping.map.defense.defensiveAbilities
                    let defensiveAbilities = lineContent.match(/(?:Defensive Abilities\b\s*)([\s\S]*?)(?=$|\bDR\b|\bImmune\b|\bResist\b|\bSR\b|\bWeakness\b)/i)[1].replace(/\s*[,;]+/g,",").replace(/(,\s*$)/, "").trim()
                    sbcData.notes.defense.defensiveAbilities = defensiveAbilities
                    parsedSubCategories["defensiveAbilities"] = await parserDefensiveAbilities.parse(defensiveAbilities, line+startLine, "class-abilities")
                }
            }


        } catch (err) {
            let errorMessage = `Parsing the defense data failed at line ${line+startLine}`
            let error = new sbcError(1, "Parse/Defense", errorMessage, line+startLine)
            sbcData.errors.push(error)
            return false
        }

    }
    
    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING DEFENSE DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse AC Types
class acTypesParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Armor Class")

        try {

            sbcData.notes.defense.acTypes = "(" + value + ")"

            // Separate Context Notes from ACTypes

            let rawAcTypes = value.split(";")
            let acContextNotes = ""
            
            // If there are context notes, set them in the actor
            if (rawAcTypes.length > 1) {
                acContextNotes = rawAcTypes[1].trim()
                sbcData.characterData.actorData.data.data.attributes.acNotes = acContextNotes
            }

            let foundAcTypes = rawAcTypes[0].split(",")
            // Get supported AC Types
            let patternAcTypes = new RegExp("(" + sbcConfig.armorBonusTypes.join("\\b|\\b") + ")", "gi")

            for (let i=0; i<foundAcTypes.length; i++) {
                let foundAc = foundAcTypes[i].trim()
                let foundAcType = foundAc.match(patternAcTypes)[0]
                let foundAcTypeValue = foundAc.replace(foundAcType, "").trim()

                switch (foundAcType.toLowerCase()) {
                    case "natural":
                        sbcData.characterData.actorData.data.data.attributes.naturalAC = foundAcTypeValue
                        break
                    case "size":
                    case "dex":
                        // Ignore these cases, as they are handled by foundry
                        break
                    // Armor and Shield need to be validated against the ac changes in equipment
                    case "armor":
                    case "shield":
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
                    case "rage":
                    case "monk":
                    case "wis":
                        /* Try to put these in the front of the conversion,
                         * so that acNormal etc get handled after handling
                         * acTypes */
                        sbcData.characterData.conversionValidation.attributes[foundAcType] = foundAcTypeValue
                        
                        break
                    default:
                        break
                }

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Armor Class Types."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse HP, HD and special HD/HP Abilities (like Regeneration or Fast Healing)
class hpParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as HP/HD")

        try {

            // Check the current Items for classes and racialHD
            let currentItems = sbcData.characterData.items
            let classItems = []
            let hasOnlyRacialHd = true
            let classesLeftToParse = 0
            let parsedClasses = 0
            let isRacial = false
            let hasClassAndRacialHd = false

            for (let i=0; i<currentItems.length; i++) {
                if (currentItems[i].type === "class") {
                    let classItem = currentItems[i]

                    // Reset the HP for all classItems
                    classItem.data.data.hp = 0

                    if (classItem.data.data.classType !== "racial") {
                        hasOnlyRacialHd = false
                        classesLeftToParse++
                    } else {
                        // Reset Level of RacialHD
                        classItem.data.data.level = 0
                        isRacial = true
                    }

                    // Save the classItems for later use
                    let classWithHd = {
                        "name": classItem.name,
                        "hd": classItem.data.data.hd,
                        "level": classItem.data.data.level,
                        "isParsed": false,
                        "isRacial": isRacial
                    }
                    
                    classItems.push(classWithHd)

                }
            }

            let input = sbcUtils.sbcSplit(value)

            // Get the HitDice and the bonus HP
            let splitHpAndHd = sbcUtils.parseSubtext(input[0])

            // Get the total hp (only numbers!)
            let hpTotalInStatblock = splitHpAndHd[0].match(/(\d+)/)[1]

            sbcData.characterData.conversionValidation.attributes["hpTotal"] = hpTotalInStatblock

            // Set the current value of the actor hp
            sbcData.characterData.actorData.data.data.attributes.hp.value = +hpTotalInStatblock

            let calculatedHpTotal = 0
            let calculatedHdTotal = 0

            let hdInput = splitHpAndHd[1]
            let hdPool = hdInput.match(/(\d+d\d+)/g)
            let hdPoolsToParse = hdPool.length

            // If there are more hdPool Items (e.g. ["3d6",2d10"]) than classes
            // then the creature has class and racial hit dice
            if (hdPoolsToParse > classesLeftToParse && classesLeftToParse !== 0) {
                hasClassAndRacialHd = true
            }

            // HP Bonus Pool
            let hpBonus = 0
            // Check, if there are Bonus HP
            if (hdInput.search(/(\b[^d+\s]*\d+[^\sd+]*\b)(?!\s*HD)/i) !== -1) {
                let hpBonusPool = hdInput.match(/(\b[^d+\s]*\d+[^\sd+]*\b)(?!\s*HD)/gi)
            
                for (let i=0; i<hpBonusPool.length; i++) {
                    hpBonus += +hpBonusPool[i]
                }

            }
                        
            calculatedHpTotal += +hpBonus

            // Calculate HP from Hit Dice and distribute that to Class and RacialHD items

            // Loop through the pools
            for (let i=0; i<hdPool.length; i++) {

                let currentHitDice = hdPool[i]
                let numberOfHitDice = currentHitDice.split("d")[0]
                let sizeOfHitDice = currentHitDice.split("d")[1]

                let tempHp = +sizeOfHitDice + +Math.floor(+sbcUtils.getDiceAverage(+sizeOfHitDice) * (+numberOfHitDice-1))

                calculatedHpTotal += +tempHp
                calculatedHdTotal += +numberOfHitDice
                
                // Loop through the classItems
                for (let j=0; j<classItems.length; j++) {

                    if (numberOfHitDice > 0) {

                        let classItem = classItems[j]

                        // Check, if the sizeOfHitDice matches
                        if (+sizeOfHitDice === +classItem.hd && !classItem.isParsed) {

                            // Find the classItem with a matching name
                            let foundClassItem = sbcData.characterData.items.find(o => o.name === classItem.name)

                            let calcHp = 0

                            if (hasOnlyRacialHd) {
                                // Calculate the HP for Entries with just Racial Hit Dice
                                // These use the numberOfHitDice instead of the classItem.level 
                                calcHp = +sizeOfHitDice + +Math.floor(+sbcUtils.getDiceAverage(+sizeOfHitDice) * +numberOfHitDice)
                                // Set the HD for the racialHd as well
                                foundClassItem.data.data.level = +numberOfHitDice
                                
                                numberOfHitDice -= +numberOfHitDice
                                
                            } else if (hasClassAndRacialHd) {

                                // Calculate the HP for Entries with Class and Racial Hit Dice
                                if (parsedClasses < classesLeftToParse && !classItem.isRacial && numberOfHitDice == classItem.level) {                                    
                                    // Calculate the HP for Classes of type Class as long as there are classes left to parse
                                    calcHp = +sizeOfHitDice + +Math.floor(+sbcUtils.getDiceAverage(+sizeOfHitDice) * (+classItem.level-1))
                                    numberOfHitDice -= +classItem.level
                                    classItems[j].isParsed = true
                                    parsedClasses++
                                } else if (classItem.isRacial) {
                                    // Calculate the HP for Classes of type Class as long as there are classes left to parse
                                    calcHp = +sizeOfHitDice + +Math.floor(+sbcUtils.getDiceAverage(+sizeOfHitDice) * (+numberOfHitDice-1))
                                    classItem.level = +numberOfHitDice
                                    foundClassItem.data.data.level = classItem.level
                                    numberOfHitDice -= +classItem.level
                                    
                                    classItems[j].isParsed = true
                                } else {
                                    // THIS SHOULD NOT HAPPEN AT ALL
                                    sbcConfig.options.debug && sbcUtils.log("This should not happen while parsing hit dice and hit points. Please let me know it this happens on my github.")
                                }

                            } else {
                                // Calculate the HP for Entries with just Class Hit Dice
                                if (parsedClasses < classesLeftToParse) {
                                    // Calculate the HP for Classes of type Class as long as there are classes left to parse
                                    calcHp = +sizeOfHitDice + +Math.floor(+sbcUtils.getDiceAverage(+sizeOfHitDice) * (+classItem.level-1))
                                    numberOfHitDice -= +classItem.level
                                    classItems[j].isParsed = true
                                    parsedClasses++
                                }
                            }
                                
                            foundClassItem.data.data.hp = +calcHp

                        } 

                    } 
                
                }

                // Save Total HP and HD for the preview
                sbcData.notes.defense["hpTotal"] = hpTotalInStatblock
                sbcData.notes.defense["hdTotal"] = calculatedHdTotal
                sbcData.notes.defense["hdPool"] = hdInput

            }

            // If there is data after the hd in brackets, add it as a special hdAbility
            if (input.length > 1) {

                let hdAbilities = []

                let hdAbilitiesPattern = new RegExp("(\\bregeneration\\b|\\bfast healing\\b)", "gi")


                for (let i=1; i<input.length; i++) {

                    let tempInput = input[i]

                    // Check, if the input matches "regeneration" or "fast healing"
                    if (tempInput.search(hdAbilitiesPattern) !== -1) {
                        // Input the hdAbility into the correct places in the sheet
                        let hpAbilityType = tempInput.match(hdAbilitiesPattern)[0].toLowerCase()

                        switch (hpAbilityType) {
                            case "regeneration":
                                let parserRegeneration = new singleValueParser(["data.traits.regen"], "string")
                                await parserRegeneration.parse(tempInput, line)
                                break
                            case "fast healing":
                                let parserFastHealing = new singleValueParser(["data.traits.fastHealing"], "string")
                                await parserFastHealing.parse(tempInput, line)
                                break
                            default:
                                break
                        }
                        hdAbilities.push(tempInput)
                    } else {
                        // Generate a placeholder for every hdAbility that is not accounted for in the character sheet
                        let hdAbility = {
                            "name": tempInput,
                            "type": "misc"
                        }
    
                        hdAbilities.push(hdAbility.name)
                        
                        let placeholder = await sbcUtils.generatePlaceholderEntity(hdAbility, line)
                        sbcData.characterData.items.push(placeholder)
                    }

                    

                }

                sbcData.notes.defense["hdAbilities"] = hdAbilities.join(", ")

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as HP/HD."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            throw err
            return false

        }

    }

}

// Parse Saves and Save Context Notes
class savesParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Saves")

        try {

            let input = sbcUtils.parseSubtext(value)
            let saveContext = ""

            if (input[1]) {
                saveContext = input[1]
            }

            if (input[0].search(/;/) !== -1) {
                saveContext = input[0].split(/;/)[1]
            }

            // Separate the Saves
            let saves = input[0]

            let fortSave = saves.match(/(?:Fort\s*[\+\-])(\d+)/i)[1]
            let refSave = saves.match(/(?:Ref\s*[\+\-])(\d+)/i)[1]
            let willSave = saves.match(/(?:Will\s*[\+\-])(\d+)/i)[1]

            sbcData.characterData.conversionValidation.attributes["fort"] = fortSave
            sbcData.notes.defense["fortSave"] = fortSave
            sbcData.characterData.conversionValidation.attributes["ref"] = refSave
            sbcData.notes.defense["refSave"] = refSave
            sbcData.characterData.conversionValidation.attributes["will"] = willSave
            sbcData.notes.defense["willSave"] = willSave

            // Check if there are context notes for the saves
            if (saveContext !== "") {                
                sbcData.characterData.actorData.data.data.attributes.saveNotes = saveContext
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Saves."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Immunities
class immuneParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Immunities")

        try {

            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
            let input = sbcUtils.sbcSplit(rawInput)
            
            sbcData.notes.defense["immune"] = rawInput

            let systemSupportedConditionTypes = Object.values(CONFIG["PF1"].conditionTypes).map(x => x.toLowerCase())
            let patternConditionTypes = new RegExp("(" + systemSupportedConditionTypes.join("\\b|\\b") + ")", "gi")

            let systemSupportedDamageTypes = Object.values(CONFIG["PF1"].damageTypes).map(x => x.toLowerCase())
            let patternDamageTypes = new RegExp("(" + systemSupportedDamageTypes.join("\\b|\\b") + ")", "gi")

            for (let i=0; i<input.length; i++) {
                let immunity = input[i]
                    .replace(/Effects/gi, "")
                    .trim()
                
                if (immunity.search(patternConditionTypes) !== -1) {
                    // its a condition immunity
                    sbcData.characterData.actorData.data.data.traits.ci.value.push(sbcUtils.camelize(immunity))
                } else if (immunity.search(patternDamageTypes) !== -1) {
                    // its a damage immunity
                    sbcData.characterData.actorData.data.data.traits.di.value.push(sbcUtils.camelize(immunity))
                } else {
                    // Its a custom immunity
                    sbcData.characterData.actorData.data.data.traits.ci.custom += sbcUtils.capitalize(immunity) + ";"
                }
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Immunities."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Resistances
class resistParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Resistances")

        try {

            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
            let input = sbcUtils.sbcSplit(rawInput)

            sbcData.notes.defense["resist"] = rawInput

            let systemSupportedConditionTypes = Object.values(CONFIG["PF1"].conditionTypes).map(x => x.toLowerCase())
            let patternConditionTypes = new RegExp("(" + systemSupportedConditionTypes.join("\\b|\\b") + ")", "gi")

            let systemSupportedDamageTypes = Object.values(CONFIG["PF1"].damageTypes).map(x => x.toLowerCase())
            let patternDamageTypes = new RegExp("(" + systemSupportedDamageTypes.join("\\b|\\b") + ")", "gi")

            for (let i=0; i<input.length; i++) {
                let resistance = input[i]
                    .replace(/Effects/gi, "")
                    .trim()
                
                if (resistance.search(patternConditionTypes) !== -1) {
                    // its a condition resistance
                    sbcData.characterData.actorData.data.data.traits.cres += sbcUtils.capitalize(resistance) + ";"
                } else if (resistance.search(patternDamageTypes) !== -1) {
                    // its a damage resistance
                    sbcData.characterData.actorData.data.data.traits.eres += sbcUtils.capitalize(resistance) + ";"
                } else {
                    // Its a custom resistance, as there is no place for that, just put it into energy resistances
                    sbcData.characterData.actorData.data.data.traits.eres += sbcUtils.capitalize(resistance) + ";"
                }
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Resistances."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Weaknesses / Vulnerabilities
class weaknessParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Weaknesses")

        try {

            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
            let input = sbcUtils.sbcSplit(rawInput)

            sbcData.notes.defense["weakness"] = rawInput

            let systemSupportedDamageTypes = Object.values(CONFIG["PF1"].damageTypes).map(x => x.toLowerCase())

            let patternDamageTypes = new RegExp("(" + systemSupportedDamageTypes.join("\\b|\\b") + ")", "gi")

            for (let i=0; i<input.length; i++) {
                let weakness = input[i]
                    .replace(/Effects/gi, "")
                    .trim()
                
                if (weakness.search(patternDamageTypes) !== -1) {
                    let matchedWeakness = weakness.match(patternDamageTypes)[0]
                    // its a damage resistance
                    sbcData.characterData.actorData.data.data.traits.dv.value.push(sbcUtils.camelize(matchedWeakness))
                } else {
                    // Its a custom resistance, as there is no place for that, just put it into energy resistances
                    sbcData.characterData.actorData.data.data.traits.dv.custom += sbcUtils.capitalize(weakness) + ";"
                }
            }

            // Remove any semicolons at the end of the custom vulnerabilities
            sbcData.characterData.actorData.data.data.traits.dv.custom = sbcData.characterData.actorData.data.data.traits.dv.custom.replace(/(;)$/, "")            

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Weaknesses."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Spell Resistance
class srParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Spell Resistance")

        try {

            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
            let input = sbcUtils.parseSubtext(rawInput)

            let srTotal = input[0]
            let srContext = ""

            if (input[1]){
                srContext = input[1]
                sbcData.characterData.actorData.data.data.attributes.srNotes = srContext
            }

            sbcData.characterData.actorData.data.data.attributes.sr.total = srTotal
            sbcData.characterData.actorData.data.data.attributes.sr.formula = srTotal.toString()

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Spell Resistance."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

/* ------------------------------------ */
/* Parser for offense data              */
/* ------------------------------------ */
export async function parseOffense(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING OFFENSE DATA")
    
    let parsedSubCategories = []
    sbcData.notes["offense"] = {}
    sbcData.notes.offense.spellBooks = {}

    // Setup indices, booleans and arrays for spell-parsing
    let rawSpellBooks = {}
    let spellBooksFound = 0
    let currentSpellBook = 0
    let currentSpellBookType = {
        "0": "primary",
        "1": "secondary",
        "2": "tertiary"
    }
    let startIndexOfSpellLikeAbilities = 0
    let startIndexOfSpellBooks = []
    let spellLikeAbilitiesFound = false
    let endOfSpellLikeAbilitiesFound = false
    let endOfSpellBookFound = []

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            // Parse Base Speed
            if (!parsedSubCategories["landSpeed"]) {
                if (lineContent.search(/^Speed\s*/i) !== -1) {
                    let parserLandSpeed = sbcMapping.map.offense.speed
                    let landSpeed = lineContent.match(/^Speed\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["landSpeed"] = await parserLandSpeed.parse(landSpeed, "land", line+startLine)
                }
            }

            // Parse Swim Speed
            if (!parsedSubCategories["swimSpeed"]) {
                if (lineContent.search(/\bSwim\s*/i) !== -1) {
                    let parserSwimSpeed = sbcMapping.map.offense.speed
                    let swimSpeed = lineContent.match(/\bSwim\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["swimSpeed"] = await parserSwimSpeed.parse(swimSpeed, "swim", line+startLine)
                }
            }

            // Parse Climb Speed
            if (!parsedSubCategories["climbSpeed"]) {
                if (lineContent.search(/\bClimb\s*/i) !== -1) {
                    let parserClimbSpeed = sbcMapping.map.offense.speed
                    let climbSpeed = lineContent.match(/\bClimb\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["climbSpeed"] = await parserClimbSpeed.parse(climbSpeed, "climb", line+startLine)
                }
            }

            // Parse Burrow Speed
            if (!parsedSubCategories["burrowSpeed"]) {
                if (lineContent.search(/\bBurrow\s*/i) !== -1) {
                    let parserBurrowSpeed = sbcMapping.map.offense.speed
                    let burrowSpeed = lineContent.match(/\bBurrow\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["burrowSpeed"] = await parserBurrowSpeed.parse(burrowSpeed, "burrow", line+startLine)
                }
            }

            // Parse Fly Speed
            if (!parsedSubCategories["flySpeed"]) {
                if (lineContent.search(/\bFly\s*/i) !== -1) {
                    let parserFlySpeed = sbcMapping.map.offense.speed
                    let flySpeed = lineContent.match(/\bFly\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["flySpeed"] = await parserFlySpeed.parse(flySpeed, "fly", line+startLine)
                }
            }

            // Parse Speed Abilities
            // WIP

            // Parse Melee Attacks
            if (!parsedSubCategories["melee"]) {
                if (lineContent.search(/^Melee\s*/i) !== -1) {
                    let parserMelee = sbcMapping.map.offense.attacks
                    let melee = lineContent.match(/^Melee\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.melee = melee

                    parsedSubCategories["melee"] = await parserMelee.parse(melee, "mwak", line+startLine)
                }
            }

            // Parse Ranged Attacks
            if (!parsedSubCategories["ranged"]) {
                if (lineContent.search(/^Ranged\s*/i) !== -1) {
                    let parserRanged = sbcMapping.map.offense.attacks
                    let ranged = lineContent.match(/^Ranged\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.ranged = ranged

                    parsedSubCategories["ranged"] = await parserRanged.parse(ranged, "rwak", line+startLine)
                }
            }

            // Parse Special Attacks
            if (!parsedSubCategories["specialAttacks"]) {
                if (lineContent.search(/^Special\s+Attacks\b\s*/i) !== -1) {
                    let parserSpecialAttacks = sbcMapping.map.offense.specialAttacks
                    let specialAttacks = lineContent.match(/^Special\s+Attacks\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.specialAttacks = specialAttacks

                    parsedSubCategories["specialAttacks"] = await parserSpecialAttacks.parse(specialAttacks, line+startLine)
                }
            }

            // Parse Spell-Like Abilities
            if (!parsedSubCategories["spellLikeAbilities"]) {
                /* Collate all lines that are part of the Spell-Like Abilities,
                 * by putting all lines found after the keyword ...
                 * ... up until the end of the section or
                 * ... up until the next keyword
                 * into an array
                 */
                
                // Start with the line containing the keyword, CL and other base info
                if (lineContent.search(/^Spell-Like\s+Abilities\b\s*/i) !== -1) {

                    spellLikeAbilitiesFound = true

                    sbcData.notes.offense.hasSpellcasting = true

                    // Set the startIndexOfSpellLikeAbilities to the line in the current offense section
                    startIndexOfSpellLikeAbilities = line

                    // Set casterLevel and concentrationBonus
                    let casterLevel = 0
                    let concentrationBonus = 0

                    if (lineContent.match(/\bCL\b\s*(\d+)/i) !== null) {
                        casterLevel = lineContent.match(/\bCL\b\s*(\d+)/i)[1]
                    }

                    if (lineContent.match(/\bConcentration\b\s*\+(\d+)/i) !== null) {
                        concentrationBonus = lineContent.match(/\bConcentration\b\s*\+(\d+)/i)[1]
                    }

                    // Push the line into the array holding the raw data for Spell-Like Abilities
                    rawSpellBooks[spellBooksFound] = {
                        "firstLine": lineContent,
                        "spells": [],
                        "spellCastingType": "spontaneous",
                        "spellCastingClass": "_hd",
                        "casterLevel": casterLevel,
                        "concentrationBonus": concentrationBonus,
                        "spellBookType": "spelllike"
                    }

                    currentSpellBook = spellBooksFound
                    //spellBooksFound += 1

                }

                /* If there are Spell-Like Abilities
                 * and the current line comes after the start of this section
                 */

                if (spellLikeAbilitiesFound && +line > +startIndexOfSpellLikeAbilities) {

                    /* If the line contains any of the keyswords that denote a new spell section
                     * like "spells prepared" or "spells known"
                     * set endOfSpellLikeAbilitiesFound to true
                     */ 
                    if (lineContent.search(/Spells (?:Prepared|Known)/gi) !== -1) {
                        endOfSpellLikeAbilitiesFound = true
                    }

                    // If the end of the section containing these was not found
                    if (!endOfSpellLikeAbilitiesFound) {
                        // Push the line into the array holding the raw data for Spell-Like Abilities
                        //rawSpellLikeAbilities.push(lineContent)
                        rawSpellBooks[currentSpellBook].spells.push(lineContent)
                    }

                }
                
            }

            // Parse Spells Prepared
            if (!parsedSubCategories["spellBooks"]) {
                /* Collate all lines that are part of the prepared spells,
                 * by putting all lines found after the keyword ...
                 * ... up until the end of the section or
                 * ... up until the next keyword
                 * into an array
                 */
                
                // Start with the line containing the keyword, CL and other base info
                if (lineContent.search(/Spells (?:Prepared|Known)\b\s*/i) !== -1) {

                    currentSpellBook = spellBooksFound
                    startIndexOfSpellBooks[currentSpellBook] = line
                    spellBooksFound += 1

                    sbcData.notes.offense.hasSpellcasting = true

                    // Check for the spellCastingType (Spontaneous is default)
                    // Set casterLevel and concentrationBonus
                    // Set spellCastingClass (hd is default)

                    let spellCastingType = "spontaneous"
                    let casterLevel = 0
                    let concentrationBonus = 0
                    let spellCastingClass = "hd"

                    if (lineContent.match(/prepared/i) !== null) {
                        spellCastingType = "prepared"
                    }

                    if (lineContent.match(/\bCL\b\s*(\d+)/i) !== null) {
                        casterLevel = lineContent.match(/\bCL\b\s*(\d+)/i)[1]
                    }

                    if (lineContent.match(/\bConcentration\b\s*\+(\d+)/i) !== null) {
                        concentrationBonus = lineContent.match(/\bConcentration\b\s*\+(\d+)/i)[1]
                    }

                    let patternSupportedClasses = new RegExp("(" + sbcConfig.classes.join("\\b|\\b") + ")", "gi")
                    let patternPrestigeClasses = new RegExp("(" + sbcConfig.prestigeClassNames.join("\\b|\\b") + ")(.*)", "gi")
                    let patternWizardClasses = new RegExp("(" + sbcContent.wizardSchoolClasses.join("\\b|\\b") + ")(.*)", "gi")

                    if (lineContent.match(patternSupportedClasses) !== null) {
                        spellCastingClass = lineContent.match(patternSupportedClasses)[0]
                    }

                    if (lineContent.match(patternPrestigeClasses) !== null) {
                        spellCastingClass = lineContent.match(patternPrestigeClasses)[0]
                    }

                    if (lineContent.match(patternWizardClasses) !== null) {
                        spellCastingClass = lineContent.match(patternWizardClasses)[0]
                    }

                    // Push the line into the array holding the raw data for spellBook
                    rawSpellBooks[spellBooksFound] = {
                        "firstLine": lineContent,
                        "spells": [],
                        "spellCastingClass": spellCastingClass,
                        "spellCastingType": spellCastingType,
                        "casterLevel": casterLevel,
                        "concentrationBonus": concentrationBonus,
                        "spellBookType": currentSpellBookType[currentSpellBook]
                    }

                    //rawSpellBooks[spellBooksFound].data.push(lineContent)

                }

                /* If there are Spells prepared
                 * and the current line comes after the start of this section
                 */

                if (spellBooksFound !== 0 && currentSpellBook == spellBooksFound-1 && +line > +startIndexOfSpellBooks[currentSpellBook]) {

                    /* If the line contains any of the keyswords that denote a new spell section
                     * like "spells prepared" or "spells known"
                     * set endOfSpellBookFound to true
                     */

                    if (lineContent.search(/Spells (?:Prepared|Known)/gi) !== -1) {
                        endOfSpellBookFound[spellBooksFound] = true
                    }

                    // If the end of the section containing these was not found
                    if (!endOfSpellBookFound[spellBooksFound]) {
                        // Push the line into the array holding the raw data for Spell-Like Abilities
                        rawSpellBooks[spellBooksFound].spells.push(lineContent)
                    }

                    

                }
                
            }

            /* If this is the last line of the offense block
             * send spellBooks (if available) to the spellBooksParser
             * and the notes section
             */
                    
            if (line == data.length-1) {

                let keysRawSpellBooks = Object.keys(rawSpellBooks)

                if (keysRawSpellBooks.length > 0) {

                    let parserSpellBooks = sbcMapping.map.offense.spellBooks

                    for (let i=0; i<keysRawSpellBooks.length; i++) {
                        
                        let keyRawSpellBook = keysRawSpellBooks[i]
                        let rawSpellBook = rawSpellBooks[keyRawSpellBook]

                        let spellBookNote = [
                            rawSpellBook.firstLine
                        ]
                        spellBookNote = spellBookNote.concat(rawSpellBook.spells)

                        sbcData.notes.offense["spellBooks"][i] = spellBookNote

                        await parserSpellBooks.parse(rawSpellBook, startIndexOfSpellBooks[i])
                    }
                }

            }

        } catch (err) {
            let errorMessage = `Parsing the offense data failed at line ${line+startLine}`
            let error = new sbcError(1, "Parse/Offense", errorMessage, line+startLine)
            sbcData.errors.push(error)
            throw err
            return false
        }
    
    }
    
    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING OFFENSE DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse Speed
class speedParser extends sbcParserBase {

    async parse(value, type, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Speed of type " + type + ".")

        try {

            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
            let input = sbcUtils.parseSubtext(rawInput)

            sbcData.notes.offense.speed = rawInput

            let speed = input[0].match(/(\d+)/)[1]
            let speedContext = ""

            sbcData.characterData.conversionValidation.attributes[type] = +speed
            sbcData.characterData.actorData.data.data.attributes.speed[type].base = +speed

            let flyManeuverabilitiesPattern = new RegExp("(" + Object.values(CONFIG["PF1"].flyManeuverabilities).join("\\b|\\b") + ")", "i")

            if (input[1]) {
                if (type === "fly") {
                    let flyManeuverability = input[1].match(flyManeuverabilitiesPattern)[1]
                    sbcData.characterData.actorData.data.data.attributes.speed.fly.maneuverability = flyManeuverability
                    if (input[2]) {
                        speedContext = input[2]
                    }
                } else {
                    speedContext = input[1]
                }
            }

            if (speedContext !== "") {
                // WIP DO STUFF WITH SPEED CONTEXT NOTES
                // CURRENTLY THE SHEET DOES NOT SUPPORT THEM
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Speed of type " + type + "."
            let error = new sbcError(1, "Parse/Offense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Attacks
class attacksParser extends sbcParserBase {

    async parse(value, type, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as " + type + "-Attack.")

        try {

            let rawInput = value
                .replace(/(, or)/g, " or")
                .replace(/, \band\b /g, " and ")
                .replace(/\band\b (?![^(]*\)|\()/g,",")
            let attackGroups = rawInput.split(/\bor\b/g)

            let attackGroupKeys = Object.keys(attackGroups)
    
            for (var i = 0; i < attackGroupKeys.length; i++) {

                // Attacks
                let attacks = attackGroups[i]
                // Split the attacks into single attacks
                // attacks = attacks.split(/,/g);
                attacks = attacks.split(/(?:[^0-9]),(?:[^0-9])/g)
                let attackKeys = Object.keys(attacks)
        
                // Loop over all attacks in the attackGroup
                for (let j = 0; j < attackKeys.length; j++) {

                    /* ------------------------------------ */
                    /* [1] PARSE THE ATTACK DATA	    	*/
                    /* ------------------------------------ */

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

                    let attack = attacks[j].trim()

                    let numberOfAttacks = 1
                    let enhancementBonus = 0
                    let attackName = ""
                    //let attackModifier = 0
                    let inputAttackModifier = 0
                    let numberOfDamageDice = 0
                    let damageDie = 0
                    let damageBonus = 0
                    let damageModifier = 0
                    let defaultDamageType = ""
                    let damageType = ""
                    let specialDamageType = ""
                    let specialDamageTypeFound = false
                    let weaponSpecial = "-"
                    let critRange = 20
                    let critMult = 2
                    let attackEffects = ""
                    let mwkWeapon = false
                    let numberOfIterativeAttacks = 0
                    let attackNotes = ""
                    let attackAbilityType = ""
                    let damageAbilityType = ""
                    let attackRangeUnits = ""
                    let attackRangeIncrement = ""
                                
                    // Search for Touch or Ranged Touch
                    if (attack.search(/(?:\d+\s*)(ranged\s*touch|melee\s*touch|touch)(?:\s*\()/i) !== -1) {
                        let specialAttackType = attack.match(/(ranged\s*touch|melee\s*touch|touch)/i)[1]
                        attackNotes += specialAttackType + "\n"
                        attack = attack.replace(/(ranged\s*touch|melee\s*touch|touch)/i, "")
                    }
                             
                    // Check if its Melee or Ranged
                    let attackAttrModifier = 0
                    if (type === "mwak") {
                        
                        // check for noStr-Flag
                        if (!sbcConfig.options.flags.noStr) {
                            /* 
                             * Calculate the attackAttrModifier via the value given in the statblock,
                             * not the one currently in the actor (as this may be changed when embeddedItems get updated in the permanent actor)
                             */
                            // attackAttrModifier = +sbcData.characterData.actorData.data.data.abilities.str.mod
                            attackAttrModifier = +sbcUtils.getModifier(sbcData.notes.statistics.str)

                            // set abilityTypes
                            attackAbilityType = "str"
                            damageAbilityType = "str"
                            attackRangeUnits = "melee"
                        } 

                    }
                    
                    if (type === "rwak") {
                        // check for noDex-Flag
                        if (!sbcConfig.options.flags.noDex) {
                            //attackAttrModifier = +sbcData.characterData.actorData.data.data.abilities.dex.mod
                            attackAttrModifier = +sbcUtils.getModifier(sbcData.notes.statistics.dex)
                            // set abilityTypes
                            attackAbilityType = "dex"
                            damageAbilityType = "str"
                            // Check if its a normal bow or a crossbow, because these don't use "str" as the damage ability type
                            if (attack.search(/(bow\b)/i) !== -1 && attack.search(/(\bcomposite\b)/i) === -1) {
                                damageAbilityType = ""
                            }

                            attackRangeUnits = "ft"
                            attackRangeIncrement = "5"
                        } 

                    }
                                
                    // numberOfAttacks
                    if (attack.match(/(^\d+)/) !== null) {
                        numberOfAttacks = attack.match(/(^\d+)/)[1];
                        attackNotes += numberOfAttacks + " "
                    }

                    // enhancementBonus
                    if (attack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/) !== null) {
                        enhancementBonus = attack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/)[1];
                        attackNotes += "+" + enhancementBonus + " "
                    }

                    // Masterwork
                    if (attack.match(/\bmwk\b/i) !== null) {
                        mwkWeapon = true
                        attackNotes += "mwk "
                    }

                    // attackName
                    if (attack.match(/(\b[a-zA-Z*]+)(?:[ +0-9(/]+\(*)/) !== null) {
                        attackName = attack.match(/(\b[a-zA-Z *]+)(?:[ +0-9(/]+\(*)/)[1].replace(/^ | $/g, "").replace(/\bmwk\b /i, "").replace(/\*/, "")
                        
                        // Special ActionType for swarmAttacks
                        if (attackName.search(/\bSwarm\b/i) !== -1) {
                            type = "other"
                        }
                        
                        attackNotes += attackName + " "
                    }
                    
                    // attackModifier
                    if (attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\(*)/) !== null) {
                        inputAttackModifier = attack.match(/(\+\d+|-\d+)(?:[+0-9/ ]+\(*)/)[1]
                        attackNotes += inputAttackModifier                        
                    }
                        
                    // numberOfIterativeAttacks, when given in the statblock in the form of
                    // for example: +5 Vorpal Short Sword +15/+10/+5 (1d6+15 plus Vorpal)
                    if (attack.match(/(\/\+\d+)/) !== null) {
                        numberOfIterativeAttacks = attack.match(/(\/\+\d+)/g).length
                        for (let i = numberOfIterativeAttacks; i>=1; i--) {
                            attackNotes += "/+" + (inputAttackModifier-(inputAttackModifier-(5*i)))
                        }
                    }
                    
                    /* ------------------------------------ */
                    /* Damage Calculation		        	*/
                    /* ------------------------------------ */
                        
                    // If the attack has damage dice
                    if (attack.match(/\d+d\d+/) !== null) {
                        // NumberOfDamageDice and DamageDie
                        if (attack.match(/\d+d\d+/) !== null) {
                            numberOfDamageDice = attack.match(/(\d+)d(\d+)/)[1]
                            damageDie = attack.match(/(\d+)d(\d+)/)[2]
                            attackNotes += " (" + numberOfDamageDice + "d" + damageDie
                        }
                        // damageBonus
                        if (attack.match(/(?:d\d+)(\+\d+|\-\d+)/) !== null) {
                            damageBonus = attack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1]
                            let notesDamageBonus = attack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1];               
                            attackNotes += notesDamageBonus
                        }
                        // critRange
                        if (attack.match(/(?:\/)(\d+)(?:-\d+)/) !== null) {
                            critRange = attack.match(/(?:\/)(\d+)(?:-\d+)/)[1]
                            attackNotes += "/" + critRange + "-20"
                        }
                        // critMult
                        if (attack.match(/(?:\/x)(\d+)/) !== null) {
                            critMult = attack.match(/(?:\/x)(\d+)/)[1]
                            attackNotes += "/x" + critMult
                        }

                        // attackEffects
                        if (attack.match(/(?:\(\d+d\d+[\+\d\/\-x\s]*)([^\)\n]*)(?:$|\))/) !== null) {
                            attackEffects = attack.match(/(?:\(\d+d\d+[\+\d\/\-x\s]*)([^\)\n]*)(?:$|\))/)[1]
                            attackNotes += " " + attackEffects
                            attackEffects = attackEffects.replace(/(\s+\band\b\s+)/i, ",").replace(/(\s*\bplus\b\s+)/i, ",").split(",")
                        }

                        // add the closing parenthesis to the attack notes
                        attackNotes += ")"

                    } else if (attack.match(/\(([^)]*)\)/) !== null){
                        // If there is just a specialEffect in parenthesis
                        let specialEffect = attack.replace(/\s+/g, " ").match(/\(([^)]*)\)/)[1]
                        attackNotes += " (" + specialEffect + ")"
                        attackEffects += specialEffect
                    } else {
                        // If there are neither damage dice nor special effects in parenthesis
                        sbcConfig.options.debug && sbcUtils.log("Kind of embarrasing, but this should never happen.")
                    }
                    
                    

                    /* ------------------------------------ */
                    /* [2] CREATE AN ATTACK WITH THAT DATA	*/
                    /* ------------------------------------ */

                    /*
                    console.log("numberOfAttacks: " + numberOfAttacks)
                    console.log("enhancementBonus: "+ enhancementBonus)
                    console.log("attackName: "+ attackName)
                    //console.log("attackModifier: "+ attackModifier)
                    console.log("inputAttackModifier: "+ inputAttackModifier)
                    console.log("numberOfDamageDice: "+ numberOfDamageDice)
                    console.log("damageDie: "+ damageDie)
                    console.log("damageBonus: "+ damageBonus)
                    console.log("damageModifier: "+ damageModifier)
                    console.log("defaultDamageType: "+ defaultDamageType)
                    console.log("weaponSpecial: "+ weaponSpecial)
                    console.log("critRange: "+ critRange)
                    console.log("critMult: "+ critMult)
                    console.log("attackEffects: "+ attackEffects)
                    console.log("mwkWeapon: "+ mwkWeapon)
                    console.log("numberOfIterativeAttacks: "+ numberOfIterativeAttacks)
                    console.log("attackNotes: "+ attackNotes)
                    */
                                      

                    // Create a temporary item
                    let newAttack = await Item.create({
                        "name": sbcUtils.capitalize(attackName),
                        "type": "attack",
                        "hasAction": "true",
                        "hasAttack": "true",
                        "hasDamage": "true",
                        "hasEffect": "true",
                        "hasMultiAttack": "false",
                        "hasUses": "false",
                        "data": {
                            "description": {
                                "value": ""
                            },
                            "ability": {
                                "attack": attackAbilityType,
                                "critMult": critMult,
                                "critRange": critRange,
                                "damage": damageAbilityType,
                                "damageMult": 1
                            },
                            "actionType": type,
                            "activation": {
                                "cost": 1,
                                "type": "attack"
                            },
                            "attackName": sbcUtils.capitalize(attackName),
                            "attackNotes": attackNotes,
                            "attackParts": [],
                            "attackType": "weapon",
                            "damage": {
                                "critParts": [],
                                "nonCritParts": [],
                                "parts": []
                            },
                            "duration": {
                                "units": "inst"
                            },
                            "effectNotes": attackEffects.join(", "),
                            "primaryAttack": false,
                            "range": {
                                "units": attackRangeUnits,
                                "value": attackRangeIncrement
                            }
                        },
                        "img": ""
                    }, { temporary : true })

                    // Check, if the attack is a natural attack
                    let naturalAttacksKeys = Object.keys(sbcContent.naturalAttacks)
                    let naturalAttacksPattern = new RegExp("(" + naturalAttacksKeys.join("s*\\b|\\b") + ")", "i")

                    let secondaryNaturalAttackPenalty = 0

                    if (attackName.search(naturalAttacksPattern) !== -1) {

                        let tempNaturalAttack = sbcContent.naturalAttacks[attackName.replace(/s$/,"")]

                        newAttack.data.data.attackType = "natural"
                        newAttack.data.data.primaryAttack = tempNaturalAttack.primaryAttack
                        
                        // If its a secondary attack, give it a malus of 5
                        if (!newAttack.data.data.primaryAttack) {
                            secondaryNaturalAttackPenalty = 5
                        }

                        newAttack.data.img = tempNaturalAttack.img

                    }

                    // Set Masterwork Status
                    if (mwkWeapon) {
                        newAttack.data.name = "Mwk " + sbcUtils.capitalize(attackName)
                        newAttack.data.data.masterwork = true
                    }

                    // Change the attackName if there is an enhancementBonus
                    if (enhancementBonus) {
                        newAttack.data.name = "+" + enhancementBonus + " " + sbcUtils.capitalize(attackName)
                        newAttack.data.data.enh = enhancementBonus
                        newAttack.data.data.masterwork = true
                    }
                    
                    // Calculate differences between given and calculated attack modifiers
                    let calculatedAttackBonus = 0
                    let calculatedAttackModifier = 
                              +sbcData.characterData.actorData.data.data.attributes.bab.total
                            + +CONFIG["PF1"].sizeMods[sbcData.characterData.actorData.data.data.traits.size]
                            + +attackAttrModifier
                            + +mwkWeapon                    // Use the boolean for this calculation
                            + +enhancementBonus
                            - +secondaryNaturalAttackPenalty

                    if (+calculatedAttackModifier !== +inputAttackModifier) {
                        calculatedAttackBonus = +inputAttackModifier - +calculatedAttackModifier
                    }

                    newAttack.data.data.attackBonus = calculatedAttackBonus.toString()

                    // Push extra attacks from numberOfAttacks
                    for (let i=1; i<numberOfAttacks; i++) {
                        newAttack.data.data.attackParts.push(
                            [
                                "0",
                                sbcUtils.capitalize(attackName) + ": " + i
                            ]
                        )
                    }

                    // Push extra attacks from numberOfIterativeAttacks
                    for (let i=1; i<=numberOfIterativeAttacks; i++) {
                        newAttack.data.data.attackParts.push(
                            [
                                +(i*-5),
                                "Iterative Attack with " + (i*-5)
                            ]
                        )
                    }

                    // Push Damage Parts & Calculate the difference between input and calculatedDamageBonus
                    let strDamageBonus = 0 
                    if (damageAbilityType === "str") {
                        // Use the value given in the statblock instead of the one currently in the actor
                        // strDamageBonus = +sbcData.characterData.actorData.data.data.abilities.str.mod
                        strDamageBonus = +sbcUtils.getModifier(sbcData.notes.statistics.str)
                    }

                    let calculatedDamageBonus =
                          +strDamageBonus
                        + +enhancementBonus
                        - +secondaryNaturalAttackPenalty

                    damageModifier = +damageBonus - +calculatedDamageBonus

                    // Try to find the defaultDamageType by checking if the attackName can be found in enumAttackDamageTypes
                    // This is done to find common damage types of attacks and weapons
                    // e.g. bite is piercing, bludgeoning and slashing
                    let attackDamageTypeKeys = Object.keys(sbcContent.attackDamageTypes)
                    if (attackName !== "") {
                        let damageTypePattern = new RegExp("(^\\b" + attackName.replace(/(\bmwk\b|s$)/ig,"").trim() + "\\b$)", "ig");
                    
                        for (let i=0; i < attackDamageTypeKeys.length; i++) {
                            let attackDamageTypeKey = attackDamageTypeKeys[i]
                            let attackDamageType = sbcContent.attackDamageTypes[attackDamageTypeKey]
                            if (attackDamageTypeKey.toLowerCase().search(damageTypePattern) !== -1) {
                                defaultDamageType = attackDamageType.type
                                weaponSpecial = attackDamageType.special
                                // If the Weapon has Range Increment and it is used for a ranged attack
                                // Set the range increment accordingly
                                if (attackDamageType.rangeIncrement && type === "rwak") {
                                    newAttack.data.data.range.value = attackDamageType.rangeIncrement
                                }
                                
                                // If the weapon has special properties, add that to the attackNotes
                                if (weaponSpecial !== "-") {
                                    attackNotes += "\nWeapon Qualities: [" + weaponSpecial + "]"
                                }
                            }
                        }
                    }

                    // Check for specialDamageTypes
                    // Check, if the attackEffect denotes a valid damageType for the base damage,
                    
                    // and use this override the default damage type
                    for (let k = 0; k<attackEffects.length; k++) {
                        let attackEffect = attackEffects[k]

                        let systemSupportedDamageTypes = Object.values(CONFIG["PF1"].damageTypes).map(x => x.toLowerCase())
                        let patternDamageTypes = new RegExp("(" + systemSupportedDamageTypes.join("\\b|\\b") + ")", "gi")

                        // If the attackEffect has no additional damagePools XdY ...
                        if (attackEffect.match(/\d+d\d+/) === null) {

                            // ... and it matches any of the supported damageTypes ...
                            if (attackEffect.search(patternDamageTypes) !== -1) {
                                specialDamageType = attackEffect.match(patternDamageTypes)[0].trim()
                                // Remove the found attackEffect from the attackEffects array
                                attackEffects.splice(k,1)
                                specialDamageTypeFound = true
                            }

                        } else {

                            // ... if the attackEffect has damagePools, create a new damageEntry for the attack

                            let attackEffectDamage = attackEffect.match(/(\d+d\d+\+*\d*)/)[0]
                            
                            let attackEffectDamageType = "untyped"

                            // ... if the attackEffect has damage and a damageType
                            // otherwise use default "untyped"
                            if (attackEffect.search(patternDamageTypes) !== -1) {
                                attackEffectDamageType = attackEffect.match(patternDamageTypes)[0].trim()
                            }

                            // Push the damage values to the attack
                            newAttack.data.data.damage.nonCritParts.push(
                                [
                                    attackEffectDamage,
                                    attackEffectDamageType
                                ]
                            )
                            // Remove the found attackEffect from the attackEffects array
                            attackEffects.splice(k,1)

                        }
                        
                    }

                    // Set the main damageType
                    if (specialDamageTypeFound) {
                        damageType = specialDamageType
                    } else {
                        damageType = defaultDamageType
                    }

                    // Push the damage values to the attack
                    newAttack.data.data.damage.parts.unshift(
                        [
                            numberOfDamageDice + "d" + damageDie + "+" + damageModifier,
                            damageType
                        ]
                    )

                    // Push attackNotes and effectNotes
                    newAttack.data.data.attackNotes = attackNotes;
                    newAttack.data.data.effectNotes = sbcUtils.makeValueRollable(attackEffects.join("\n"))

                    sbcData.characterData.items.push(newAttack)
                }

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as " + type + "-Attack." + err
            let error = new sbcError(1, "Parse/Offense", errorMessage, line)
            sbcData.errors.push(error)

            throw err 

            return false

        }

    }

}

// Parse Special Attacks
class specialAttacksParser extends sbcParserBase {
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as a Special Attack.")

        try {  

            let specialAttacks = sbcUtils.sbcSplit(value)
            let type = "attack"

            for (let i=0; i<specialAttacks.length; i++) {
                let specialAttack = {
                    "name": "Special Attack: " + specialAttacks[i],
                    "type": type,
                    "desc": "sbc | Placeholder for Special Attacks, which in most statblocks are listed under 'Special Attacks' in the statistics block, but are described in the 'Special Abilities' block. Remove duplicates as needed!"
                }
                let placeholder = await sbcUtils.generatePlaceholderEntity(specialAttack, line)
                sbcData.characterData.items.push(placeholder)
            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as a Special Attack."
            let error = new sbcError(1, "Parse/Offense", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
    }
}


// Parse Spell Books and Spell-Like Abilities
class spellBooksParser extends sbcParserBase {
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse the following Spell Book.")
        sbcConfig.options.debug && console.log(value)

        let spellCastingType = value.spellCastingType
        let spellCastingClass = value.spellCastingClass
        let casterLevel = value.casterLevel
        let concentrationBonus = value.concentrationBonus
        let spellRows = value.spells
        let spellBookType = value.spellBookType

        // Save Data needed for validation
        // and put it into the notes sections as well
        sbcData.characterData.conversionValidation.spellBooks[spellBookType] = {
            "casterLevel": +casterLevel,
            "concentrationBonus": +concentrationBonus
        }

        sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].clNotes = "sbc | Total in statblock was CL " + casterLevel + ", adjust as needed."
        sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].concentrationNotes = "sbc | Total in statblock was +" + concentrationBonus + ", adjust as needed."

        try {  

            // Activate the spellBooks in the sheet settings
            sbcData.characterData.actorData.data.data.attributes.spells.usedSpellbooks.push(spellBookType)

            let altNameSuffix = "Prepared"

            // Set the spellBook data
            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].autoSpellLevels = false
            
            if (spellCastingType == "spontaneous") {
                sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spontaneous = true
                altNameSuffix = "Known"
            }

            if (spellBookType !== "spelllike") {
                sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].class = spellCastingClass.toLowerCase()
                sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].altName = sbcUtils.capitalize(spellCastingClass) + " Spells " + altNameSuffix
            } else {
                sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].altName = "Spell-like Abilities"
                sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].arcaneSpellFailure = false
            }

            /* Parse the spell rows
             * line by line
             */

            for (let i=0; i<spellRows.length; i++) {
                let spellRow = spellRows[i]

                let spellLevel = -1
                let spellsPerX = ""
                let spellsPerXTotal = -1

                // A) Check if its a normal spellRow starting with a spellLevel or the spells per day
                if (spellRow.match(/(^\d)/) !== null) {

                    // if it's a Spell-Like Ability get the spells per day, otherwise the spellLevel
                    // WIP: THIS IS STUPID CODE; REFACTOR THIS PLS
                    if (spellBookType == "prepared") {
                        spellLevel = spellRow.match(/(^\d)/)[1]
                    } else {
                        if (spellRow.match(/(^\d)/) !== null) {
                            spellLevel = spellRow.match(/(^\d)/)[1]
                        } 
                        if (spellRow.match(/(\d+)(?:\/(?:day|week|month|year))/) !== null) {
                            spellsPerXTotal = spellRow.match(/(\d+)(?:\/(?:day|week|month|year))/)[1]
                        }
                        if (spellRow.match(/\/([a-zA-Z]*)\)*\-/) !== null) {
                            spellsPerX = spellRow.match(/\/([a-zA-Z]*)\)*\-/)[1]
                        }
                        
                    }

                    let spells = sbcUtils.sbcSplit(spellRow.replace(/(^[^\-]*\-)/, ""))
                    

                    // Loop through the spells
                    for (let j=0; j<spells.length; j++) {

                        let spell = spells[j].trim()
                        let spellName = sbcUtils.parseSubtext(spell)[0]
                            .trim()
                            .replace(/[D]$/, "")    // Remove Domain Notation at the end of spellNames
                        let spellDC = -1

                        if (spell.search(/\bDC\b/) !== -1) {
                            spellDC = spell.match(/(?:DC\s*)(\d+)/)[1]
                        }

                        let searchEntity = {
                            "name": spellName,
                            "type": "spell"
                        }

                        let compendium = "pf1.spells"
        
                        // If the input is found in one of the compendiums, generate an entity from that
                        let entity = await sbcUtils.findEntityInCompendium(compendium, searchEntity)

                        // otherwise overwrite "entity" with a placeholder
                        if (entity === null) {
                            entity = await sbcUtils.generatePlaceholderEntity(searchEntity, line)
                        }

                        // Edit the entity to match the data given in the statblock
                        entity.data.data.spellbook = spellBookType

                        // Set the spellLevel
                        if (spellLevel !== -1) {
                            entity.data.data.level = +spellLevel
                        }

                        // Set the spellDC
                        if (spellDC !== -1) {
                            entity.data.data.save.dc = spellDC.toString()
                        }

                        /* Set the spells uses / preparation
                         * where SLAs can be cast a number of times per X per sla
                         * and spontaneous spells of a given spellLevel can be cast a total of X times per day
                         */
                        if (spellsPerXTotal !== -1 && spellBookType === "spelllike") {
                            entity.data.data.uses.max = +spellsPerXTotal
                            entity.data.data.uses.value = +spellsPerXTotal
                            entity.data.data.uses.per = spellsPerX
                        } 

                        // Spells Known can be cast a number of times per day in total for the given spellRow
                        if (spellsPerXTotal !== -1 && spellCastingType === "spontaneous") {
                            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spells["spell"+spellLevel].base = +spellsPerXTotal
                            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spells["spell"+spellLevel].max = +spellsPerXTotal
                            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spells["spell"+spellLevel].value = +spellsPerXTotal
                        }

                        // Spells Prepared can be cast a according to how often they are prepared
                        if (spellCastingType === "prepared") {

                            // WIP: BUILD A CHECK FOR MULTIPLE PREPARATIONS OF THE SAME SPELL

                            entity.data.data.preparation.maxAmount = 1
                            entity.data.data.preparation.preparedAmount = 1

                            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spells["spell"+spellLevel].base += 1
                            sbcData.characterData.actorData.data.data.attributes.spells.spellbooks[spellBookType].spells["spell"+spellLevel].max += 1

                        }

                        sbcData.characterData.items.push(entity)

                    }

                } else {
                    // B) If it's not a normal spellRow, try to extract domains, schools, mysteries, etc.


                    // WIP

                    
                }


            }
            
            return true

        } catch (err) {

            let errorMessage = "Failed to parse the following Spell Book."
            sbcConfig.options.debug && console.log(value)
            let error = new sbcError(1, "Parse/Offense", errorMessage, line)
            sbcData.errors.push(error)
            throw err
            return false

        }
    }
}

/* ------------------------------------ */
/* Parser for statistics data           */
/* ------------------------------------ */
export async function parseStatistics(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING STATISTICS DATA")
    
    let parsedSubCategories = []
    sbcData.notes["statistics"] = {}

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {

            let lineContent = data[line]

            // Parse Abilities
            if (!parsedSubCategories["abilities"]) {
                if (lineContent.search(/(?:(Str|Dex|Con|Int|Wis|Cha)\s*(\d+|-))/i) !== -1) {
                    let abilities = lineContent.match(/((Str|Dex|Con|Int|Wis|Cha)\s*(\d+|-))/gi)
                    
                    for (let i=0; i<abilities.length; i++) {
                        let ability = abilities[i].match(/(\w+)/)[1]
                        let valueInStatblock = abilities[i].match(/(\d+|-)/)[1]

                        // FLAGS NEED TO BE WORKED ON AFTER PARSING IS FINISHED
                        if (valueInStatblock === "-" || valueInStatblock === 0 || valueInStatblock === "0") {
                            valueInStatblock = 0
                            let flagKey = "no" + sbcUtils.capitalize(ability)
                            sbcConfig.options.flags[flagKey] = true
                        }

                        // CHECK CURRENT ITEMS FOR CHANGES IN ABILITIES (MAINLY RACES)
                        // Check the current Items for changes to ablities
                        let currentItems = sbcData.characterData.items
                        let currentItemsKeys = Object.keys(currentItems)

                        let abilityChangesInItems = 0

                        for (let i=0; i<currentItemsKeys.length; i++) {
                            
                            let currentItem = currentItems[currentItemsKeys[i]]

                            // Check if the item has Changes
                            if (currentItem.data.data.changes) {
                                let currentItemChanges = currentItem.data.data.changes

                                let currentItemWithAbilityChanges = currentItemChanges.find( function (element) {
                                    if(element.subTarget === ability.toLowerCase()) {
                                        return element
                                    }
                                })

                                if (currentItemWithAbilityChanges !== undefined) {
                                    abilityChangesInItems += +currentItemWithAbilityChanges.formula
                                }
                            }
                            
                        }

                        let correctedValue = +valueInStatblock - +abilityChangesInItems

                        sbcData.characterData.conversionValidation.attributes[ability] = +valueInStatblock
                        sbcData.notes.statistics[ability.toLowerCase()] = +valueInStatblock

                        let parser = sbcMapping.map.statistics[ability.toLowerCase()]
                        await parser.parse(+correctedValue, line)
                    }

                    parsedSubCategories["abilities"] = true

                }
            }

            // Parse Base Attack
            if (!parsedSubCategories["bab"]) {
                if (lineContent.search(/^Base Atk\b/i) !== -1) {
                    let parserBab = sbcMapping.map.statistics.bab
                    let bab = lineContent.match(/(?:Base Atk\b\s*)([\+\-]?\d+)/ig)[0].replace(/Base Atk\b\s*/i,"")
                    //sbcData.characterData.conversionValidation.attributes["bab"] = +bab
                    parsedSubCategories["bab"] = await parserBab.parse(+bab, startLine + line)
                }
            }

            // Parse CMB
            if (!parsedSubCategories["cmb"]) {
                if (lineContent.search(/\bCMB\b/i) !== -1) {
                    let parserCmb = sbcMapping.map.statistics.cmb
                    let cmbRaw = lineContent.match(/(?:CMB\b)(.*)(?=\bCMD)/i)[1].trim()
                    let cmb = cmbRaw.match(/([\+\-]?\d+)/)[0]
                    let cmbContext = sbcUtils.parseSubtext(cmbRaw)[1]

                    sbcData.characterData.conversionValidation.attributes["cmb"] = +cmb
                    if (cmbContext) sbcData.characterData.conversionValidation.context["cmb"] = cmbContext

                    parsedSubCategories["cmb"] = await parserCmb.parse(+cmb, startLine + line)
                }
            }

            // Parse CMD
            if (!parsedSubCategories["cmd"]) {
                if (lineContent.search(/\bCMD\b/i) !== -1) {
                    let parserCmd = sbcMapping.map.statistics.cmd
                    let cmdRaw = lineContent.match(/(?:CMD\b)(.*)/i)[1].trim()
                    let cmd = cmdRaw.match(/(\d+)/)[0]
                    let cmdContext = sbcUtils.parseSubtext(cmdRaw)[1]

                    sbcData.characterData.actorData.data.data.attributes.cmdNotes = cmdContext

                    sbcData.characterData.conversionValidation.attributes["cmd"] = +cmd
                    //if (cmdContext) sbcData.characterData.conversionValidation.context["cmd"] = cmdContext
                    parsedSubCategories["cmd"] = await parserCmd.parse(+cmd, startLine + line)
                }
            }

            // Parse Feats
            if (!parsedSubCategories["feats"]) {
                if (lineContent.search(/^Feats\b/i) !== -1) {
                    let parserFeats = sbcMapping.map.statistics.feats
                    let feats = lineContent.match(/(?:Feats\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.feats = feats
                    parsedSubCategories["feats"] = await parserFeats.parse(feats, startLine + line, "feats")
                }
            }

            // Parse Skills
            if (!parsedSubCategories["skills"]) {
                if (lineContent.search(/^Skills\b/i) !== -1) {
                    let parserSkills = sbcMapping.map.statistics.skills
                    let skills = lineContent.match(/(?:Skills\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.skills = skills
                    parsedSubCategories["skills"] = await parserSkills.parse(skills, startLine + line)
                }
            }

            // Parse Languages
            if (!parsedSubCategories["languages"]) {
                if (lineContent.search(/^Languages\b/i) !== -1) {
                    let parserLanguages = sbcMapping.map.statistics.languages
                    let languages = lineContent.match(/(?:Languages\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.languages = languages
                    parsedSubCategories["languages"] = await parserLanguages.parse(languages, startLine + line)
                }
            }

            // Parse SQ
            if (!parsedSubCategories["sq"]) {
                if (lineContent.search(/^SQ\b/i) !== -1) {
                    let parserSQ = sbcMapping.map.statistics.sq
                    let sqs = lineContent.match(/(?:SQ\b\s*)(.*)/i)[1].replace(/\s*[,;]+\s*/g,",").trim()
                    parsedSubCategories["sq"] = await parserSQ.parse(sqs, startLine + line)
                }
            }

            // Parse Gear
            if (!parsedSubCategories["gear"]) {
                if (lineContent.search(/(Combat Gear|Other Gear|Gear)\b/i) !== -1) {
                    let parserGear = sbcMapping.map.statistics.gear
                    // Combat Gear, Other Gear, Gear
                    let gear = lineContent.replace(/(Combat Gear|Other Gear|Gear)/g, "").replace(/[,;]+/g,",").trim()
                    sbcData.notes.statistics.gear = gear
                    parsedSubCategories["gear"] = await parserGear.parse(gear, startLine + line)
                }
            }

        } catch (err) {
            
            let errorMessage = "Parsing the statistics data failed at the highlighted line"
            let error = new sbcError(1, "Parse/Statistics", errorMessage, (startLine+line) )
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false
            return false

        }
    }

    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING STATISTICS DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
    
}

// Parse Ability Values and Mods
class abilityParser extends sbcParserBase {
    constructor(targetValueFields, targetModFields, supportedTypes) {
        super()
        this.targetValueFields = targetValueFields
        this.targetModFields = targetModFields
        this.supportedTypes = supportedTypes
    }

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " into " + this.targetValueFields)
        // Check if the given value is one of the supported ones
        if (typeof (value) === this.supportedTypes) {
            try {
                for (const valueField of this.targetValueFields) {
                    await sbcParsing.parseValueToPath(sbcData.characterData.actorData.data, valueField, value)
                }
                for (const modField of this.targetModFields) {
                    await sbcParsing.parseValueToPath(sbcData.characterData.actorData.data, modField, sbcUtils.getModifier(value))
                }
                return true
            } catch (err) {
                let errorMessage = `Failed to parse ${value} into ${targetValueFields} (and ${sbcUtils.getModifier(value)} into ${targetModFields})`
                let error = new sbcError(0, "Parse", errorMessage, line)
                sbcData.errors.push(error)
                return false
            }
        } else {
            let errorMessage = `The input ${value} is not of the supported type ${this.supportedTypes}`
            let error = new sbcError(1, "Parse", errorMessage, line)
            sbcData.errors.push(error)
            return false
        }
    }
}

// Parse Skills
class skillsParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as skills")

        try {

            let skills = sbcUtils.sbcSplit(value)
            let classSkills = []

            // Check the current Items for classes and save, if a skill is a classSkill
            let currentItems = sbcData.characterData.items

            for (let i=0; i<currentItems.length; i++) {
                if (currentItems[i].type === "class") {
                    let classItem = currentItems[i]
                    let skillKeys = Object.keys(classItem.data.data.classSkills)

                    // Loop through the skills
                    for (let j=0; j<skillKeys.length; j++) {
                        let currentSkill = skillKeys[j]
                        if (classItem.data.data.classSkills[currentSkill] === true) {
                            if (!classSkills.includes(currentSkill)) {
                                classSkills.push(currentSkill)
                            }
                        }
                    }
                }
            }
            
            // Setup Counters
            let countOfCustomSkills = 0
            let countOfSubSkills = {
                "art": 1,
                "crf": 1,
                "lor": 1,
                "prf": 1,
                "pro": 1,
            }

            for (let i=0; i<skills.length; i++) {

                let rawSkill = skills[i]

                // Check, if the rawSkill contains "racial modifiers"
                // And skip to the end of the array as we do not need these
                if (rawSkill.search(/racial (?:modifier|bonus)/i) !== -1) {
                    return
                }

                let skill = null

                let knowledgeSubSkills = [
                    "Arcana",
                    "Dungeoneering",
                    "Engineering",
                    "Geography",
                    "History",
                    "Local",
                    "Nature",
                    "Nobility",
                    "Planes",
                    "Religion",
                ]

                // Check if there are multiple subskills for knowledge
                if (rawSkill.search(/knowledge/i) !== -1 && rawSkill.search(/,/g) !== -1) {
                    // If there are, generate new skills and push them to the array of skills

                    let tempSkill = sbcUtils.parseSubtext(rawSkill)
                    
                    let skillName = tempSkill[0]
                    let skillModifier = tempSkill[2][0]
                    let skillContext = null
                    if (tempSkill[2][1]) {
                        skillContext = tempSkill[2][1]
                    }

                    let subSkills = tempSkill[1].split(/,/g)

                    for (let j=0; j<subSkills.length; j++) {
                        let subSkill = subSkills[j].trim()
                        let newSkill = skillName + " (" + subSkill + ") " + skillModifier
                        skills.push(newSkill)
                    }

                    continue

                } else if (rawSkill.search(/knowledge/i) !== -1 && rawSkill.search(/any/g) !== -1) {
                    // If its a knowledge skill with "any" as subskill
                    // Find out how many, as most of the time its denoted as "any two"/"any three"

                    let tempSkill = sbcUtils.parseSubtext(rawSkill)
                    
                    let skillName = tempSkill[0]
                    let skillModifier = tempSkill[2][0]
                    let skillContext = null
                    if (tempSkill[2][1]) {
                        skillContext = tempSkill[2][1]
                    }

                    let stringOfKnowledgeSubskills = tempSkill[1].match(/(?:\bany\b )(.*)/i)[1]
                    let numberOfKnowledgeSubskills = 0
                    
                    switch (stringOfKnowledgeSubskills) {
                        case "one":
                            numberOfKnowledgeSubskills = 1
                            break
                        case "two":
                            numberOfKnowledgeSubskills = 2
                            break
                        case "three":
                            numberOfKnowledgeSubskills = 3
                            break
                        case "four":
                            numberOfKnowledgeSubskills = 4
                            break
                        case "five":
                            numberOfKnowledgeSubskills = 5
                            break
                        case "six":
                            numberOfKnowledgeSubskills = 6
                            break
                        case "seven":
                            numberOfKnowledgeSubskills = 7
                            break
                        case "eight":
                            numberOfKnowledgeSubskills = 8
                            break
                        case "nine":
                            numberOfKnowledgeSubskills = 9
                            break
                        default:
                            break
                    }                        
                    
                    // Pick Subskills at random
                    let alreadyPickedSubskills = ""
                    
                    for (let i=0; i < numberOfKnowledgeSubskills; i++) {

                        let randomSubSkill = Math.floor(Math.random() * 10)                        
                        let searchString = new RegExp(knowledgeSubSkills[randomSubSkill], "i")
                    
                        if (alreadyPickedSubskills.search(searchString) === -1 && !skills.includes(searchString)) {
                            let subSkill = knowledgeSubSkills[randomSubSkill]
                            let newSkill = skillName + " (" + subSkill + ") " + skillModifier
                            skills.push(newSkill)
                            alreadyPickedSubskills += newSkill
                        } else {
                            i--
                        }
                        
                    }

                    continue

                } else if (rawSkill.search(/knowledge/i) !== -1 && rawSkill.search(/all/g) !== -1) {
                    // If its a knowledge skill with "all" as subskill

                    let tempSkill = sbcUtils.parseSubtext(rawSkill)
                    let skillName = tempSkill[0]
                    let skillModifier = tempSkill[2][0]
                    if (tempSkill[2][1]) {
                        skillContext = tempSkill[2][1]
                    }

                    for (let j=0; j<subSkills.length; j++) {
                        let knowledgeSubSkill = knowledgeSubSkills[j].trim()
                        let newSkill = skillName + " (" + knowledgeSubSkill + ") " + skillModifier
                        skills.push(newSkill)
                    }

                    continue

                } else {

                    skill = sbcUtils.parseSubtext(rawSkill)

                }

                try {

                    let skillName = skill[0].replace(/[\+\-]\d*/g, "").trim()
                    let skillTotal = skill[0].replace(skillName, "").trim()
                    let subSkill = ""
                    let skillContext = ""

                    // Check, if there is a subskill
                    if (skill[1]) {
                        subSkill = skill[1]
                    }

                    // Check, if there are restValues after separating subtext
                    if (skill[2]) {
                        
                        // If the rest includes two values, the first one is the skillTotal and the second the context note
                        if (skillTotal === "" && skill[2][1]) {
                            skillTotal = skill[2][0]
                            skillContext = skill[2][1]
                        } else {
                            // Else, the rest includes just the value, e.g. "Craft (Penmanship)"
                            skillTotal = skill[2][0]
                        }
                        
                    }

                    // Check if its one of the supported skills, otherwise try to parse it as a custom skill
                    let patternSkills = new RegExp("(?:" + Object.values(CONFIG["PF1"].skills).join("\\b|\\b") + ")", "i")
                    let searchSkillWithSubSkill = skillName + " " + subSkill + ""
                    
                    let skillKey = ""

                    if (skillName.search(patternSkills) !== -1) {
                        // Supported Skills without Subskills
                        skillKey = sbcUtils.getKeyByValue(CONFIG["PF1"].skills, skillName)
                    } else if (searchSkillWithSubSkill.search(patternSkills) !== -1) {
                        // Supported Skills with Subskills
                        let skillWithSubskillAndParenthesis = skillName + " (" + subSkill + ")"
                        skillKey = sbcUtils.getKeyByValue(CONFIG["PF1"].skills, skillWithSubskillAndParenthesis)
                    } else {
                        // Custom Skills not included in the system
                        skillKey = "skill"
                    }

                    let size = sbcData.characterData.actorData.data.data.traits.size
                    let sizeMod = 0

                    // As long as its not a custom skill ...
                    if (skillKey !== "skill") {

                        // Seems the temporary actors does not calculate the mod or if its a classSkill beforehand, so we need to do that manually
                        let skillAbility = sbcData.characterData.actorData.data.data.skills[skillKey].ability
                        let skillAbilityMod = sbcData.characterData.actorData.data.data.abilities[skillAbility].mod
                        let classSkillMod = 0
                        
                        if (classSkills.includes(skillKey)) {
                            classSkillMod = 3
                        }

                        switch (skillKey) {
                            case "fly":
                                sizeMod = CONFIG["PF1"].sizeFlyMods[size]
                                break
                            case "ste":
                                sizeMod = CONFIG["PF1"].sizeStealthMods[size]
                                break
                            default:
                                break
                        }
                        
                        let skillRanks = +skillTotal - +skillAbilityMod - +classSkillMod - +sizeMod

                        if (skillKey.search(/(art|crf|lor|prf|pro)/) === -1) {
                            // IF ITS NOT A SKILL WITH SUBSKILLS
                            sbcData.characterData.actorData.data.data.skills[skillKey].rank = skillRanks

                            // Add Data to conversionValidation
                            sbcData.characterData.conversionValidation["skills"][skillKey] = {
                                "total": +skillTotal,
                                "context": skillContext
                            }

                        } else {
                            // IF ITS A SKILL WITH SUBSKILLS (e.g. Art, Craft, etc.)
                            let subSkillKey = skillKey + (+countOfSubSkills[skillKey])

                            sbcData.characterData.actorData.data.data.skills[skillKey].subSkills[subSkillKey] = {
                                "ability": sbcData.characterData.actorData.data.data.skills[skillKey].ability,
                                "acp": sbcData.characterData.actorData.data.data.skills[skillKey].acp,
                                "cs": sbcData.characterData.actorData.data.data.skills[skillKey].cs,
                                "mod": 0,
                                "name": skillName + " (" + subSkill + ")",
                                "rank": skillRanks,
                                "rt": sbcData.characterData.actorData.data.data.skills[skillKey].rt
                            }

                            // Add Data to conversionValidation
                            sbcData.characterData.conversionValidation["skills"][subSkillKey] = {

                                "name": skillName + " (" + subSkill + ")",                                
                                "total": +skillTotal,
                                "context": skillContext
                                
                            }

                            countOfSubSkills[skillKey]++
                        }

                    } else {
                        // if its a custom skill ...
                        let customSkillKey = "skill"

                        if (countOfCustomSkills > 0) {
                            customSkillKey = "skill" + (+countOfCustomSkills+1)
                        }

                        let defaultAbilityMod = sbcData.characterData.actorData.data.data.abilities["int"].mod

                        let skillRanks = +skillTotal - +defaultAbilityMod
                        sbcData.characterData.actorData.data.data.skills[customSkillKey] = {
                        
                            "ability": "int",
                            "acp": false,
                            "background": false,
                            "cs": false,
                            "custom": true,
                            "mod": skillRanks,
                            "name": skillName,
                            "rank": skillRanks,
                            "rt": false
                        }

                        // Add Data to conversionValidation
                        sbcData.characterData.conversionValidation["skills"][customSkillKey] = {
                            
                            "name": skillName,
                            "total": +skillTotal,
                            "context": skillContext
                            
                        }

                        countOfCustomSkills++
                    }

                } catch (err) {

                    let errorMessage = "Failed to parse " + skill + "."
                    let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
                    sbcData.errors.push(error)
                    return false

                }

            }

            // If all skills were parsed correctly, return true
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as skills."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }

}

// Parse Languages
class languageParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as languages")

        try {

            let systemSupportedLanguages = Object.values(CONFIG["PF1"].languages).map(x => x.toLowerCase())
            let patternLanguages = new RegExp("(" + systemSupportedLanguages.join("\\b|\\b") + ")", "gi")
            
            let languages = value.split(/[,;]/g)
            let specialLanguages = []
        
            for (let i=0; i<languages.length; i++) {

                let language = languages[i].trim()

                if (language.search(patternLanguages) !== -1) {
                    let languageKey = sbcUtils.getKeyByValue(CONFIG["PF1"].languages, language)
                    sbcData.characterData.actorData.data.data.traits.languages.value.push(languageKey)
                } else {
                    specialLanguages.push(language)
                }

                if (specialLanguages !== "") {
                    sbcData.characterData.actorData.data.data.traits.languages.custom = specialLanguages.join(";")
                }

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as languages."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }

}

// Special Qualities Parser
class sqParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as SQ")

        try {

            let specialQualities = sbcUtils.sbcSplit(value)
            let type = "misc"

            for (let i=0; i<specialQualities.length; i++) {
                let specialQuality = {
                    "name": "Special Quality: " + specialQualities[i],
                    "type": type,
                    "desc": "sbc | Placeholder for Special Qualities, which in most statblocks are listed under SQ in the statistics block, but described in the Special Abilities. Remove duplicates as needed!"
                }
                let placeholder = await sbcUtils.generatePlaceholderEntity(specialQuality, line)
                sbcData.characterData.items.push(placeholder)
            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as SQ."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

// Parse Gear
class gearParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as gear")

        try {

            let weaponCompendium = "pf1.weapons-and-ammo"
            let armorCompendium = "pf1.armors-and-shields"
            let itemCompendium = "pf1.items"

            let patternSupportedWeapons = new RegExp("(" + sbcConfig.weapons.join("\\b|\\b") + ")", "gi")
            let patternSupportedArmors = new RegExp("(" + sbcConfig.armors.join("\\b|\\b") + ")", "gi")
            let patternSupportedItems = new RegExp("(" + sbcConfig.items.join("\\b|\\b") + ")", "gi")
            let patternGold = new RegExp("^(\\d+[\\.,]*\\d*\\s+)(?:PP|GP|SP|CP)", "i")
    
            let gears = sbcUtils.sbcSplit(value)
            let placeholdersGenerated = []

            for (let i=0; i<gears.length; i++) {

                let input = gears[i].trim()
                let splitInput = sbcUtils.parseSubtext(input)
                let gearText = splitInput[0]
                let gearSubtext = splitInput[1]

                let gear = {
                    "type": "loot",
                    "name": gearText.replace(/^([\d\+]+|masterwork|mwk)/g, "").trim(),
                    "rawName": input,
                    "subtext": gearSubtext,
                    "value": 0,
                    "enhancementValue": 0,
                    "enhancementTypes": [],
                    "mwk": false
                }

                let gearKeys = Object.keys(gear)
                
                if (gearText.search(/^\+/) !== -1) {
                    gear.enhancementValue = +gearText.match(/(\d+)/)[1].trim()
                }

                if (gearText.search(/(masterwork|mwk)/) !== -1) {
                    gear.mwk = true
                }
                
                let entity = {}

                if (gearText.search(patternSupportedWeapons) !== -1) {
                    // If the input is a weapon in one of the compendiums
                    gear.type = "weapon"
                    entity = await sbcUtils.findEntityInCompendium(weaponCompendium, gear)

                } else if (gearText.search(patternSupportedArmors) !== -1) {

                    // If the input is a armor in one of the compendiums
                    gear.type = "equipment"
                    entity = await sbcUtils.findEntityInCompendium(armorCompendium, gear)
                    
                } else if (gearText.search(patternSupportedItems) !== -1) {

                    // If the input is a item in one of the compendiums
                    gear.type = "loot"
                    entity = await sbcUtils.findEntityInCompendium(itemCompendium, gear)   
                    
                } else if (gearText.search(patternGold) !== -1) {

                    // If the input is Money
                    gear.name = "Money Pouch"
                    gear.type = "container"
                    gear.currency = {
                        "pp": splitInput[0].search(/\bPP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*PP)/i)[1] : 0,
                        "gp": splitInput[0].search(/\bGP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*GP)/i)[1] : 0,
                        "sp": splitInput[0].search(/\bSP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*SP)/i)[1] : 0,
                        "cp": splitInput[0].search(/\bCP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*CP)/i)[1] : 0
                    }

                } else {
                    // WIP
                    // Edit May 2021: Why WIP?
                }

                if (entity !== undefined && Object.keys(entity).length !== 0 && entity !== null) {

                    entity.data.name = sbcUtils.capitalize(gear.rawName)
                    entity.data.data.identifiedName = sbcUtils.capitalize(gear.rawName)

                    for (let i=0; i<gearKeys.length; i++) {
                        let key = gearKeys[i]
                        let change = gear[key]

                        if (change) {
                            switch (key) {
                                case "enhancementValue":
                                    if (gear.type === "weapon") {
                                        entity.data.data.enh = +change
                                        entity.data.data.masterwork = true
                                    } else if (gear.type === "equipment") {
                                        entity.data.data.armor.enh = +change
                                        entity.data.data.masterwork = true
                                    } else {
                                        break
                                    }
                                    break
                                case "mwk":
                                    entity.data.data.masterwork = change
                                    break
                                case "value":
                                    entity.data.data.price = +change
                                    break
                                default:
                                    break
                            }
                        }
                    }

                    sbcData.characterData.items.push(entity)
                } else {
                    gear.name = input
                    let placeholder = await sbcUtils.generatePlaceholderEntity(gear, line)
                    sbcData.characterData.items.push(placeholder)
                    placeholdersGenerated.push(sbcUtils.capitalize(gear.name))
                }
                
            }

            if (placeholdersGenerated.length > 0) {
                let infoMessage = "Generated Placeholders for the following Entities: " + placeholdersGenerated.join(", ")
                let info = new sbcError(3, "Entity/Placeholder", infoMessage, line)
                sbcData.errors.push(info)
            }

            // classItems were created successfully
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as gear."
            let error = new sbcError(2, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }
        
    }

}

/* ------------------------------------ */
/* Parser for tactics data              */
/* ------------------------------------ */
export async function parseTactics(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING TACTICS DATA")

    let parsedSubCategories = []
    sbcData.notes["tactics"] = {
        "hasTactics": true
    }

    let parserTactics = sbcMapping.map.tactics

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            // Parse Before Combat
            if (!parsedSubCategories["beforeCombat"]) {
                if (lineContent.search(/(Before Combat)/i) !== -1) {
                    let beforeCombat = {
                        "name": "Before Combat",
                        "entry": lineContent.match(/^(?:Before Combat)([\s\S]*?)(?=$|During Combat|Morale|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.beforeCombat = beforeCombat.entry
                    parsedSubCategories["beforeCombat"] = await parserTactics.parse(beforeCombat, startLine + line)
                }
            }

            // Parse During Combat
            if (!parsedSubCategories["duringCombat"]) {
                if (lineContent.search(/(During Combat)/i) !== -1) {
                    let duringCombat = {
                        "name": "During Combat",
                        "entry": lineContent.match(/^(?:During Combat)([\s\S]*?)(?=$|Morale|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.duringCombat = duringCombat.entry
                    parsedSubCategories["duringCombat"] = await parserTactics.parse(duringCombat, startLine + line)
                }
            }

            // Parse Morale
            if (!parsedSubCategories["morale"]) {
                if (lineContent.search(/(Morale)/i) !== -1) {
                    let morale = {
                        "name": "Morale",
                        "entry": lineContent.match(/^(?:Morale)([\s\S]*?)(?=$|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.morale = morale.entry
                    parsedSubCategories["morale"] = await parserTactics.parse(morale, startLine + line)
                }
            }

            // Parse Base Statistics
            if (!parsedSubCategories["baseStatistics"]) {
                if (lineContent.search(/(Base Statistics)/i) !== -1) {
                    let baseStatistics = {
                        "name": "Base Statistics",
                        "entry": lineContent.match(/^(?:Base Statistics)([\s\S]*?)$/i)[1]                       
                    }
                    sbcData.notes.tactics.baseStatistics = baseStatistics.entry
                    parsedSubCategories["baseStatistics"] = await parserTactics.parse(baseStatistics, startLine + line)
                }
            }


        } catch (err) {
            let errorMessage = `Parsing the tactics data failed at line ${line+startLine} (non-critical)`
            let error = new sbcError(2, "Parse/Tactics", errorMessage, line+startLine)
            sbcData.errors.push(error)
            // This is non-critical, so parse the rest
            return false
        }

    }
    
    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING TACTICS DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse Tactics
class tacticsParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as tactics")

        try {

            let tacticsEntry = {
                "name": "Tactics: " + value.name,
                "type": "misc",
                "desc": value.entry
            }

            let placeholder = await sbcUtils.generatePlaceholderEntity(tacticsEntry, line)
           
            sbcData.characterData.items.push(placeholder)
            return true

        } catch (err) {
            let errorMessage = "Failed to parse " + value + " as tactics."
            let error = new sbcError(2, "Parse/Ecology", errorMessage, line)
            sbcData.errors.push(error)
            return false
        }
    }

}

/* ------------------------------------ */
/* Parser for ecology data              */
/* ------------------------------------ */
export async function parseEcology(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING ECOLOGY DATA")
    
    let parsedSubCategories = []
    sbcData.notes["ecology"] = {
        "hasEcology": true
    }

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            let parserEcology = sbcMapping.map.ecology

            // Parse Environment
            if (!parsedSubCategories["environment"]) {
                if (lineContent.search(/(Environment)/i) !== -1) {
                    let environment = {
                        "name": "Environment",
                        "entry": lineContent.match(/^(?:Environment)([\s\S]*?)(?=$|Organization|Treasure)/i)[1]                       
                    }
                    sbcData.notes.ecology.environment = environment.entry
                    parsedSubCategories["environment"] = await parserEcology.parse(environment, startLine + line)
                }
            }

            // Parse Organization
            if (!parsedSubCategories["organization"]) {
                if (lineContent.search(/(Organization)/i) !== -1) {
                    let organization = {
                        "name": "Organization",
                        "entry": lineContent.match(/(?:Organization)([\s\S]*?)(?=$|Treasure)/i)[1]                    
                    }
                    sbcData.notes.ecology.organization = organization.entry
                    parsedSubCategories["organization"] = await parserEcology.parse(organization, startLine + line)
                }
            }

            // Parse Treasure
            if (!parsedSubCategories["treasure"]) {
                if (lineContent.search(/(Treasure)/i) !== -1) {
                    let treasure = {
                        "name": "Treasure",
                        "entry": lineContent.match(/(?:Treasure)([\s\S]*?)$/i)[1]                     
                    }
                    sbcData.notes.ecology.treasure = treasure.entry
                    parsedSubCategories["treasure"] = await parserEcology.parse(treasure, startLine + line)
                }
            }

        } catch (err) {
            let errorMessage = `Parsing the ecology data failed at line ${line+startLine} (non-critical)`
            let error = new sbcError(2, "Parse/Ecology", errorMessage, line+startLine)
            sbcData.errors.push(error)
            // This is non-critical, so parse the rest
            return false
        }

    }
    
    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING ECOLOGY DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse Ecology
class ecologyParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as ecology")

        try {

            let ecologyEntry = {
                "name": value.name + ": " + value.entry,
                "type": "misc",
                "desc": "sbc | Here you’ll find information on how the monster fits into the world, notes on its ecology and society, and other bits of useful lore and flavor that will help you breathe life into the creature when your PCs encounter it."
            }

            let placeholder = await sbcUtils.generatePlaceholderEntity(ecologyEntry, line)
           
            sbcData.characterData.items.push(placeholder)
            return true

        } catch (err) {
            let errorMessage = "Failed to parse " + value + " as ecology."
            let error = new sbcError(2, "Parse/Ecology", errorMessage, line)
            sbcData.errors.push(error)
            return false
        }
    }

}

/* ------------------------------------ */
/* Parser for special ability data      */
/* ------------------------------------ */
export async function parseSpecialAbilities(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING SPECIAL ABILITY DATA")

    let parsedSubCategories = []
    let parsedSubCategoriesCounter = 0
    sbcData.notes["specialAbilities"] = {
        "hasSpecialAbilities": true
    }

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            // Parse Special Ability
            if (!parsedSubCategories["specialAbility-" + parsedSubCategoriesCounter]) {
                if (lineContent && lineContent.search(/Special Abilities/i) === -1) {
                    let specialAbility = lineContent
                    
                    let parserSpecialAbility = sbcMapping.map["special abilities"]
                    parsedSubCategories["specialAbility-" + parsedSubCategoriesCounter] = await parserSpecialAbility.parse(specialAbility, startLine + line)
                    if (parsedSubCategories["specialAbility-" + parsedSubCategoriesCounter]) parsedSubCategoriesCounter++
                }
            }

        } catch (err) {
            let errorMessage = `Parsing the special abilities failed at line ${line+startLine} (non-critical)`
            let error = new sbcError(2, "Parse/Special Abilities", errorMessage, line+startLine)
            sbcData.errors.push(error)
            // This is non-critical, so parse the rest
            return false
        }

    }

    sbcData.notes["specialAbilities"].parsedSpecialAbilities = []

    let parsedSubCategoriesKeys = Object.keys(parsedSubCategories)

    for (let i=0; i<parsedSubCategoriesKeys.length; i++) {
        let subCategoryKey = parsedSubCategoriesKeys[i]
        let specialAbilityNote = parsedSubCategories[subCategoryKey][1].trim()
        sbcData.notes["specialAbilities"].parsedSpecialAbilities.push(specialAbilityNote)
    }
    
    sbcData.notes["specialAbilities"].parsedSpecialAbilities = sbcData.notes["specialAbilities"].parsedSpecialAbilities.join(`

`)

    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING SPECIAL ABILITY DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
}

// Parse Special Abilities
class specialAbilityParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Special Abilities")

        try {

            // Try to find the name of the special ability
            // (1) Hopefully, the statblock includes the abilityType, e.g. Su, Ex, or Sp
            //     Because we can separate the name from that
            // (2) If no abilityType is found, things start to get fuzzy,
            //     Sometimes the name will be anything up to the first word which first letter is lowercase
            //     Other times the name will include an "of" or "the" with a lower letter, which will break the name finding
            //     So, try to find the first word starting with a lowercase letter, check if its one of the keywords [of, the, etc.]
            //     And put that into the name

            let specialAbilityType = null
            let specialAbilityName = null
            let specialAbilityDesc = null

            let patternSpecialAbilityTypes = new RegExp("(\\((\\bSU\\b|\\bSP\\b|\\bEX\\b)\\))", "i")

            if (value.search(patternSpecialAbilityTypes) !== -1) {

                // (1) Hopefully, the statblock includes the abilityType, e.g. Su, Ex, or Sp
                //     Because we can separate the name from that

                specialAbilityType = value.match(patternSpecialAbilityTypes)[1].toLowerCase().replace(/[()]*/g, "").trim()
                specialAbilityName = value.split(patternSpecialAbilityTypes)[0].trim()
                specialAbilityDesc = value.split(patternSpecialAbilityTypes)[3].trim()

            } else {

                // (2) If no abilityType is found, things start to get fuzzy,
                //     Sometimes the name will be anything up to the first word which first letter is lowercase
                //     Other times the name will include an "of" or "the" with a lower letter, which will break the name finding
                //     So, try to find the first word starting with a lowercase letter, check if its one of the keywords [of, the, is, etc.]
                //     And put that into the name

                //let patternFindStartOfDescription = new RegExp("(^\\w*)(?:\\s)(?!is|the|of)(\\b[a-z]+\\b)", "")
                //let patternFindStartOfDescription = new RegExp("(?:^[a-zA-Z]+?\\s+)([a-z]?)", "")
                let patternFindStartOfDescription = new RegExp("((?:[A-Z][a-z]*)*\\s*(?:of|the|is)*\\s*(?:[A-Z][a-z]*)[a-z])", "")
                let indexOfStartOfDescription = 0

                if (value.match(patternFindStartOfDescription) !== null) {
                    indexOfStartOfDescription = value.match(patternFindStartOfDescription)[0].length
                }

                specialAbilityName = value.slice(0,indexOfStartOfDescription).trim()
                specialAbilityDesc = value.slice(indexOfStartOfDescription).trim()

                let errorMessage = `There may be some issues here. Please check the preview!`
                let error = new sbcError(3, "Parse/Special Abilties", errorMessage, line)
                sbcData.errors.push(error)

            }

            // Create a placeholder for the special ability using the data found
            let specialAbility = {
                "name": specialAbilityName,
                "specialAbilityType": specialAbilityType,
                "type": "classFeat",
                "desc": specialAbilityDesc
            }

            let specialAbilityNote = ""
            
            if (specialAbilityType !== null) {
                specialAbilityNote = specialAbilityName + " (" + specialAbilityType + "): " + specialAbilityDesc
            } else {
                specialAbilityNote = specialAbilityName + ": " + specialAbilityDesc
            }

            let placeholder = await sbcUtils.generatePlaceholderEntity(specialAbility, line)
            sbcData.characterData.items.push(placeholder)

            return [true, specialAbilityNote]

        } catch (err) {

            let errorMessage = "Failed to parse [" + value + "] as Special Ability."
            let error = new sbcError(1, "Parse/Special Abilties", errorMessage, line)
            sbcData.errors.push(error)
            return false

        }

    }

}

/* ------------------------------------ */
/* Parser for description data          */
/* ------------------------------------ */
export async function parseDescription(data, startLine) {
    sbcConfig.options.debug && console.groupCollapsed("sbc-pf1 | " + sbcData.parsedCategories + "/" + sbcData.foundCategories + " >> PARSING DESCRIPTION DATA")

    let parsedSubCategories = []
    sbcData.notes["description"] = {}
    
    let description = ""

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]
            switch (lineContent.toLowerCase()) {
                case "description":
                    break
                case "":
                    description = description.concat("\n")
                    break
                default:
                    description = description.concat(lineContent + "\n")
                    break
            }

        } catch (err) {
            let errorMessage = `Parsing the description data failed at line ${line+startLine}`
            let error = new sbcError(2, "Parse/Description", errorMessage, line+startLine)
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false
            return false
        }

    }

    sbcData.notes.description.long = description

    let parserDescription = sbcMapping.map.description
    parsedSubCategories["description"] = await parserDescription.parse(description, startLine)

    sbcConfig.options.debug && sbcUtils.log("RESULT OF PARSING DESCRIPTION DATA (TRUE = PARSED SUCCESSFULLY)")
    sbcConfig.options.debug && console.log(parsedSubCategories)
    sbcConfig.options.debug && console.groupEnd()

    return true
    
}

/* ------------------------------------ */
/* Check for flags and parse            */
/* ------------------------------------ */

// Check if some special flags were set during parsing
export async function checkFlags() {

    sbcConfig.options.debug && sbcUtils.log("Flags set during the conversion process")
    sbcConfig.options.debug && console.log(sbcConfig.options.flags)

    let parsedFlags = []    

    for (const flag in sbcConfig.options.flags) {

        // Fix for set abilities persisting even when flags are reset
        if (sbcConfig.options.flags[flag]) {
    
            let fields = []
            let value = ""
            let supportedTypes = "string"
            let flagNeedsAdditionalParsing = false

            switch(flag) {
                case "isUndead":
                    // When its an undead, use Cha for HP and Save Calculation
                    fields = ["data.attributes.hpAbility", "data.attributes.savingThrows.fort.ability"]
                    if (sbcConfig.options.flags[flag] === true) {
                        value = "cha"
                    } else {
                        value = "con"
                    }
                    flagNeedsAdditionalParsing = true
                    break
                default:
                    break
            }

            if (flagNeedsAdditionalParsing) {
                let parser = new singleValueParser(fields, supportedTypes)
                parsedFlags[flag] = await parser.parse(value)
            }

            
        }

    }

}

// Create the whole batch of items in one go
export async function createEmbeddedEntities() {

    try {
        
        sbcData.characterData.actorData.data.items = []
        sbcData.characterData.actorData.data.items = await sbcData.characterData.items.map(i => i.data)

    } catch (err) {

        let errorMessage = `Failed to create embedded entities (items, feats, etc.)`
        let error = new sbcError(1, "Parse", errorMessage)
        sbcData.errors.push(error)
        sbcData.parsedInput.success = false
        throw err

    }

}

export async function generateNotesSection() {

    let preview = await renderTemplate('modules/pf1-statblock-converter/templates/sbcPreview.hbs' , {data: sbcData.characterData.actorData.data, notes: sbcData.notes })

    let d = new Date()
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let sbcInfo = `
        <div class="sbcInfo" style="margin-top: 15px; margin-bottom: 5px; text-align: center; font-size: 1em; font-weight: 900;">sbc | Generated with version ${sbcConfig.modData.version} on ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}</div>
    `

    let styledNotes = `
        <hr>
        <div class="statblockContainer" style="margin-top: 15px">${preview}</div>
    `
    let rawNotes = `
        <br>
        <hr>
        <div class="rawInputContainer" style="margin-top: 15px;">
            <h2 style="text-align:middle; border: none; text-transform: uppercase; color: #000;">RAW INPUT</h2>
            <hr>
            <pre style="white-space: pre-wrap; font-size: 10px;">${sbcData.input}</pre>
        </div>
    `
    
    // WRITE EVERYTHING TO THE NOTES
    sbcData.characterData.actorData.data.data.details.notes.value = sbcInfo + styledNotes + rawNotes
}

/* ------------------------------------ */
/* Initialize Parser Mapping            */
/* ------------------------------------ */

export function initMapping() {

    if (sbcMapping.map) {
        return;
    }

    sbcMapping.map = {
        "base": {
            "name": new singleValueParser(["name", "token.name"], "string"),
            "cr": new singleValueParser(["data.details.cr.base", "data.details.cr.total"], "number"),
            "mr": new notesParser(["base.mr"]),                                                 // currently not supported by the game system
            "level": new notesParser(["data.details.level.value"]),                             // gets calculated by foundry
            "xp": new notesParser(["data.details.xp.value"]),                                   // gets calculated by foundry
            "gender": new singleValueParser(["data.details.gender"], "string"),
            "race": new raceParser(),
            "classes": new classesParser(),
            "source": new notesParser(["base.source"]),                                         // used in the notes section
            "alignment": new singleValueParser(["data.details.alignment"], "string"),
            "size": new singleValueParser(["data.traits.size"], "string"),
            "creatureType": new creatureTypeParser(),
            "init": new singleValueParser(["data.attributes.init.total"], "number"),
            "senses": new sensesParser(),
            "aura": new auraParser()
        },
        "defense": {
            "acNormal": new singleValueParser(["data.attributes.ac.normal.total"], "number"),
            "acFlatFooted": new singleValueParser(["data.attributes.ac.flatFooted.total"], "number"),
            "acTouch": new singleValueParser(["data.attributes.ac.touch.total"], "number"),
            //"acContext": new singleValueParser(["data.attributes.acNotes"], "string"),
            "acTypes": new acTypesParser(),
            
            "hp": new hpParser(),
            "saves": new savesParser(),
            "immune": new immuneParser(),
            "resist": new resistParser(),
            "weakness": new weaknessParser(),
            "defensiveAbilities": new entityParser(),
            "dr": new singleValueParser(["data.traits.dr"], "string"),
            "sr": new srParser(),  
        },
        "offense": {
            "speed": new speedParser(),
            "attacks": new attacksParser(),
            "specialAttacks": new specialAttacksParser(),
            "spellBooks": new spellBooksParser()
            
        },
        "tactics": new tacticsParser(),
        "statistics": {
            
            "str": new abilityParser(["data.abilities.str.total", "data.abilities.str.value"], ["data.abilities.str.mod"], "number"),
            "dex": new abilityParser(["data.abilities.dex.total", "data.abilities.dex.value"], ["data.abilities.dex.mod"], "number"),
            "con": new abilityParser(["data.abilities.con.total", "data.abilities.con.value"], ["data.abilities.con.mod"], "number"),
            "int": new abilityParser(["data.abilities.int.total", "data.abilities.int.value"], ["data.abilities.int.mod"], "number"),
            "wis": new abilityParser(["data.abilities.wis.total", "data.abilities.wis.value"], ["data.abilities.wis.mod"], "number"),
            "cha": new abilityParser(["data.abilities.cha.total", "data.abilities.cha.value"], ["data.abilities.cha.mod"], "number"),
            "bab": new singleValueParser(["data.attributes.bab.total"], "number"),
            "cmb": new singleValueParser(["data.attributes.cmb.total"], "number"),
            "cmd": new singleValueParser(["data.attributes.cmd.total"], "number"),
            "feats": new entityParser(),
            "skills": new skillsParser(),
            "languages": new languageParser(),
            "sq": new sqParser(),
            "gear": new gearParser(),

        },        
        "ecology": new ecologyParser(),
        "special abilities": new specialAbilityParser(),
        "description": new notesParser(["description.long"], "string")
    }
}
