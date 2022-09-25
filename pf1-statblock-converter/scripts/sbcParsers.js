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

sbcParsing.parseValueToDocPath = async (obj, path, value) => {
    return obj.updateSource({ [path]: value });
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

            throw err

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
                    await sbcParsing.parseValueToDocPath(sbcData.characterData.actorData, field, value)
                }
                return true
            } catch (err) {
                let errorMessage = `Failed to parse ${value} into ${this.targetFields}`
                let error = new sbcError(0, "Parse", errorMessage, line)
                sbcData.errors.push(error)

                throw err

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
                    name: sbcUtils.parseSubtext(input.replace(/\+*\d+/g, "").trim())[0],
                    type: type
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

            // Check for Weapon Finesse and set a flag accordingly
            if (value.toLowerCase() == "weapon finesse" && type == "feats")
                sbcConfig.options.flags.hasWeaponFinesse = true

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
                if (/\s*CR\s*/.test(lineContent)) {
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
                if (/\s*MR\s*/.test(lineContent)) {
                    let parserMR = sbcMapping.map.base.mr
                    let mr = lineContent.match(/\s*MR\s*(\d+)/)[1].trim()
                    parsedSubCategories["mr"] = await parserMR.parse(mr, line)
                }
            }

            if (line !== 0) {

                // Parse Source (uses notesParser, the source has no separate field in FVTT PF1)
                if (!parsedSubCategories["source"]) {
                    if (/^Source/.test(lineContent)) {
                        let parserSource = sbcMapping.map.base.source
                        let source = lineContent.match(/^Source\s+(.*)/)[1].trim()
                        parsedSubCategories["source"] = await parserSource.parse(source, line)
                    }
                }

                // Parse XP 
                if (!parsedSubCategories["xp"]) {
                    if (/^XP/.test(lineContent)) {
                        let parserXP = sbcMapping.map.base.xp;
                        let xp = lineContent.match(/^XP\s+([\d,.]*)/)?.[1].replace(/\.,/g,"").trim() ?? "0";
                        sbcData.notes.base.xp = xp;
                        // We just save the xp into our notes, as foundry calculates them automatically
                        parsedSubCategories["xp"] = await parserXP.parse(xp, line);
                    }
                }

                // Parse Gender
                if (!parsedSubCategories["gender"]) {
                    let patternGender = new RegExp("(\\bmale\\b|\\bfemale\\b)", "i")
                    
                    if (patternGender.test(lineContent)) {
                        let gender = lineContent.match(patternGender)[1]
                        let parserGender = sbcMapping.map.base.gender
                        parsedSubCategories["gender"] = await parserGender.parse(gender, line)
                    }
                }

                // Parse Race
                if (!parsedSubCategories["race"]) {
                    let patternRace = new RegExp("(" + sbcConfig.races.join("\\b|\\b") + ")", "i")
                    let patternOtherRaces = new RegExp("(" + sbcContent.otherRaces.join("\\b|\\b") + ")", "i")
                    
                    // Check, if it's one of the supported or any other known races
                    if (patternRace.test(lineContent)) {
                        let race = lineContent.match(patternRace)[1]
                        let parserRace = sbcMapping.map.base.race
                        parsedSubCategories["race"] = await parserRace.parse(race, line)
                    } else if (patternOtherRaces.test(lineContent)) {
                        let race = lineContent.match(patternOtherRaces)[1]
                        let parserRace = sbcMapping.map.base.race
                        parsedSubCategories["race"] = await parserRace.parse(race, line)
                    }
                }
                
                let patternAlignment = new RegExp("^(Any Alignment|\\*A|\\bLG\\b|\\bLN\\b|\\bLE\\b|\\bNG\\b|\\bN\\b|\\bTN\\b|\\bNE\\b|\\bCG\\b|\\bCN\\b|\\bCE\\b)\\s+", "i")

                // Parse Classes
                if (!parsedSubCategories["classes"]) {

                    // Check for classes only in lines that do not start with an alignment
                    // So as not to match the class "MEDIUM" when it's a Medium Humanoid for example
                    let isAlignmentLine = lineContent.match(patternAlignment)

                    // Check for classes only in lines that do not start with "Source"
                    // So as not to match the class "Witch" when it's included in "Source Pathfinder #72: The Witch Queen's Revenge pg. 86"
                    let isSourceLine = lineContent.match(/^(Source)\s*/)

                    if (!isAlignmentLine && !isSourceLine) {
                        let patternClasses = new RegExp("(" + sbcConfig.classes.join("\\b|\\b") + "\\b|\\b" + sbcConfig.prestigeClassNames.join("\\b|\\b") + "\\b|\\b" + sbcContent.wizardSchoolClasses.join("\\b|\\b") + ")(?![^(]*\\))(.*)", "gi")

                        if (patternClasses.test(lineContent)) {
                            // Take everything from the first class found up until the end of line
                            let classes = lineContent.match(patternClasses)[0]
                            let parserClasses = sbcMapping.map.base.classes
                            parsedSubCategories["classes"] = await parserClasses.parse(classes, line)
                        }
                    }
                }
                

                // Parse Alignment
                if (!parsedSubCategories["alignment"]) {
                    
                    if (patternAlignment.test(lineContent)) {
                        let parserAlignment = sbcMapping.map.base.alignment
                        let alignment = lineContent.match(patternAlignment)[1].trim()
                        sbcData.notes.base.alignment = alignment
                        parsedSubCategories["alignment"] = await parserAlignment.parse(alignment.replace(/\bN\b/, "TN").toLowerCase(), line)
                    }
                }

                // Parse Size and Space / Token Size
                if (!parsedSubCategories["size"]) {
                    let patternSize = new RegExp("(" + Object.values(sbcConfig.const.actorSizes).join("\\b|\\b") + ")", "i")
                    if (patternSize.test(lineContent) && patternAlignment.test(lineContent)) {
                        let parserSize = sbcMapping.map.base.size
                        let size = lineContent.match(patternSize)[1].trim()
                        sbcData.notes.base.size = size
                        let actorSize = sbcUtils.getKeyByValue(sbcConfig.const.actorSizes, size)

                        // Values derived from Size
                        let parserSpace = new singleValueParser(["prototypeToken.height", "prototypeToken.width"], "number")
                        let parserScale = new singleValueParser(["prototypeToken.texture.scaleX", "prototypeToken.texture.scaleY"], "number")

                        let space = CONFIG.PF1.tokenSizes[actorSize].w
                        let scale = CONFIG.PF1.tokenSizes[actorSize].scale

                        parsedSubCategories["size"] = {
                            size: await parserSize.parse(actorSize, line),
                            space: await parserSpace.parse(space, line),
                            scale: await parserScale.parse(scale, line)
                        }

                    }
                }

                // Parse Creature Type and Subtype, but only when they are found after a size declaration
                if (!parsedSubCategories["creatureType"]) {
                    let patternCreatureType = new RegExp("(?:" + Object.values(sbcConfig.const.actorSizes).join("\\b|\\b") + ")\\s*(" + Object.values(sbcConfig.const.creatureTypes).join("\\b.*|\\b") + ")", "i")
                    if (patternCreatureType.test(lineContent)) {
                        let creatureType = lineContent.match(patternCreatureType)[1]
                        let parserCreatureType = sbcMapping.map.base.creatureType

                        parsedSubCategories["creatureType"] = await parserCreatureType.parse(creatureType, line)
                    }
                }

                // Parse Initiative
                if (!parsedSubCategories["init"]) {
                    if (/^Init\b/i.test(lineContent)) {
                        let parserInit = sbcMapping.map.base.init
                        let init = lineContent.match(/(?:Init\s*)(\+\d+|-\d+|\d+)/)[1].trim()
                        sbcData.characterData.conversionValidation.attributes["init"] = +init
                        parsedSubCategories["init"] = await parserInit.parse(+init, line)
                    }
                }

                // Parse Senses
                if (!parsedSubCategories["senses"]) {
                    if (/\bSenses\b/i.test(lineContent)) {
                        let parserSenses = sbcMapping.map.base.senses
                        let senses = lineContent.match(/(?:\bSenses\b\s*)(.*?)(?:\n|$|\s*Aura)/igm)[0].replace(/\bSenses\b\s*|\s*Aura\b/g,"")
                        parsedSubCategories["senses"] = await parserSenses.parse(senses, line)
                    }
                }

                // Parse Aura
                if (!parsedSubCategories["aura"]) {
                    if (/^Aura\b/i.test(lineContent)) {
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

            throw err
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
                name: value.toLowerCase()
            }
            sbcData.notes.base.race = sbcUtils.capitalize(race.name)

            let compendium = "pf1.races"
            let raceItem = await sbcUtils.findEntityInCompendium(compendium, race, line)

            if (raceItem) {
                sbcData.characterData.items.push(raceItem)
            } else {
                // Generate a placeholder for not supported race
                let raceItem = {
                    name: value,
                    type: "race"
                }
                
                let placeholder = await sbcUtils.generatePlaceholderEntity(raceItem, line)
                sbcData.characterData.items.push(placeholder)
            }
            
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as race."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)

            throw err
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
                    if (classInput.match(/(\d+)/)?.[0]) {
                        classLevel = classInput.match(/(\d+)/)[0]
                    }

                    let classData = {
                        name: "",
                        wizardClass: "",
                        suffix: "",
                        archetype: classArchetype,
                        level: classLevel
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
                            name: sbcUtils.capitalize(className),
                            type: "class",
                            data: {
                                description: {
                                    value: "sbc | As the PF1-System currently does not include prestige classes, a placeholder was generated."
                                },
                                bab: classTemplate.bab,
                                classType: "prestige",
                                classSkills: classSkills,
                                level: +classLevel,
                                hd: +classTemplate.hd,
                                hp: +classTemplate.hd + +Math.floor(sbcUtils.getDiceAverage(+classTemplate.hd) * (+classLevel-1)),
                                savingThrows: {
                                    fort: { value: classTemplate.fort },
                                    ref:  { value: classTemplate.ref  },
                                    will: { value: classTemplate.will }
                                },
                                skillsPerLevel: +classTemplate.skillsPerLevel,
                                
                            },
                            img: classTemplate.img
                        }, { temporary : true })

                        

                        let infoMessage = "As the PF1-System currently does not include prestige classes, a placeholder will be generated for the class " + className + "."
                        let info = new sbcError(3, "Parse/Base/Class", infoMessage, line)
                        sbcData.errors.push(info)

                        sbcData.characterData.items.push(classItem)

                    } else {

                        let className = classData.name;
                        let deity;
                        // If the suffix contains an "of" the probability it names a deity is high. So, set that and hope for the best
                        if (classData.suffix.search(/^(of\b)/i) !== -1 && classData.archetype !== "") {
                            deity = classData.suffix.replace(/^(of\b)/i, "").trim()
                            className = sbcUtils.capitalize(classData.name) + " " + classData.suffix + " (" + sbcUtils.capitalize(classData.archetype) + ")"
                        } else if (classData.suffix.search(/^(of\b)/i) !== -1) {
                            deity = classData.suffix.replace(/^(of\b)/i, "").trim()
                            className = sbcUtils.capitalize(classData.name) + " " + classData.suffix
                        } else if (classData.archetype !== "") {
                            className = sbcUtils.capitalize(classData.name) + " (" + sbcUtils.capitalize(classData.archetype) + ")"
                        } else if (classData.wizardClass !== "") {
                            className = sbcUtils.capitalize(classData.wizardClass)
                            classItem.updateSource({
                                data: {
                                    tag: "wizard",
                                    useCustomTag: true,
                                }
                            })
                        } else {
                            className = sbcUtils.capitalize(classData.name)
                        }
                        
                        if (deity) sbcData.characterData.actorData.updateSource({ "system.details.deity": deity })
        
                        classItem.updateSource({
                            name: className,
                            data: {
                                level: +classData.level,
                                hp: +classItem.system.hd + +Math.floor(sbcUtils.getDiceAverage(+classItem.system.hd) * (+classData.level-1)),
                            }
                        })

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
            return false

        }
        
    }
}

// Parse Creature Type and Subtype
class creatureTypeParser extends sbcParserBase {
    
    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as creatureType")
        
        try {

            let tempCreatureType = await sbcParsing.parseSubtext(value)

            // Localization
            let creatureTypeKey = sbcUtils.getKeyByValue(sbcConfig.const.creatureTypes, tempCreatureType[0])
            let localizedCreatureType = CONFIG.PF1.creatureTypes[creatureTypeKey]

            let creatureType = {
                name: tempCreatureType[0],
                type: "racial",
                subTypes: ""
            }

            if (tempCreatureType.length > 1) {
                creatureType.subTypes = tempCreatureType[1]
            }

            let compendium = "pf1.racialhd"
            // Always search the english compendia for entries, so use the english creatureType instead of the localized one
            let creatureTypeItem = await sbcUtils.findEntityInCompendium(compendium, creatureType, line)

            
            
            
            await creatureTypeItem.updateSource({
                data: {
                    tag: globalThis.pf1.utils.createTag(creatureType.name),
                    useCustomTag: true,
                }
            })

            // Set flags for the conversion
            switch (creatureType.name.toLowerCase()) {
                case "undead":
                    sbcConfig.options.flags.isUndead = true
                    break
                default:
                    break
            }

            
            if (creatureType.subTypes !== "") {
                await creatureTypeItem.updateSource({ name: sbcUtils.capitalize(localizedCreatureType) + " (" + sbcUtils.capitalize(creatureType.subTypes) + ")" })
            }
            
            

            sbcData.notes.creatureType = creatureTypeItem.name
            sbcData.characterData.items.push(creatureTypeItem)

            /*

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
                creatureType.subTypes.split(/\s*,\s*/
                
                /*).map(function (elem) {
                    if (elem) {
                        let elemContainer = []
                        elemContainer.push(elem)
                        subTypesArray.push(elemContainer)
                    }
                    
                })

                let camelizedCreatureType = sbcUtils.camelize(creatureType.name)
                
                let race = {
                    name: sbcUtils.capitalize(localizedCreatureType),
                    type: "race",
                    creatureType: camelizedCreatureType,
                    subTypes: subTypesArray,
                    img: creatureTypeItem.data.img
                }
                
                let placeholder = await sbcUtils.generatePlaceholderEntity(race, line)
                sbcData.characterData.items.push(placeholder)
                
            }

            */

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as creatureType."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(err)
            throw err
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

            let customSenses = ""

            // Search for matches
            for (let i=0; i<availableSenses.length; i++) {

                let searchSense = availableSenses[i]

                if (value.search(searchSense) !== -1) {

                    if (sbcData.notes.base.senses === undefined) {
                        sbcData.notes.base.senses = searchSense
                    } else {
                        sbcData.notes.base.senses += "; " + searchSense
                    }

                    let range = -1
                    let rangeRegEx = new RegExp ("(?:" + searchSense + ")\\s(\\d+)", "")

                    switch (searchSense) {

                        // Custom Senses
                        case "all-around vision":
                        case "carrion sense":
                        case "deathwatch":
                        case "deepsight":
                        case "dragon senses":
                        case "greensight":
                        case "lifesense":
                        case "minesight":
                        case "water sense":
                            if (customSenses === "") {
                                customSenses = searchSense
                            } else {
                                customSenses = customSenses.concat(";" + searchSense)
                            }
                            break

                        // Range
                        case "blindsight":
                            range = value.match(rangeRegEx)[1]
                            range ? sbcData.characterData.actorData.updateSource({"system.traits.senses.bs": +range}) : null
                            break
                        case "blindsense":
                            range = value.match(rangeRegEx)[1]
                            range ? sbcData.characterData.actorData.updateSource({"system.traits.senses.bse": +range}) : null
                            break
                        case "darkvision":
                            range = value.match(rangeRegEx)[1]
                            range ? sbcData.characterData.actorData.updateSource({"system.traits.senses.dv": +range}) : null
                            break
                        case "tremorsense":
                            range = value.match(rangeRegEx)
                            range ? sbcData.characterData.actorData.updateSource({"system.traits.senses.ts": +range}) : null
                            break

                        // Yes/No Toggle
                        case "scent":
                            sbcData.characterData.actorData.updateSource({"system.traits.senses.sc": true})
                            break
                        case "see in darkness":
                            sbcData.characterData.actorData.updateSource({"system.traits.senses.sid": true})
                            break
                        case "truesight":
                        case "true seeing":
                            sbcData.characterData.actorData.updateSource({"system.traits.senses.tr": true})
                            break
                        case "see invisibility":
                            sbcData.characterData.actorData.updateSource({"system.traits.senses.si": true})
                            break
                        // For whatever reason lowlight is handled differently from the other toggles
                        case "low-light":
                            sbcData.characterData.actorData.updateSource({"system.traits.senses.ll.enabled": true})
                            break

                        default:
                            let errorMessage = "No match found for " + value + ". This definitily should not have happened. Sorry!"
                            let error = new sbcError(1, "Parse/Base", errorMessage, line)
                            sbcData.errors.push(error)
                            break
                    }

                }

            }

            // Set customSenses
            if (customSenses !== "") {
                sbcData.characterData.actorData.updateSource({"traits.senses.custom": customSenses})
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
            
            let auras = sbcUtils.sbcSplit(value)

            for (let i=0; i<auras.length; i++) {

                let auraInput = auras[i]

                if (auraInput !== "" && auraInput !== ",") {
        
                    let auraName = ""
                    let auraRange = 0
                    let auraSaveType = ""
                    let auraDC = ""
                    let auraDCNotes = ""
                    let actionType = null
                    let auraEffect = ""
        
                    // Name = Everything before the opening parenthesis or first number
                    auraName = auraInput.replace(/(\(.*\)|\d.*)/,"").trim();

                    // Range = Numbers before ".ft"
                    if (/([^(,;a-zA-Z]+)(?:ft.)/i.test(auraInput)) {
                        auraRange = auraInput.match(/([^(,;a-zA-Z]+)(?:ft.)/)[1].trim();
                    }
                    // DC = Number after "DC"
                    if (/\bDC\b/.test(auraInput)) {
                        //auraDC = auraInput.match(/(?:DC\s*)([^)(,;]+)/)[1].trim()
                        auraDC = auraInput.match(/(?:DC\s*)(\d+)/)[1]
                        actionType = "save"

                        // auraDCNotes, e.g. negates, halfs
                        if (/(?:DC\s*\d+\s*)([^)(,;0-9]+)/.test(auraInput)) {
                            auraDCNotes = auraInput.match(/(?:DC\s*\d+\s*)([^)(,;0-9]+)/)[1]
                        }

                        if (/([^)(,;]+)(?:DC\s*\d+)/.test(auraInput)) {
                            auraSaveType = auraInput.match(/([^)(,;]+)(?:DC\s*\d+)/)[1].trim().toLowerCase()
                        }
                        
                    }

                    let auraEffectPatternString = "(" + "\\b" + auraName + "\\b|\\b" + auraRange + "\\b|\\b" + auraSaveType + "\\b|\\b" + auraDC + "\\b|\\b" + auraDCNotes + "\\b|" + "\\bDC\\b|\\bft\\.|[(),])"
                    auraEffectPatternString = auraEffectPatternString.replace(/(\|\\b\\b)/g, "")

                    let auraEffectPattern = new RegExp (auraEffectPatternString, "gi")

                    auraEffect = sbcUtils.makeValueRollable(auraInput.replace(auraEffectPattern, "").trim())

                    let aura = await Item.create({
                        name: "Aura: " + sbcUtils.capitalize(auraName),
                        type: "feat",
                        data: {
                            abilityType: "none",
                            actionType: actionType,
                            activation: {
                                cost: null,
                                type: "passive"
                            },
                            duration: {
                                units: "perm"
                            },
                            effectNotes: auraEffect,
                            featType: "racial",
                            measureTemplate: {
                                type: "circle",
                                size: auraRange
                            },
                            range: {
                               value: auraRange,
                               units: "ft" 
                            },
                            save: {
                                dc: auraDC,
                                type: auraSaveType,
                                description: auraDCNotes
                            },
                            tag: "aura",
                            target: {
                                value: "centered on self"
                            }
                        },
                        img: "systems/pf1/icons/spells/runes-blue-3.jpg"
                    }, { temporary : true })
    
                    sbcData.characterData.items.push(aura)
                }
                
            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as aura."
            let error = new sbcError(1, "Parse/Base", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
                if (/^AC\s*(\d+)/.test(lineContent)) {
                    let parserAcNormal = sbcMapping.map.defense.acNormal
                    let acNormal = lineContent.match(/^AC\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acNormal"] = +acNormal

                    parsedSubCategories["acNormal"] = await parserAcNormal.parse(+acNormal, line+startLine)
                }
            }

            // Parse Touch AC
            if (!parsedSubCategories["acTouch"]) {
                if (/Touch\s*(\d+)/i.test(lineContent)) {
                    let parserAcTouch = sbcMapping.map.defense.acTouch
                    let acTouch = lineContent.match(/Touch\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acTouch"] = +acTouch

                    parsedSubCategories["acTouch"] = await parserAcTouch.parse(+acTouch, line+startLine)
                }
            }

            // Parse Flat-footed AC
            if (!parsedSubCategories["acFlatFooted"]) {
                if (/flat-footed\s*(\d+)/i.test(lineContent)) {
                    let parserAcFlatFooted = sbcMapping.map.defense.acFlatFooted
                    let acFlatFooted = lineContent.match(/flat-footed\s*(\d+)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acFlatFooted"] = +acFlatFooted

                    parsedSubCategories["acFlatFooted"] = await parserAcFlatFooted.parse(+acFlatFooted, line+startLine)
                }
            }

            // Parse AC Types
            if (!parsedSubCategories["acTypes"]) {
                if (/^(?:AC[^\(]*[\(])([^\)]*)/i.test(lineContent)) {
                    let parserAcTypes = sbcMapping.map.defense.acTypes
                    let acTypes = lineContent.match(/^(?:AC[^\(]*[\(])([^\)]*)/i)[1].trim()

                    sbcData.characterData.conversionValidation.attributes["acTypes"] = acTypes
                    
                    parsedSubCategories["acTypes"] = await parserAcTypes.parse(acTypes, line+startLine)
                }
            }

            // Parse HP and HD
            if (!parsedSubCategories["hp"]) {
                if (/^(?:HP)(.*)/i.test(lineContent)) {
                    let parserHp = sbcMapping.map.defense.hp
                    let hp = lineContent.match(/^(?:HP)(.*)/i)[1].trim()

                    parsedSubCategories["hp"] = await parserHp.parse(hp, line+startLine)
                }
            }

            // Parse Saves
            if (!parsedSubCategories["saves"]) {
                if (/^(Fort\b.*)/i.test(lineContent)) {
                    let parserSaves = sbcMapping.map.defense.saves
                    let saves = lineContent.match(/^(Fort.*)/i)[1].trim()
                    parsedSubCategories["saves"] = await parserSaves.parse(saves, line+startLine)
                }
            }

            // Parse Damage Reduction
            if (!parsedSubCategories["dr"]) {
                if (/(\bDR\b)/i.test(lineContent)) {
                    let parserDr = sbcMapping.map.defense.dr
                    let dr = lineContent.match(/(?:\bDR\b\s*)([^;,]*)/i)[1].trim()
                    parsedSubCategories["dr"] = await parserDr.parse(dr, line+startLine)
                }
            }

            // Parse Immunities
            if (!parsedSubCategories["immune"]) {
                if (/(Immune\b.*)/i.test(lineContent)) {
                    let parserImmune = sbcMapping.map.defense.immune
                    let immunities = lineContent.match(/(?:Immune)([\s\S]*?)(?=$|Resist|SR|Weakness)/i)[1].trim()
                    parsedSubCategories["immune"] = await parserImmune.parse(immunities, line+startLine)
                }
            }

            // Parse Resistances
            /*
            if (!parsedSubCategories["resist"]) {
                if (/(Resist\b.*)/i.test(lineContent)) {
                    let parserResist = sbcMapping.map.defense.resist
                    let resistances = lineContent.match(/(?:Resist\b)([\s\S]*?)(?=$|SR|Immune|Weakness)/i)[1].trim()
                    parsedSubCategories["resist"] = await parserResist.parse(resistances, line+startLine)
                }
            }
            */
            if (!parsedSubCategories["resist"]) {
                if (/(\bResist\b.*)/i.test(lineContent)) {
                    let parserResist = sbcMapping.map.defense.resist
                    let resistances = lineContent.match(/(?:\bResist\b)([\s\S]*?)(?=$|SR|Immune|Weakness)/i)[1].trim()
                    parsedSubCategories["resist"] = await parserResist.parse(resistances, line+startLine)
                }
            }

            // Parse Weaknesses / Vulnerabilities
            if (!parsedSubCategories["weakness"]) {
                if (/(Weakness.*)/i.test(lineContent)) {
                    let parserWeakness = sbcMapping.map.defense.weakness
                    let weaknesses = lineContent.match(/(?:Weaknesses|Weakness)([\s\S]*?)(?=$|Resist|Immune|SR)/i)[1].trim()
                    parsedSubCategories["weakness"] = await parserWeakness.parse(weaknesses, line+startLine)
                }
            }

            // Parse Spell Resistance
            if (!parsedSubCategories["sr"]) {
                if (/(\bSR\b.*)/i.test(lineContent)) {
                    let parserSr = sbcMapping.map.defense.sr
                    let sr = lineContent.match(/(?:\bSR\b\s*)([^;,]*)/i)[1].trim()
                    parsedSubCategories["sr"] = await parserSr.parse(sr, line+startLine)
                }
            }


            // Parse Defensive Abilities
            if (!parsedSubCategories["defensiveAbilities"]) {
                if (/Defensive Abilities\b/i.test(lineContent)) {
                    let parserDefensiveAbilities = sbcMapping.map.defense.defensiveAbilities
                    let defensiveAbilities = lineContent.match(/(?:Defensive Abilities\b\s*)([\s\S]*?)(?=$|\bDR\b|\bImmune\b|\bResist\b(?!\s\blife\b)|\bSR\b|\bWeakness\b)/i)[1].replace(/\s*[,;]+/g,",").replace(/(,\s*$)/, "").trim()
                    sbcData.notes.defense.defensiveAbilities = defensiveAbilities
                    parsedSubCategories["defensiveAbilities"] = await parserDefensiveAbilities.parse(defensiveAbilities, line+startLine, "class-abilities")
                }
            }


        } catch (err) {
            let errorMessage = `Parsing the defense data failed at line ${line+startLine}`
            let error = new sbcError(1, "Parse/Defense", errorMessage, line+startLine)
            sbcData.errors.push(error)

            throw err

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
                sbcData.characterData.actorData.updateSource({ "attributes.acNotes": acContextNotes })
            }

            let foundAcTypes = rawAcTypes[0].split(",")
            // Get supported AC Types
            let patternAcTypes = new RegExp("(" + sbcConfig.armorBonusTypes.join("\\b|\\b") + ")", "gi")

            for (let i=0; i<foundAcTypes.length; i++) {
                let foundAc = foundAcTypes[i].trim();
                let foundAcType = foundAc.match(patternAcTypes)?.[0].toLowerCase();
                let foundAcTypeValue = foundAc.match(/[+-]\d+/)?.[0] ?? 0;

                switch (foundAcType) {
                    case "natural":
                        sbcData.characterData.actorData.updateSource({"attributes.naturalAC": foundAcTypeValue})
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

            throw err

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
                    classItem.updateSource({ "hp": 0 })

                    if (classItem.system.classType !== "racial") {
                        hasOnlyRacialHd = false
                        classesLeftToParse++
                    } else {
                        // Reset Level of RacialHD
                        classItem.updateSource({ "level": 0 })
                        isRacial = true
                    }

                    // Save the classItems for later use
                    let classWithHd = {
                        name: classItem.name,
                        hd: classItem.system.hd,
                        level: classItem.system.level,
                        isParsed: false,
                        isRacial
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
            sbcData.characterData.actorData.updateSource({ "system.attributes.hp.value": +hpTotalInStatblock })

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
                                foundClassItem.updateSource({"system.level": +numberOfHitDice})
                                
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
                                    foundClassItem.updateSource({"system.level": classItem.level})
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
                                
                            foundClassItem.updateSource({"hp": +calcHp})
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

                let hdAbilitiesPattern = new RegExp("(\\bregeneration\\b|\\bfast[ -]healing\\b)", "gi")

                for (let i=1; i<input.length; i++) {
                    
                    let tempInput = input[i].trim()

                    if (tempInput.length !== 0) {
                        // Check, if the input matches "regeneration" or "fast healing"
                        if (tempInput.search(hdAbilitiesPattern) !== -1) {
                            // Input the hdAbility into the correct places in the sheet

                            let hpAbilityType = tempInput.match(hdAbilitiesPattern)[0].toLowerCase()

                            switch (hpAbilityType) {
                                case "regeneration":
                                    let parserRegeneration = new singleValueParser(["system.traits.regen"], "string")
                                    await parserRegeneration.parse(tempInput, line)
                                    break
                                case "fast healing":
                                case "fast-healing":
                                    let parserFastHealing = new singleValueParser(["system.traits.fastHealing"], "string")
                                    await parserFastHealing.parse(tempInput, line)
                                    break
                                default:
                                    break
                            }
                            hdAbilities.push(tempInput)
                        } else {
                            // Generate a placeholder for every hdAbility that is not accounted for in the character sheet
                            let hdAbility = {
                                name: tempInput,
                                type: "misc"
                            }
        
                            hdAbilities.push(hdAbility.name)
                            
                            let placeholder = await sbcUtils.generatePlaceholderEntity(hdAbility, line)
                            sbcData.characterData.items.push(placeholder)
                        }
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

            let input = value;
            let saveContext = "";
            
            // Unparenthesized semicolon
            if (/;(?![^(]*\))/.test(input)) {
                [input, saveContext] = input.split(/;(?![^(]*\))/);
            }
            
            let saves = sbcUtils.sbcSplit(input).map(sbcUtils.parseSubtext);
            
            for (let k = 0; k < saves.length; k++) {
                let save = 0, saveType;
                if (/(?:Fort\s*[\+]?)(\-?\d+)/i.test(saves[k][0])) {
                    save = saves[k][0].match(/(?:Fort\s*[\+]?)(\-?\d+)/i)[1];
                    saveType = "fort";
                }
                else if (/(?:Ref\s*[\+]?)(\-?\d+)/i.test(saves[k][0])) {
                    save = saves[k][0].match(/(?:Ref\s*[\+]?)(\-?\d+)/i)[1];
                    saveType = "ref";
                }
                else if (/(?:Will\s*[\+]?)(\-?\d+)/i.test(saves[k][0])) {
                    save = saves[k][0].match(/(?:Will\s*[\+]?)(\-?\d+)/i)[1];
                    saveType = "will";
                }
                if (!saveType) {
                    let errorMessage = "Failed to parse " + saves[k].join("") + " as Saves.";
                    let error = new sbcError(2, "Parse/Defense", errorMessage, line);
                    sbcData.errors.push(error);
                }
                else {
                    sbcData.characterData.conversionValidation.attributes[saveType] = save;
                    sbcData.notes.defense[saveType + "Save"] = save;
                    if (saves[k][1]) {
                        saveContext += (saveContext ? "\n" : "") + saveType.substring(0,1).toUpperCase() + saveType.substring(1) + ": " + saves[k][1];
                    }
                }
            }

            // Check if there are context notes for the saves
          if (saveContext) {
            sbcData.characterData.actorData.updateSource({ "system.attributes.saveNotes": saveContext.trim() });
          }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Saves."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
                    let immunityKey = sbcUtils.getKeyByValue(CONFIG["PF1"].conditionTypes, immunity)
                    sbcData.characterData.actorData.system.traits.ci.value.push(sbcUtils.camelize(immunityKey))
                } else if (immunity.search(patternDamageTypes) !== -1) {
                    // its a damage immunity
                    let immunityKey = sbcUtils.getKeyByValue(CONFIG["PF1"].damageTypes, immunity)
                    sbcData.characterData.actorData.system.traits.di.value.push(sbcUtils.camelize(immunityKey))
                } else {
                    // Its a custom immunity
                    let existingCustomImmunities = sbcData.characterData.actorData.system.traits.ci.custom
                    sbcData.characterData.actorData.updateSource({ "system.traits.ci.custom": existingCustomImmunities + sbcUtils.capitalize(immunity) + ";" })
                }

                
            }

            // Remove any semicolons at the end of the custom immunities
            sbcData.characterData.actorData.updateSource({ "system.traits.ci.custom": sbcData.characterData.actorData.system.traits.ci.custom.replace(/(;)$/, "") })

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Immunities."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
                    sbcData.characterData.actorData.system.traits.cres += sbcUtils.capitalize(resistance) + ";"
                } else if (resistance.search(patternDamageTypes) !== -1) {
                    // its a damage resistance
                    sbcData.characterData.actorData.system.traits.eres += sbcUtils.capitalize(resistance) + ";"
                } else {
                    // Its a custom resistance, as there is no place for that, just put it into energy resistances
                    sbcData.characterData.actorData.system.traits.eres += sbcUtils.capitalize(resistance) + ";"
                }
            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Resistances."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
                    // its a damage weakness / vulnerability
                    sbcData.characterData.actorData.system.traits.dv.value.push(sbcUtils.camelize(matchedWeakness))
                } else {
                    // Its a custom weakness / vulnerability
                    let existingCustomWeakness = sbcData.characterData.actorData.system.traits.dv.custom
                    sbcData.characterData.actorData.updateSource({ "system.traits.dv.custom": existingCustomWeakness + sbcUtils.capitalize(weakness) + ";" })
                }
            }

            // Remove any semicolons at the end of the custom vulnerabilities
            sbcData.characterData.actorData.updateSource({ "system.traits.dv.custom": sbcData.characterData.actorData.system.traits.dv.custom.replace(/(;)$/, "") })

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Weaknesses."
            let error = new sbcError(1, "Parse/Defense", errorMessage, line)
            sbcData.errors.push(error)

            throw err

            return false

        }

    }

}

// Parse Spell Resistance
class srParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as Spell Resistance")

        try {
            let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "");
            let input = sbcUtils.parseSubtext(rawInput);
            
            let srTotal = input[0];
            let srContext = "";
            let srNotes = "";

            
            if (input[1]) {
                srContext = input[1];
                srNotes = srContext;
            }
            else if (/\s*([-+]?\d+)\s+(.*)/.test(srTotal)) {
                [srTotal, srContext] = srTotal.split(/\s*([-+]?\d+)\s+(.*)/).slice(1);
                srNotes = srContext;
            }

            sbcData.characterData.actorData.updateSource({
                attributes: {
                  sr: {
                    formula: srTotal.toString(),
                },
                srNotes,
                }
            });

            return true;

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Spell Resistance.";
            let error = new sbcError(1, "Parse/Defense", errorMessage, line);
            sbcData.errors.push(error);

            throw err;

            return false;

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
        0: "primary",
        1: "secondary",
        2: "tertiary"
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
            
            if (/^(Speed|Spd)\s*/i.test(lineContent)) {
                if (!parsedSubCategories["landSpeed"]) {
                    let parserLandSpeed = sbcMapping.map.offense.speed
                    let landSpeed = lineContent.match(/^(?:Speed|Spd)\s*($|[^,]*)/i)[1].trim()

                    parsedSubCategories["landSpeed"] = await parserLandSpeed.parse(landSpeed, "land", line+startLine)
                }
                
                // Parse Swim Speed
                if (!parsedSubCategories["swimSpeed"]) {
                    if (/\bSwim\s*/i.test(lineContent)) {
                        let parserSwimSpeed = sbcMapping.map.offense.speed
                        let swimSpeed = lineContent.match(/\bSwim\s*($|[^,]*)/i)[1].trim()

                        parsedSubCategories["swimSpeed"] = await parserSwimSpeed.parse(swimSpeed, "swim", line+startLine)
                    }
                }

                // Parse Climb Speed
                if (!parsedSubCategories["climbSpeed"]) {
                    if (/\bClimb\s*/i.test(lineContent)) {
                        let parserClimbSpeed = sbcMapping.map.offense.speed
                        let climbSpeed = lineContent.match(/\bClimb\s*($|[^,]*)/i)[1].trim()

                        parsedSubCategories["climbSpeed"] = await parserClimbSpeed.parse(climbSpeed, "climb", line+startLine)
                    }
                }

                // Parse Burrow Speed
                if (!parsedSubCategories["burrowSpeed"]) {
                    if (/\bBurrow\s*/i.test(lineContent)) {
                        let parserBurrowSpeed = sbcMapping.map.offense.speed
                        let burrowSpeed = lineContent.match(/\bBurrow\s*($|[^,]*)/i)[1].trim()

                        parsedSubCategories["burrowSpeed"] = await parserBurrowSpeed.parse(burrowSpeed, "burrow", line+startLine)
                    }
                }

                // Parse Fly Speed
                if (!parsedSubCategories["flySpeed"]) {
                    if (/\bFly\s*/i.test(lineContent)) {
                        let parserFlySpeed = sbcMapping.map.offense.speed
                        let flySpeed = lineContent.match(/\bFly\s*($|[^,]*)/i)[1].trim()

                        parsedSubCategories["flySpeed"] = await parserFlySpeed.parse(flySpeed, "fly", line+startLine)
                    }
                }
            }

            // Parse Speed Abilities
            // WIP

            // Parse Melee Attacks
            if (!parsedSubCategories["melee"]) {
                if (/^Melee\s*/i.test(lineContent)) {
                    let parserMelee = sbcMapping.map.offense.attacks
                    let melee = lineContent.match(/^Melee\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.melee = melee

                    parsedSubCategories["melee"] = await parserMelee.parse(melee, "mwak", line+startLine)
                }
            }

            // Parse Ranged Attacks
            if (!parsedSubCategories["ranged"]) {
                if (/^Ranged\s*/i.test(lineContent)) {
                    let parserRanged = sbcMapping.map.offense.attacks
                    let ranged = lineContent.match(/^Ranged\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.ranged = ranged

                    parsedSubCategories["ranged"] = await parserRanged.parse(ranged, "rwak", line+startLine)
                }
            }

            // Parse Special Attacks
            if (!parsedSubCategories["specialAttacks"]) {
                if (/^Special\s+Attacks\b\s*/i.test(lineContent)) {
                    let parserSpecialAttacks = sbcMapping.map.offense.specialAttacks
                    let specialAttacks = lineContent.match(/^Special\s+Attacks\s*(.*)/i)[1].trim()

                    sbcData.notes.offense.specialAttacks = specialAttacks

                    parsedSubCategories["specialAttacks"] = await parserSpecialAttacks.parse(specialAttacks, line+startLine)
                }
            }

            // Parse Space, Reach and Stature
            if (!parsedSubCategories["spaceStature"]) {
                if (/^Space\b.*\bReach\b/i.test(lineContent)) {
                    // This may overwrite space and reach that was automatically derived by creature size,
                    // which in theory should be fine, i guess
                    let parserSpace = new singleValueParser(["prototypeToken.height", "prototypeToken.width"], "number")
                    let parserStature = new singleValueParser(["system.traits.stature"], "string")
                    
                    let space = +lineContent.match(/^Space\s*(\d+)/i)[1]
                    let spaceInSquares = +Math.floor(+space/5)

                    let reachInput = sbcUtils.parseSubtext(lineContent.match(/Reach(.*)/i)[1])
                    
                    let reach = ""
                    let reachContext = ""

                    if (reachInput[0])
                        reach = reachInput[0].replace(/(\d+)(.*)/g, "$1").trim()

                    if (reachInput[1])
                        reachContext = reachInput[1].replace(/[\(\)]/g, "").trim()

                    sbcData.notes.offense.space = space
                    sbcData.notes.offense.reach = reach
                    sbcData.notes.offense.reachContext = reachContext

                    // Foundry PF1 actor has no field for "reach", so try to derive the "stature" from reach
                    // In 90% of all cases this should be "tall"
                    let stature = "tall"

                    if (+reach < +space)
                        stature = "long"

                    parsedSubCategories["spaceReach"] = {
                        space: await parserSpace.parse(spaceInSquares, line+startLine),
                        stature: await parserStature.parse(stature, line+startLine)
                    }
                }
            }

            // Spellcasting support functions
            const getCasterLevel = (line) => line.match(/\bCL\b\s*(?<cl>\d+)/i)?.groups.cl;
            const getConcentrationBonus = (line) => line.match(/\b(Concentration\b|Conc\.)\s*\+(?<bonus>\d+)/i)?.groups.bonus;

                    
            // Parse Spell-Like Abilities
            if (!parsedSubCategories["spellLikeAbilities"]) {
                /* Collate all lines that are part of the Spell-Like Abilities,
                 * by putting all lines found after the keyword ...
                 * ... up until the end of the section or
                 * ... up until the next keyword
                 * into an array
                 */
                
                // Start with the line containing the keyword, CL and other base info
                if (/^Spell-Like\s+Abilities\b\s*/i.test(lineContent)) {

                    spellLikeAbilitiesFound = true

                    sbcData.notes.offense.hasSpellcasting = true

                    // Set the startIndexOfSpellLikeAbilities to the line in the current offense section
                    startIndexOfSpellLikeAbilities = line

                    // Set casterLevel and concentrationBonus
                    let casterLevel = getCasterLevel(lineContent) ?? 0;
                    let concentrationBonus = getConcentrationBonus(lineContent) ?? 0;

                    // Push the line into the array holding the raw data for Spell-Like Abilities
                    rawSpellBooks[spellBooksFound] = {
                        firstLine: lineContent,
                        spells: [],
                        spellCastingType: "spontaneous",
                        spellCastingClass: "_hd",
                        casterLevel: casterLevel,
                        concentrationBonus: concentrationBonus,
                        spellBookType: "spelllike"
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
                    if (/Spells|Extracts (?:Prepared|Known)|Psychic Magic/gi.test(lineContent)) {
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
            
            // Parse Psychic Magic
            if (!parsedSubCategories["psychicMagic"]) {
                // Psychic Magic contains a header and a single line after about its pool
                if (/^Psychic\s+Magic\b\s*/i.test(lineContent)) {
                    
                    currentSpellBook = spellBooksFound
                    startIndexOfSpellBooks[currentSpellBook] = line
                    spellBooksFound += 1

                    sbcData.notes.offense.hasSpellcasting = true

                    const casterLevel = getCasterLevel(lineContent) ?? 0;
                    const concentrationBonus = getConcentrationBonus(lineContent) ?? 0;

                    // Push the line into the array holding the raw data for Spell-Like Abilities
                    rawSpellBooks[spellBooksFound] = {
                        firstLine: lineContent,
                        spells: [],
                        spellCastingType: "points",
                        spellCastingClass: "_hd",
                        casterLevel: casterLevel,
                        concentrationBonus: concentrationBonus,
                        spellBookType: "tertiary"
                    }

                    rawSpellBooks[spellBooksFound].spells.push(data[line+1]);
                    line++;
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
                if (/Spells|Extracts (?:Prepared|Known)\b\s*/i.test(lineContent)) {

                    currentSpellBook = spellBooksFound
                    startIndexOfSpellBooks[currentSpellBook] = line
                    spellBooksFound += 1

                    sbcData.notes.offense.hasSpellcasting = true

                    // Check for the spellCastingType (Spontaneous is default)
                    // Set casterLevel and concentrationBonus
                    // Set spellCastingClass (hd is default)

                    let spellCastingType = "spontaneous"
                    let casterLevel = getCasterLevel(lineContent) ?? 0;
                    let concentrationBonus = getConcentrationBonus(lineContent) ?? 0;
                    let spellCastingClass = "hd"
                    let isAlchemist = /Extracts/i.test(lineContent);

                    if (/prepared/i.test(lineContent)) {
                        spellCastingType = "prepared"
                    }

                    let patternSupportedClasses = new RegExp("(" + sbcConfig.classes.join("\\b|\\b") + ")", "gi")
                    let patternPrestigeClasses = new RegExp("(" + sbcConfig.prestigeClassNames.join("\\b|\\b") + ")(.*)", "gi")
                    let patternWizardClasses = new RegExp("(" + sbcContent.wizardSchoolClasses.join("\\b|\\b") + ")(.*)", "gi")

                    let castingClass = lineContent.match(patternSupportedClasses) ?? lineContent.match(patternPrestigeClasses) ?? lineContent.match(patternWizardClasses);
                    if (castingClass !== null) {
                        spellCastingClass = castingClass[0]
                    }

                    // Push the line into the array holding the raw data for spellBook
                    rawSpellBooks[spellBooksFound] = {
                        firstLine: lineContent,
                        spells: [],
                        spellCastingClass: spellCastingClass,
                        spellCastingType: spellCastingType,
                        casterLevel: casterLevel,
                        concentrationBonus: concentrationBonus,
                        spellBookType: currentSpellBookType[currentSpellBook],
                        isAlchemist: isAlchemist
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

                    if (/Spells|Extracts (?:Prepared|Known)|Psychic Magic/gi.test(lineContent)) {
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

            if (value.length > 0) {

                let rawInput = value.replace(/(^[,;\s]*|[,;\s]*$)/g, "")
                let input = sbcUtils.parseSubtext(rawInput)

                sbcData.notes.offense.speed = rawInput

                let speed = input[0].match(/(\d+)/)?.[1];
                let speedContext = "";
                
                if (speed == null) {
                    let errorMessage = "Failed to parse " + value + " as Speed of type " + type + ".";
                    let error = new sbcError(2, "Parse/Offense", errorMessage, line);
                    sbcData.errors.push(error);
                }

                sbcData.characterData.conversionValidation.attributes[type] = +speed
                sbcData.characterData.actorData.updateSource({ [`system.attributes.speed.${type}.base`]: +speed })

                // TODO: Allow abbreviations
                let flyManeuverabilitiesPattern = new RegExp("(" + Object.values(CONFIG["PF1"].flyManeuverabilities).join("\\b|\\b") + ")", "i")

                if (input.length > 1) {
                    if (type === "fly") {
                        let flyManeuverability = input[1].match(flyManeuverabilitiesPattern)?.[1];
                        if (flyManeuverability) {
                            sbcData.characterData.actorData.updateSource({ "system.attributes.speed.fly.maneuverability": flyManeuverability });
                        }
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

            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as Speed of type " + type + ".";
            let error = new sbcError(1, "Parse/Offense", errorMessage, line);
            sbcData.errors.push(error);

            throw err;

            return false;

        }

    }

}

// Parse Attacks
class attacksParser extends sbcParserBase {

    async parse(value, type, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as " + type + "-Attack.")

        try {

            // [1] Sanitize the input
            let rawInput = value
                .replace(/(, or)/g, " or")
                .replace(/, \band\b /g, " and ")
                .replace(/\band\b (?![^(]*\)|\()/g,",")

            // [2] Split it into attackGroups denoted by an "or"
            //     All attacks in an attackGroup can be part of a full attack action
            //     Loop over these attackGroups to handle each separately
            let m_InputAttackGroups = rawInput.split(/\bor\b/g)
            let attackGroupKeys = Object.keys(m_InputAttackGroups)
    
            for (var i = 0; i < attackGroupKeys.length; i++) {

                // [3] Split the attacks found in the attackGroup
                //     and loop over each attack separately
                //     Goal: For version 0.81.0 of the pf1e foundry system
                //           Create an attack document with embedded subActions
                let m_InputAttackGroup = sbcUtils.sbcSplit(m_InputAttackGroups[i])
                let attackKeys = Object.keys(m_InputAttackGroup)

                let m_FullAttackActions = []
        
                // Loop over all attacks in the attackGroup
                for (let j = 0; j < attackKeys.length; j++) {

                    let m_InputAttack = m_InputAttackGroup[j].trim()

                    // [4] Parse the attack and save the found data in two temporary constructs
                    // <param name="m_AttackData">Saves all parsed data related to the parent attack document.</param>
                    // <param name="m_ActionData">Saves all parsed data related to the child action document(s).</param>

                    let m_AttackData = {
                        attackName: "",
                        formattedAttackName: "",
                        actions: [],
                        img: "",
                        attackType: "weapon",
                        attackNotes: "",
                        effectNotes: [],
                        isMasterwork: false,
                        enhancementBonus: 0,
                        isPrimaryAttack: true,
                        held: "normal",
                    }

                    let m_ActionData = {
                        numberOfAttacks: 1,
                        numberOfIterativeAttacks: 0,

                        attackParts: [],
                        formulaicAttacksCountFormula: "",
                        formulaicAttacksBonusFormula: "",

                        inputAttackModifier: 0,
                        calculatedAttackBonus: 0,

                        attackAbilityType: "",
                        attackAbilityModifier: 0,

                        damage: "",
                        damageAbilityType: "",
                        numberOfDamageDice: 0,
                        damageDie: 0,
                        damageBonus: 0,
                        damageModifier: 0,

                        damageParts: [],
                        nonCritParts: [],

                        defaultDamageType: "",
                        damageTypes: [],
                        customDamageTypes: "",
                        specialDamageType: "",
                        hasSpecialDamageType: false,
                        weaponSpecial: "-",
                        critRange: 20,
                        critMult: 2,
                        
                        attackRangeUnits: "",
                        attackRangeIncrement: "",
                    }

                    //       This is spaghetti, as we depend on the sequence of parsing events
                    //       to get data, which is stupid and does not adhere to the differentiation
                    //       of attacks and actions the pf1e system introduced in v0.81.0
                    //
                    //       WIP: This whole section could (and probably should) be refactored sometime
                    //       As should sbc in general ...

                    // [4.A] Parse attack related data, e.g. name, number, iterations and modifiers
                    //       This is mainly everything not in parenthesis in any given attack
                    
                    // Search for Touch or Ranged Touch
                    if (m_InputAttack.search(/(?:\d+\s*)(ranged\s*touch|melee\s*touch|touch)(?:\s*\()/i) !== -1) {
                        let specialAttackType = m_InputAttack.match(/(ranged\s*touch|melee\s*touch|touch)/i)[1];
                        m_AttackData.attackNotes += specialAttackType + "\n";

                        // Remove the found data from the current input
                        m_InputAttack = m_InputAttack.replace(/(ranged\s*touch|melee\s*touch|touch)/i, "");
                        //No valid name remaining
                        if (!/[a-z](?![^(]*\))/i.test(m_InputAttack))
                            m_AttackData.attackName = "Attack " + (j + 1);
                    }

                    // attackName
                    if (/((?:[a-zA-Z’']| (?=[a-zA-Z’'])|\*)+)(?:[ +0-9(/]+\(*)/.test(m_InputAttack) && !m_AttackData.attackName) {
                        m_AttackData.attackName = m_InputAttack.match(/((?:[a-zA-Z’']| (?=[a-zA-Z’'])|\*)+)(?:[ +0-9(/]+\(*)/)[1].replace(/^ | $/g, "").replace(/\bmwk\b /i, "").replace(/\*/, "").trim()                    
                        m_AttackData.attackNotes += m_AttackData.attackName + " "
                    }
                             
                    // Handle melee attacks
                    if (type === "mwak") {

                        m_AttackData.img = "systems/pf1/icons/items/weapons/elven-curve-blade.PNG"

                        // check for noStr-Flag
                        if (!sbcConfig.options.flags.noStr) {
                            
                            m_ActionData.attackAbilityModifier = +sbcUtils.getModifier(sbcData.notes.statistics.str)

                            // set abilityTypes
                            m_ActionData.attackAbilityType = "str"
                            m_ActionData.damageAbilityType = "str"
                            m_ActionData.attackRangeUnits = "melee"
                        }

                        // Check for WeaponFinesse-Flag
                        if (sbcConfig.options.flags.hasWeaponFinesse) {

                            m_ActionData.attackAbilityModifier = +sbcUtils.getModifier(sbcData.notes.statistics.dex)

                            // set abilityTypes
                            m_ActionData.attackAbilityType = "dex"
                            m_ActionData.damageAbilityType = "str"
                            m_ActionData.attackRangeUnits = "melee"

                        }
                    }
                    
                    // Handle ranged attacks
                    if (type === "rwak") {

                        m_AttackData.img = "systems/pf1/icons/items/weapons/thorn-bow.PNG"

                        // check for noDex-Flag
                        if (!sbcConfig.options.flags.noDex) {

                            m_ActionData.attackAbilityModifier = +sbcUtils.getModifier(sbcData.notes.statistics.dex)

                            // set abilityTypes
                            m_ActionData.attackAbilityType = "dex"
                            m_ActionData.damageAbilityType = "str"

                            // Check if its a normal bow or a crossbow, because these don't use "str" as the damage ability type
                            if (m_InputAttack.search(/(bow\b)/i) !== -1 && m_InputAttack.search(/(\bcomposite\b)/i) === -1) {
                                m_ActionData.damageAbilityType = ""
                            }

                            m_ActionData.attackRangeUnits = "ft"
                            m_ActionData.attackRangeIncrement = "5" // WIP: Should this really be 5?
                        } 

                    }

                    // Handle natural attacks
                    let naturalAttacksKeys = Object.keys(sbcContent.naturalAttacks)
                    let naturalAttacksPattern = new RegExp("(" + naturalAttacksKeys.join("s*\\b|\\b") + ")", "i")
                    
                    if (naturalAttacksPattern.test(m_AttackData.attackName)) {
                    
                        let tempNaturalAttackName = m_AttackData.attackName.match(naturalAttacksPattern)[1];
                        let tempNaturalAttack = sbcContent.naturalAttacks[tempNaturalAttackName.replace(/s$/,"").toLowerCase()];
                        
                        m_AttackData.attackType = "natural"
                        m_AttackData.isPrimaryAttack = tempNaturalAttack.isPrimaryAttack
                        m_AttackData.img = tempNaturalAttack.img
                    }

                    // Handle swarm attacks, as these are neither melee nor ranged
                    if (m_AttackData.attackName.search(/\bSwarm\b/i) !== -1) {
                        type = "other"
                    }
                                
                    // Handle multiple attacks of the same type
                    // Note: These are not iterative attacks!
                    if (m_InputAttack.match(/(^\d+)/) !== null) {
                        m_ActionData.numberOfAttacks = m_InputAttack.match(/(^\d+)/)[1];
                        m_AttackData.attackNotes = m_ActionData.numberOfAttacks + " " + m_AttackData.attackNotes
                    }

                    // enhancementBonus
                    if (m_InputAttack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/) !== null) {
                        m_AttackData.enhancementBonus = m_InputAttack.match(/(?:[^\w]\+|^\+)(\d+)(?:\s\w)/)[1];
                        m_AttackData.attackNotes = "+" + m_AttackData.enhancementBonus + " " + m_AttackData.attackNotes
                    }

                    // Masterwork
                    if (m_InputAttack.match(/\bmwk\b/i) !== null) {
                        m_AttackData.isMasterwork = true
                        m_AttackData.attackNotes = "mwk " + m_AttackData.attackNotes
                    }

                    // Set the formattedAttackName to use later
                    m_AttackData.formattedAttackName = m_AttackData.attackNotes
                    
                    // attackModifier
                    if (m_InputAttack.match(/(\+\d+|-\d+)(?:[+0-9/ ]*\(*)/) !== null) {

                        // Prefer matches that are not at the start and are followed by a parenthesis
                        if (m_InputAttack.match(/(?!^)(\+\d+|-\d+)(?:[+0-9/ ]*\(+)/) !== null) {
                            m_ActionData.inputAttackModifier = m_InputAttack.match(/(?!^)(\+\d+|-\d+)(?:[+0-9/ ]*\(+)/)[1]
                        } else if (m_InputAttack.match(/(?!^)(\+\d+|-\d+)(?:[+0-9/ ]*)/) !== null) {
                            // Otherwise try to get just an attackModifier, e.g. for attacks without damage
                            m_ActionData.inputAttackModifier = m_InputAttack.match(/(?!^)(\+\d+|-\d+)(?:[+0-9/ ]*)/)[1]
                        } else {
                            // If nothing is found, fail gracefully
                            let errorMessage = "Failed to find a useable attack modifier"
                            let error = new sbcError(1, "Parse/Offense", errorMessage, line)
                            sbcData.errors.push(error)
                        }
                        
                        m_AttackData.attackNotes += m_ActionData.inputAttackModifier                        
                    }
                        
                    // numberOfIterativeAttacks, when given in the statblock in the form of
                    if (m_InputAttack.match(/(\/\+\d+)/) !== null) {
                        m_ActionData.numberOfIterativeAttacks = m_InputAttack.match(/(\/\+\d+)/g).length
                        for (let i = m_ActionData.numberOfIterativeAttacks; i>=1; i--) {
                            m_AttackData.attackNotes += "/+" + (m_ActionData.inputAttackModifier-(m_ActionData.inputAttackModifier-(5*i)))
                        }
                    }
                    
                    // [4.B] Parse damage and effect related data, e.g. number and type of damage dice
                    //       This is mainly everything in parenthesis in any given attack
                        
                    // If the attack has damage dice
                    if (m_InputAttack.match(/\d+d\d+/) !== null) {

                        // NumberOfDamageDice and DamageDie
                        if (m_InputAttack.match(/\d+d\d+/) !== null) {
                            m_ActionData.numberOfDamageDice = m_InputAttack.match(/(\d+)d(\d+)/)[1]
                            m_ActionData.damageDie = m_InputAttack.match(/(\d+)d(\d+)/)[2]
                            m_AttackData.attackNotes += " (" + m_ActionData.numberOfDamageDice + "d" + m_ActionData.damageDie
                        }
                        // damageBonus
                        if (m_InputAttack.match(/(?:d\d+)(\+\d+|\-\d+)/) !== null) {
                            m_ActionData.damageBonus = m_InputAttack.match(/(?:d\d+)(\+\d+|\-\d+)/)[1]
                            m_AttackData.attackNotes += m_ActionData.damageBonus
                        }
                        // critRange
                        if (m_InputAttack.match(/(?:\/)(\d+)(?:-\d+)/) !== null) {
                            m_ActionData.critRange = m_InputAttack.match(/(?:\/)(\d+)(?:-\d+)/)[1]
                            m_AttackData.attackNotes += "/" + m_ActionData.critRange + "-20"
                        }
                        // critMult
                        if (m_InputAttack.match(/(?:\/x)(\d+)/) !== null) {
                            m_ActionData.critMult = m_InputAttack.match(/(?:\/x)(\d+)/)[1]
                            m_AttackData.attackNotes += "/x" + m_ActionData.critMult
                        }

                        // effectNotes
                        if (m_InputAttack.match(/(?:\(\d+d\d+[\+\d\/\-x\s]*)([^\)\n]*)(?:$|\))/) !== null) {
                            let specialEffects = m_InputAttack.match(/(?:\(\d+d\d+[\+\d\/\-x\s]*)([^\)\n]*)(?:$|\))/)[1]
                                                .replace(/(\s+\band\b\s+|\s*\bplus\b\s+)/gi, ",")
                                                .replace(/(^,|,$)/g,"")
                                                .split(",")

                            if (specialEffects.length > 0) {
                                for (let e=0; e<specialEffects.length; e++) {
                                    let specialEffect = specialEffects[e]
                                    if (specialEffect !== "")
                                        m_AttackData.effectNotes.push(specialEffect)
                                }
                                
                                m_AttackData.attackNotes += " plus " + m_AttackData.effectNotes.join(", ")
                            }
                            
                        }

                        // add the closing parenthesis to the attack notes
                        m_AttackData.attackNotes += ")"

                    } else if (m_InputAttack.match(/\(([^)]*)\)/) !== null){
                        // If there is just a specialEffect in parenthesis
                        let specialEffect = m_InputAttack.replace(/\s+/g, " ").match(/\(([^)]*)\)/)[1]
                        m_AttackData.attackNotes += " (" + specialEffect + ")"
                        m_AttackData.effectNotes.push(specialEffect)
                    } else {
                        // If there are neither damage dice nor special effects in parenthesis
                        sbcConfig.options.debug && sbcUtils.log("Kind of embarrasing, but this should never happen.")
                    }

                    // Calculate Attack and, if needed, compensate for differences between input attackModifier and system-derived attackModifier
                    let calculatedAttackModifier = 
                          +sbcData.characterData.actorData.system.attributes.bab.total
                        + +CONFIG["PF1"].sizeMods[sbcData.characterData.actorData.system.traits.size]
                        + +m_ActionData.attackAbilityModifier
                    
                    if (m_AttackData.isMasterwork || m_AttackData.enhancementBonus > 0)
                        calculatedAttackModifier += 1

                    if (!m_AttackData.isPrimaryAttack)
                        calculatedAttackModifier -= 5
                    
                    if (+calculatedAttackModifier !== +m_ActionData.inputAttackModifier) {
                        m_ActionData.calculatedAttackBonus = +m_ActionData.inputAttackModifier - +calculatedAttackModifier
                    }
                    
                    // Calculate Damage and, if needed, compensate for differences between input damageModifier and system-derived damageModifier
                    let strDamageBonus = 0 
                    if (m_ActionData.damageAbilityType === "str") {
                        // Use the value given in the statblock instead of the one currently in the actor
                        strDamageBonus = +sbcUtils.getModifier(sbcData.notes.statistics.str)
                    }

                    let calculatedDamageBonus = (m_AttackData.isPrimaryAttack) ? +strDamageBonus + +m_AttackData.enhancementBonus : +strDamageBonus + +m_AttackData.enhancementBonus - 5
                    m_ActionData.damageModifier = +m_ActionData.damageBonus - +calculatedDamageBonus 

                    // Create the string needed for the damagePart
                    let damageDiceString =
                            m_ActionData.numberOfDamageDice
                        +   "d"
                        +   m_ActionData.damageDie

                    // ... and if there is a difference between the statblock and the calculation, add an adjustment modifier
                    if (m_ActionData.damageModifier !== 0)
                        damageDiceString += "+" + m_ActionData.damageModifier + "[adjusted by sbc]";

                    // Try to find the defaultDamageType by checking if the attackName can be found in sbcContent.attackDamageTypes
                    // This is done to find common damage types of attacks and weapons
                    // e.g. bite is piercing, bludgeoning and slashing
                    let attackDamageTypeKeys = Object.keys(sbcContent.attackDamageTypes)
                    if (m_AttackData.attackName !== "") {
                        let damageTypePattern = new RegExp("(^\\b" + m_AttackData.attackName.replace(/(\bmwk\b|s$)/ig,"").trim() + "\\b$)", "ig");
                        let damageTypeFound = false

                        for (let x=0; x < attackDamageTypeKeys.length; x++) {
                            let attackDamageTypeKey = attackDamageTypeKeys[x]
                            let attackDamageType = sbcContent.attackDamageTypes[attackDamageTypeKey]
                            if (attackDamageTypeKey.toLowerCase().search(damageTypePattern) !== -1) {

                                damageTypeFound = true
                                
                                // Split the found damage types
                                // If they are separated via "," or "and" they are valid for the whole action
                                // If they are separated via "or" we need a separate action
                                let m_TempDamageTypeGroups = attackDamageType.type.split("or")

                                for (let y=0; y<m_TempDamageTypeGroups.length; y++) {
                                    let m_TempDamageTypeGroup = m_TempDamageTypeGroups[y].trim()
                                    let m_TempDamageTypes = m_TempDamageTypeGroup.split(/,|and/g)

                                    for (let z=0; z<m_TempDamageTypes.length; z++) {
                                        let m_TempDamageType = m_TempDamageTypes[z].trim()
                                        let m_DamageType = sbcConfig.damageTypes[m_TempDamageType.toLowerCase()]
                                        m_ActionData.damageTypes.push(m_DamageType)

                                    }
                                }

                                // If the Weapon has Range Increment and it is used for a ranged attack
                                // Set the range increment accordingly
                                if (attackDamageType.rangeIncrement && type === "rwak") {
                                    m_ActionData.attackRangeIncrement = attackDamageType.rangeIncrement
                                }
                                
                                // If the weapon has special properties, add that to the attackNotes
                                m_ActionData.weaponSpecial = attackDamageType.special

                                if (m_ActionData.weaponSpecial !== "-") {
                                    m_AttackData.attackNotes += "," + m_ActionData.weaponSpecial
                                }
                            }
                        }

                        if (!damageTypeFound)
                            m_ActionData.damageTypes.push("untyped")
                    }

                    // Check for specialDamageTypes
                    // Check, if the attackEffect denotes a valid damageType for the base damage,
                    // and use this to override the default damage type

                    for (let k = 0; k<m_AttackData.effectNotes.length; k++) {
                        let attackEffect = m_AttackData.effectNotes[k]

                        let systemSupportedDamageTypes = Object.values(CONFIG["PF1"].damageTypes).map(x => x.toLowerCase())
                        let patternDamageTypes = new RegExp("(" + systemSupportedDamageTypes.join("\\b|\\b") + ")", "gi")

                        // If the attackEffect has no additional damagePools XdY ...
                        if (attackEffect.match(/\d+d\d+/) === null) {


                            // ... and it matches any of the supported damageTypes ...
                            if (attackEffect.search(patternDamageTypes) !== -1) {


                                specialDamageType = attackEffect.match(patternDamageTypes)[0].trim()

                                // Remove the found attackEffect from the effectNotes array
                                m_AttackData.effectNotes.splice(k,1)
                                hasSpecialDamageType = true
                            }

                        } else {

                            // ... if the attackEffect has damagePools, create a new damageEntry for the attack

                            let attackEffectDamage = attackEffect.match(/(\d+d\d+\+*\d*)/)[0]
                            

                            // Check if there is something left after removing the damage
                            let attackEffectDamageType = attackEffect.replace(attackEffectDamage, "").trim()
                            let attackEffectCustomDamageType = ""

                            if (attackEffectDamageType !== "") {
                                if (attackEffect.search(patternDamageTypes) !== -1) {
                                    attackEffectDamageType = attackEffect.match(patternDamageTypes)[0].trim()
                                } else {
                                    attackEffectCustomDamageType = attackEffectDamageType
                                }
                            } else {
                                attackEffectDamageType = "untyped"
                            }

                            // Push the damage values to the action
                            m_ActionData.nonCritParts.push([
                                attackEffectDamage,
                                {
                                    "values": [attackEffectDamageType],
                                    "custom": attackEffectCustomDamageType
                                }
                            ])
                            
                            // Remove the found attackEffect from the effectNotes array
                            m_AttackData.effectNotes.splice(k,1)

                        }
                        
                    }

                    // ... then push the damagePart
                    m_ActionData.damageParts.push([
                        damageDiceString,
                        {
                            "values": m_ActionData.damageTypes,
                            "custom": m_ActionData.customDamageTypes
                        }
                    ])

                    // Push extra attacks from numberOfAttacks
                    for (let i=1; i<m_ActionData.numberOfAttacks; i++) {
                        let prefixAttackName = i+1 + sbcConfig.const.suffixMultiples[i]
                        m_ActionData.attackParts.push(
                            [
                                "",
                                prefixAttackName + " " + sbcUtils.capitalize(m_AttackData.attackName.replace(/s$/, ""))
                            ]
                        )
                    }

                    // Push extra attacks from numberOfIterativeAttacks
                    // WIP: This does not register or handle statblocks with errors in the iterations
                    if (m_ActionData.numberOfIterativeAttacks > 0) {
                        m_ActionData.formulaicAttacksCountFormula = "ceil(@attributes.bab.total/5)-1"
                    }
                    
                    
                    /*
                    console.log("m_AttackData:")
                    console.log(m_AttackData)

                    console.log("m_ActionData:")
                    console.log(m_ActionData)
                    */

                    // [5] Create an attack from m_AttackData

                    let m_NewAttack = await Item.create({
                        "_id": randomID(16),
                        "name": sbcUtils.capitalize(m_AttackData.formattedAttackName) || "undefined",
                        "type": "attack",
                        "img": m_AttackData.img,
                        "data": {
                            "description": {
                                "value": "",
                                "chat": "",
                                "unidentified": ""
                            },
                            "tags": [],
                            "actions": [],
                            "uses": {
                                "per": "",
                                "value": 0,
                                "maxFormula": ""
                            },
                            "attackNotes": sbcUtils.sbcSplit(m_AttackData.attackNotes),
                            "effectNotes": m_AttackData.effectNotes,
                            "links": {
                                "children": [],
                                "charges": []
                            },
                            "tag": "",
                            "useCustomTag": false,
                            "flags": {
                                "boolean": {},
                                "dictionary": {}
                            },
                            "scriptCalls": [],
                            "masterwork": (m_AttackData.isMasterwork || m_AttackData.enhancementBonus !== 0) ? true : false,
                            "enh": m_AttackData.enhancementBonus,
                            "proficient": true,
                            "isPrimaryAttack": m_AttackData.isPrimaryAttack,
                            "held": "normal",
                            "showInQuickbar": true,
                            "broken": false,
                            "ammoType": "",
                            "attackType": m_AttackData.attackType,
                            "identifiedName": sbcUtils.capitalize(m_AttackData.formattedAttackName) || "undefined"
                        },
                        "effects": [],
                        "folder": null,
                        "sort": 0,
                        "permission": {
                            "default": 0,
                        },
                        "flags": {}


                    }, { temporary: true });

                    m_NewAttack.prepareData()
                    

                    // [6] Create an action from m_ActionData
                    //     which in turn needs to be pushed to the in [5] created attack

                    let m_NewAction = {
                        "_id": randomID(16),
                        "name": sbcUtils.capitalize(m_AttackData.attackName),
                        "img": m_AttackData.img,
                        "description": "",
                        "activation": {
                            "cost": 1,
                            "type": "standard"
                        },
                        "unchainedAction": {
                            "activation": {
                                "cost": 1,
                                "type": ""
                            }
                        },
                        "duration": {
                            "value": null,
                            "units": ""
                        },
                        "target": {
                            "value": ""
                        },
                        "range": {
                            "value": m_ActionData.attackRangeIncrement,
                            "units": m_ActionData.attackRangeUnits,
                            "maxIncrements": 1,
                            "minValue": null,
                            "minUnits": ""
                        },
                        "uses": {
                            "autoDeductCharges": true,
                            "autoDeductChargesCost": "1"
                        },
                        "measureTemplate": {
                            "type": "",
                            "size": "",
                            "overrideColor": false,
                            "customColor": "",
                            "overrideTexture": false,
                            "customTexture": ""
                        },
                        "attackName": sbcUtils.capitalize(m_AttackData.attackName.replace(/s$/, "")),
                        "actionType": type,
                        "attackBonus": m_ActionData.calculatedAttackBonus.toString() + "[adjusted by sbc]",
                        "critConfirmBonus": "",
                        "damage": {
                            "critParts": [],
                            "nonCritParts": m_ActionData.nonCritParts,
                            "parts": m_ActionData.damageParts
                        },
                        "formulaicAttacks": {
                            "count": {
                                "formula": m_ActionData.formulaicAttacksCountFormula
                            },
                            "bonus": {
                                "formula": "@formulaicAttack*-5"
                            },
                            "label": ""
                        },
                        "formula": "",
                        "ability": {
                            "attack": m_ActionData.attackAbilityType,
                            "damage": m_ActionData.damageAbilityType,
                            "damageMult": m_ActionData.damageMult,
                            "critRange": m_ActionData.critRange,
                            "critMult": m_ActionData.critMult
                        },
                        "save": {
                            "dc": "",
                            "type": "",
                            "description": ""
                        },
                        "effectNotes": [],
                        "attackNotes": [],
                        "soundEffect": "",
                        "powerAttack": {
                            "multiplier": "",
                            "damageBonus": 2,
                            "critMultiplier": 1
                        },
                        "naturalAttack": {
                            "secondary": {
                                "attackBonus": "-5",
                                "damageMult": 0.5
                            }
                        },
                        "nonlethal": false,
                        "usesAmmo": false,
                        "spellEffect": "",
                        "spellArea": "",
                        "enh": {
                          "override": false,
                          "value": 0
                        },
                        "conditionals": [],
                        "attackParts": m_ActionData.attackParts
                    }

                    // [7] Create the final document
                    //     and push it onto the stack of embeddedDocuments (e.g. items)
                    //     that get created in batch later

                    // Push the action into the array of FullAttackActions
                    m_FullAttackActions.push(m_NewAction)

                    // Push it into this attack as well
                    m_NewAttack.updateSource({"system.actions": [ m_NewAction ] })
                    m_NewAttack.prepareData()

                    // And lastly add the attack to the item stack
                    sbcData.characterData.items.push(m_NewAttack)
                    
                }

                // WIP: Maybe create a "FullAttack Action"
                //console.log("m_FullAttackActions")
                //console.log(m_FullAttackActions)

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
                    name: "Special Attack: " + specialAttacks[i],
                    type: type,
                    desc: "sbc | Placeholder for Special Attacks, which in most statblocks are listed under 'Special Attacks' in the statistics block, but are described in the 'Special Abilities' block. Remove duplicates as needed!"
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
        let isAlchemist = value.isAlchemist

        // Save Data needed for validation
        // and put it into the notes sections as well
        sbcData.characterData.conversionValidation.spellBooks[spellBookType] = {
            casterLevel: +casterLevel,
            concentrationBonus: +concentrationBonus
        }
        
        // Set the spellBook data
        let altNameSuffix = spellCastingType == "prepared" ? "Prepared" : "Knonwn"
        if (spellCastingType == "points") altNameSuffix = "Psychic"

            // WIP: Check for special cases Arcanist and Red Mantis Assassin
            /*
             Arcanist: spellPreparationMode = "hybrid"
             Red Mantis Assassin: spellPreparationMode = "prestige"
            */

        let spellsOrExtracts = "Spells"
        let arcaneSpellFailure = true
        let castingClass = ""
        let altName = ""

        if (isAlchemist) {
            spellsOrExtracts = "Extracts"
        }
 
        if (spellBookType == "spelllike") {
            altName = "Spell-like Abilities";
            arcaneSpellFailure = false;
        } else if (spellCastingType == "points") {
           altName = "Psychic Magic";
            arcaneSpellFailure = false;
            spellCastingType = "spontaneous";
        } else {
            castingClass = spellCastingClass.toLowerCase();
            altName = sbcUtils.capitalize(spellCastingClass) + " " + spellsOrExtracts + " " + altNameSuffix;
        }

        sbcData.characterData.actorData.updateSource({
            data: {
                attributes: {
                    spells: {
                        spellbooks: {
                            [spellBookType]: {
                                inUse: true,
                                altName,
                                class: castingClass,
                                clNotes: "sbc | Total in statblock was CL " + casterLevel + ", adjust as needed.",
                                concentrationNotes: "sbc | Total in statblock was +" + concentrationBonus + ", adjust as needed.",
                                arcaneSpellFailure,
                                domainSlotValue: 0,
                                autoSpellLevelCalculation: false,
                                autoSpellLevels: false,
                                spontaneous: spellCastingType !== "prepared",
                                spellPreparationMode: spellCastingType == "prepared" ? "prepared" : "spontaneous"
                            }
                        }
                    }
                }
            }
        })

        try {
            // Psychic
            if (spellCastingType == "points") {
                sbcData.characterData.actorData.updateSource({
                    data: {
                        attributes: {
                            spells: {
                                spellbooks: {
                                    [spellBookType]: {
                                        spontaneous: false,
                                        spellPreparationMode: "spontaneous",
                                        spellPoints: {
                                            useSystem: true,
                                            maxFormula: "0",
                                            max: 0,
                                        },
                                        ability: sbcData.characterData.actorData.system.data.abilities.int.total >= sbcData.characterData.actorData.system.data.abilities.cha.total ? "int" : "cha",
                                    }
                                }
                            }
                        }
                    }
                })
            }

            /* Parse the spell rows
             * line by line
             */

            for (let i=0; i<spellRows.length; i++) {
                let spellRow = spellRows[i]

                let spellLevel = -1
                let spellsPerX = ""
                let spellsPerXTotal = -1
                let isAtWill = false
                let isConstant = false
                let isCantrip = false
                let isSpellRow = false

                // Get spellLevel, spellsPerX and spellsPerXTotal
                switch (spellCastingType) {
                    case "prepared":
                        if (spellRow.match(/(^\d)/) !== null) {
                            spellLevel = spellRow.match(/(^\d)/)[1];
                            isSpellRow = true;
                        }
                        break
                    case "spontaneous":
                        if (/^(\d+)\s*\bPE\b/.test(spellRow)) {
                            let PE = spellRow.match(/^(\d+)\s*\bPE\b/)[1];
                            sbcData.characterData.actorData.updateSource({
                                data: {
                                    attributes: {
                                        spells: {
                                            spellbooks: {
                                                [spellBookType]: {
                                                    spellPoints: {
                                                        maxFormula: PE,
                                                        value: +PE,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            })
                            isSpellRow = true;
                        }
                        else if (/^(\d+)(?!\/(?:day|week|month|year))/.test(spellRow)) {
                            spellLevel = spellRow.match(/^(\d+)(?!\/(?:day|week|month|year))/)[1];
                            isSpellRow = true;
                        }
                        else if (/(\d+)(?:\/(?:day|week|month|year))/.test(spellRow)) {
                            spellsPerXTotal = spellRow.match(/(\d+)(?:\/(?:day|week|month|year))/)[1];
                            isSpellRow = true;
                        }
                        else if (/\/([a-zA-Z]*)\)*\-/.test(spellRow)) {
                            spellsPerX = spellRow.match(/(?:\d+)\/([a-zA-Z]*)\)*\-/)[1];
                        }
                        break;
                    default:
                        break;
                }

                // Check for "at will" and "constant"
                if (/(Constant)/i.test(spellRow)) {
                    isConstant = true;
                    isSpellRow = true;
                }

                if (/(At will)/i.test(spellRow)) {
                    isAtWill = true;
                    isSpellRow = true;
                }

                if (isSpellRow) {
                        
                    let spells = sbcUtils.sbcSplit(spellRow.replace(/(^[^\-]*\-)/, ""))

                    let spellRowIsInitialized = false

                    // Loop through the spells
                    for (let j=0; j<spells.length; j++) {

                        let spell = spells[j].trim()
                        let spellName = sbcUtils.parseSubtext(spell)[0].trim()
                        let isDomainSpell = false

                        // Check, if the spell is a domain spell
                        if (spellName.match(/[D]$/) !== null) {

                            isDomainSpell = true
                            // Remove Domain Notation at the end of spellNames
                            spellName = spellName.replace(/[D]$/, "")
                        }
                        
                        let spellDC = -1

                        if (spell.search(/\bDC\b/) !== -1) {
                            spellDC = spell.match(/(?:DC\s*)(\d+)/)[1]
                        }
                        
                        let spellPE = -1;
                        if (/\bPE\b/.test(spell)) {
                            spellPE = spell.match(/(\d+)\s*(?:PE)/)[1];
                        }

                        if (spellName !== "") {

                            let searchEntity = {
                                name: spellName,
                                type: "spell"
                            }

                            let compendium = "pf1.spells"
            
                            // If the input is found in one of the compendiums, generate an entity from that
                            let entity = await sbcUtils.findEntityInCompendium(compendium, searchEntity)

                            // otherwise overwrite "entity" with a placeholder
                            if (entity === null) {
                                entity = await sbcUtils.generatePlaceholderEntity(searchEntity, line)
                            }

                            // Edit the entity to match the data given in the statblock
                            entity.updateSource({"spellbook": spellBookType})

                            // Set the spellLevel
                            if (spellLevel !== -1) {
                                entity.updateSource({"level": +spellLevel})
                            }

                            // Set the spellDC
                            // This is the offset for the dc, not the total!

                            let spellDCOffset = 0
                            // Calculate the DC in the Actor
                            let spellCastingAbility = sbcData.characterData.actorData.system.data.attributes.spells.spellbooks[spellBookType].ability
                            let spellCastingAbilityModifier = sbcData.characterData.actorData.system.data.abilities[spellCastingAbility].mod
                            let spellDCInActor = 10 + +entity.data.data.level + +spellCastingAbilityModifier

                            spellDCOffset =  +spellDC - +spellDCInActor


                            if (spellDC !== -1) {
                                entity.updateSource({"save.dc": spellDCOffset.toString()})
                            }
                            
                            // Set the spellPE
                            if (spellPE !== -1) {
                                entity.updateSource({"spellPoints.cost": "" + spellPE});
                            }

                            // Set the spells uses / preparation
                            // where SLAs can be cast a number of times per X per sla
                            // and spontaneous spells of a given spellLevel can be cast a total of X times per day
                            //

                            // Initialize some values for the row
                            if (!spellRowIsInitialized) {
                                sbcData.characterData.actorData.updateSource({
                                    [`system.attributes.spells.spellbooks.${spellBookType}.spells.spell${entity.data.data.level}.base`]: 0
                                })
                                spellRowIsInitialized = true
                            }
                            

                            // Do not count Constant and At Will spells towards spell slot totals
                            if (!isAtWill && !isConstant && !isCantrip) {
                                
                                let spellsBase, spellsMax;
                                
                                // Spell-Like Abilities can be cast a number of times per day each
                                if (spellsPerXTotal !== -1 && spellBookType === "spelllike") {

                                    entity.updateSource({
                                        data: {
                                            uses: {
                                                max: +spellsPerXTotal,
                                                value: +spellsPerXTotal,
                                                per: spellsPerX
                                            },
                                            preparation: {
                                                maxAmount: +spellsPerXTotal,
                                                preparedAmount: +spellsPerXTotal
                                            }
                                        }
                                    })
                
                                    // Change the spellbook for SLAs to prepared as long as the sheet does not support them correctly
                                    sbcData.characterData.actorData.updateSource({ [`data.attributes.spells.spellbooks.${spellBookType}.spontaneous`]: false})
            
                                    spellsBase = +spellsPerXTotal
                                    spellsMax = +spellsPerXTotal
                                }
            
                                // Spells Known can be cast a number of times per day in total for the given spellRow
                                if (spellsPerXTotal !== -1 && spellCastingType === "spontaneous" && spellBookType !== "spelllike") {
                                    spellsBase = +spellsPerXTotal
                                    spellsMax = +spellsPerXTotal
                                }
            
                                // Spells Prepared can be cast a according to how often they are prepared
                                if (spellCastingType === "prepared") {

                                    // WIP: BUILD A CHECK FOR MULTIPLE PREPARATIONS OF THE SAME SPELL
            
                                    entity.updateSource({
                                        data: {
                                            preparation: {
                                                maxAmount: 1,
                                                preparedAmount: 1
                                            }
                                        }
                                    })
            
                                    spellsBase = sbcData.characterData.actorData.system.attributes.spells.spellbooks[spellBookType].spells["spell" + entity.data.data.level].base++;
                                    spellsMax = sbcData.characterData.actorData.system.attributes.spells.spellbooks[spellBookType].spells["spell" + entity.data.data.level].max++;
                                }
                        
                                if (spellsBase !== undefined) sbcData.characterData.actorData.updateSource({ [`attributes.spells.spellbooks.${spellBookType}.spells.spell${entity.data.data.level}.base`]: spellsBase})
                                if (spellsMax !== undefined) sbcData.characterData.actorData.updateSource({ [`attributes.spells.spellbooks.${spellBookType}.spells.spell${entity.data.data.level}.max`]: spellsMax})
                            }
                            
                            // Set At Will for spells marked as "at will" and for cantrips
                            if (isAtWill || entity.data.data.level === 0) {
                                entity.updateSource({ "atWill": true })
                            }

                            // Change SpellName to reflect constant spells
                            if (isConstant) {
                                entity.updateSource({
                                    name: "Constant: " + entity.data.name,
                                    data: {
                                        atWill: true
                                    }
                                })
                            }

                            // Set data for domain spells
                            if (isDomainSpell) {

                                entity.updateSource({
                                    data: {
                                        domain: true,
                                        slotClost: 1,
                                    }
                                })

                                let old = sbcData.characterData.actorData.system.data.attributes.spells.spellbooks[spellBookType].spells["spell" + spellLevel]
                                sbcData.characterData.actorData.updateSource({
                                    [`system.attributes.spells.spellbooks.${spellBookType}.spells.spell${spellLevel}`]: {
                                        base: old.base - 1,
                                        max: old.max - 1,
                                    }
                                })
                            }

                            sbcData.characterData.items.push(entity)
                        }

                    }
                } else {

                    // Search for Domains, Mysteries, etc
                    if (spellRow.match(/(?:Domains\s)(.*$)/i) !== null) {
                        sbcData.characterData.actorData.updateSource({ [`system.attributes.spells.spellbooks.${spellBookType}.domainSlotValue`]: 1 })

                        let domainNames = spellRow.match(/(?:Domains\s)(.*$)/i)[1]

                        // Create Class Feature for the Domain
                        let domains = {
                            name: "Domains: " + domainNames,
                            type: "domains",
                        }
                        let placeholder = await sbcUtils.generatePlaceholderEntity(domains, line)
                        sbcData.characterData.items.push(placeholder)

                    }

                    if (spellRow.match(/(?:Mystery\s)(.*$)/i) !== null) {

                        let domainNames = spellRow.match(/(?:Mystery\s)(.*$)/i)[1]

                        // Create Class Feature for the Domain
                        let mysteries = {
                            name: "Mysteries: " + domainNames,
                            type: "mysteries",
                        }
                        let placeholder = await sbcUtils.generatePlaceholderEntity(mysteries, line)
                        sbcData.characterData.items.push(placeholder)

                    }


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
                if (/(?:(Str|Dex|Con|Int|Wis|Cha)\s*(\d+|-))/i.test(lineContent)) {
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
                            if (currentItem.system.changes) {
                                let currentItemChanges = currentItem.system.changes

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
                if (/^Base Atk\b/i.test(lineContent)) {
                    let parserBab = sbcMapping.map.statistics.bab
                    let bab = lineContent.match(/(?:Base Atk\b\s*)([\+\-]?\d+)/ig)[0].replace(/Base Atk\b\s*/i,"")
                    //sbcData.characterData.conversionValidation.attributes["bab"] = +bab
                    parsedSubCategories["bab"] = await parserBab.parse(+bab, startLine + line)
                }
            }

            // Parse CMB
            if (!parsedSubCategories["cmb"]) {
                if (/\bCMB\b/i.test(lineContent)) {
                    let parserCmb = sbcMapping.map.statistics.cmb
                    let cmbRaw = lineContent.match(/(?:CMB\b)(.*)(?=\bCMD)/i)[1].trim()

                    let cmb = cmbRaw.match(/([+-]?\d+)/)?.[0] ?? 0;

                    let cmbContext = sbcUtils.parseSubtext(cmbRaw)[1]

                    sbcData.characterData.conversionValidation.attributes["cmb"] = +cmb
                    if (cmbContext) sbcData.characterData.conversionValidation.context["cmb"] = cmbContext

                    parsedSubCategories["cmb"] = await parserCmb.parse(+cmb, startLine + line)
                }
            }

            // Parse CMD
            if (!parsedSubCategories["cmd"]) {
                if (/\bCMD\b/i.test(lineContent)) {
                    let parserCmd = sbcMapping.map.statistics.cmd
                    let cmdRaw = lineContent.match(/(?:CMD\b)(.*)/i)[1].trim()

                    // Check if CMD is "-"
                    let cmd = cmdRaw.match(/(\d+)/)?.[0] ?? 0;

                    let cmdContext = sbcUtils.parseSubtext(cmdRaw)[1]

                    sbcData.characterData.actorData.updateSource({"attributes.cmdNotes": cmdContext})

                    sbcData.characterData.conversionValidation.attributes["cmd"] = +cmd
                    //if (cmdContext) sbcData.characterData.conversionValidation.context["cmd"] = cmdContext
                    parsedSubCategories["cmd"] = await parserCmd.parse(+cmd, startLine + line)
                }
            }

            // Parse Feats
            if (!parsedSubCategories["feats"]) {
                if (/^Feats\b/i.test(lineContent)) {
                    let parserFeats = sbcMapping.map.statistics.feats
                    let feats = lineContent.match(/(?:Feats\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.feats = feats
                    parsedSubCategories["feats"] = await parserFeats.parse(feats, startLine + line, "feats")
                }
            }

            // Parse Skills
            if (!parsedSubCategories["skills"]) {
                if (/^Skills\b/i.test(lineContent)) {
                    let parserSkills = sbcMapping.map.statistics.skills
                    let skills = lineContent.match(/(?:Skills\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.skills = skills
                    parsedSubCategories["skills"] = await parserSkills.parse(skills, startLine + line)
                }
            }

            // Parse Languages
            if (!parsedSubCategories["languages"]) {
                if (/^Languages\b/i.test(lineContent)) {
                    let parserLanguages = sbcMapping.map.statistics.languages
                    let languages = lineContent.match(/(?:Languages\b\s*)(.*)/i)[1].replace(/\s*[,;]+/g,",").trim()
                    sbcData.notes.statistics.languages = languages
                    parsedSubCategories["languages"] = await parserLanguages.parse(languages, startLine + line)
                }
            }

            // Parse SQ
            if (!parsedSubCategories["sq"]) {
                if (/^SQ\b/i.test(lineContent)) {
                    let parserSQ = sbcMapping.map.statistics.sq
                    let sqs = lineContent.match(/(?:SQ\b\s*)(.*)/i)[1].replace(/\s*[,;]+\s*/g,",").trim()
                    parsedSubCategories["sq"] = await parserSQ.parse(sqs, startLine + line)
                }
            }

            // Parse Gear
            //if (!parsedSubCategories["gear"]) {
                if (/(Combat Gear|Other Gear|Gear)\b/i.test(lineContent)) {
                    let parserGear = sbcMapping.map.statistics.gear
                    // Combat Gear, Other Gear, Gear
                    let gear = lineContent.replace(/(Combat Gear|Other Gear|Gear)/g, "").replace(/[,;]+/g,",").replace(/[,;]$/, "").trim()

                    if (!sbcData.notes.statistics.gear) {
                        sbcData.notes.statistics.gear = gear
                    } else {
                        sbcData.notes.statistics.gear += gear
                    }
                    
                    parsedSubCategories["gear"] = await parserGear.parse(gear, startLine + line)
                }
            //}

        } catch (err) {
            
            let errorMessage = "Parsing the statistics data failed at the highlighted line"
            let error = new sbcError(1, "Parse/Statistics", errorMessage, (startLine+line) )
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false

            throw err

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
                    await sbcParsing.parseValueToDocPath(sbcData.characterData.actorData, valueField, value)
                }
                for (const modField of this.targetModFields) {
                    await sbcParsing.parseValueToDocPath(sbcData.characterData.actorData, modField, sbcUtils.getModifier(value))
                }
                return true
            } catch (err) {
                let errorMessage = `Failed to parse ${value} into ${this.targetValueFields} (and ${sbcUtils.getModifier(value)} into ${this.targetModFields})`
                let error = new sbcError(0, "Parse", errorMessage, line)
                sbcData.errors.push(error)

                throw err

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
                    let skillKeys = Object.keys(classItem.system.classSkills)

                    // Loop through the skills
                    for (let j=0; j<skillKeys.length; j++) {
                        let currentSkill = skillKeys[j]
                        if (classItem.system.classSkills[currentSkill] === true) {
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
                art: 1,
                crf: 1,
                lor: 1,
                prf: 1,
                pro: 1,
            }

            let alreadyHasSubskills = []

            for (let i=0; i<skills.length; i++) {

                // Replace common Skill shorthands and misswordings
                let rawSkill = skills[i]
                    .replace(/\bEnter Choice\b/igm, "any one")
                    .replace(/Arcane/igm, "Arcana")
                    .replace(/\bPer\./igm, "Perception")
                    .replace(/S\. Motive/igm, "Sense Motive")
                    .replace(/\bLing\./igm, "Linguistics");
                
                if (rawSkill.match(/[+-]\s*\d+(?![^(]*\))/g)?.length > 1) {
                    let missedCommas = rawSkill.split(/(?<=[-+]\d+) /);
                    rawSkill = missedCommas.splice(0, 1)[0];
                    skills.push(...missedCommas);
                }

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
                if (rawSkill.search(/knowledge|perform/i) !== -1 && rawSkill.search(/,|\band\b|&/g) !== -1) {
                    // If there are, generate new skills and push them to the array of skills

                    let tempSkill = sbcUtils.parseSubtext(rawSkill)
                    
                    let skillName = tempSkill[0]
                    let skillModifier = tempSkill[2][0]
                    let skillContext = null
                    if (tempSkill[2][1]) {
                        skillContext = tempSkill[2][1]
                    }

                    let subSkills = tempSkill[1].split(/,|\band\b|&/g)

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

                    for (let j=0; j<knowledgeSubSkills.length; j++) {
                        let knowledgeSubSkill = knowledgeSubSkills[j].trim()
                        let newSkill = skillName + " (" + knowledgeSubSkill + ") " + skillModifier
                        skills.push(newSkill)
                    }

                    continue

                } else {

                    skill = sbcUtils.parseSubtext(rawSkill)

                }

                try {

                    let skillName = skill[0].replace(/[+-]\s*\d+/g, "").trim();
                    let skillTotal = skill[0].replace(skillName, "").replace(/\s/g,"");
                    let subSkill = "";
                    let skillContext = "";

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

                    let size = sbcData.characterData.actorData.system.traits.size
                    let sizeMod = 0

                    // As long as its not a custom skill ...
                    if (skillKey !== "skill") {

                        // Seems the temporary actors does not calculate the mod or if its a classSkill beforehand, so we need to do that manually
                        let skillAbility = sbcData.characterData.actorData.system.skills[skillKey].ability
                        let skillAbilityMod = sbcData.characterData.actorData.system.abilities[skillAbility].mod
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
                            await sbcData.characterData.actorData.updateSource({ [`skills.${skillKey}.rank`]: skillRanks })

                            // Add Data to conversionValidation
                            sbcData.characterData.conversionValidation["skills"][skillKey] = {
                                total: +skillTotal,
                                context: skillContext
                            }

                        } else {
                            // IF ITS A SKILL WITH SUBSKILLS (e.g. Art, Craft, etc.)
                            let subSkillKey = skillKey + (+countOfSubSkills[skillKey])

                            // WIP FIND A WAY TO APPEND INSTEAD OF OVERWRITE THE SUBSKILLS
                            sbcData.characterData.actorData.updateSource(
                                {
                                    [`skills.${skillKey}.subSkills.${subSkillKey}`]: {
                                        ability: sbcData.characterData.actorData.system.data.skills[skillKey].ability,
                                        acp: sbcData.characterData.actorData.system.data.skills[skillKey].acp,
                                        cs: sbcData.characterData.actorData.system.data.skills[skillKey].cs,
                                        name: sbcUtils.capitalize(subSkill),
                                        rank: skillRanks,
                                        rt: sbcData.characterData.actorData.system.data.skills[skillKey].rt
                                    }
                                }
                            )

                            // Add Data to conversionValidation
                            sbcData.characterData.conversionValidation["skills"][subSkillKey] = {
                                name: sbcUtils.capitalize(subSkill),
                                total: +skillTotal,
                                context: skillContext
                            }

                            countOfSubSkills[skillKey]++
                        }

                    } else {
                        // if its a custom skill ...
                        let customSkillKey = "skill"

                        if (countOfCustomSkills > 0) {
                            customSkillKey = "skill" + (+countOfCustomSkills+1)
                        }

                        let defaultAbilityMod = sbcData.characterData.actorData.abilities["int"].mod

                        let skillRanks = +skillTotal - +defaultAbilityMod
                        sbcData.characterData.actorData.updateSource({
                            [`skills.${customSkillKey}`]: {
                                ability: "int",
                                acp: false,
                                background: false,
                                cs: false,
                                custom: true,
                                name: skillName,
                                rank: skillRanks,
                                rt: false
                            }
                        })

                        // Add Data to conversionValidation
                        sbcData.characterData.conversionValidation["skills"][customSkillKey] = {
                            name: skillName,
                            total: +skillTotal,
                            context: skillContext
                        }

                        countOfCustomSkills++
                    }

                } catch (err) {

                    let errorMessage = "Failed to parse " + skill + "."
                    let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
                    sbcData.errors.push(error)
                    throw err
                    return false

                }

            }

            // If all skills were parsed correctly, return true
            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as skills."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
            let languageContext = ""
        
            for (let i=0; i<languages.length; i++) {

                let language = languages[i].trim()
                let checkForLanguageContext = sbcUtils.parseSubtext(language)

                // Check for language context information and add this to the custom language field if available
                if (checkForLanguageContext.length > 1)
                {
                    language = checkForLanguageContext[0]
                    languageContext = checkForLanguageContext[1]

                    sbcData.characterData.actorData.updateSource({ "system.traits.languages.custom": sbcData.characterData.actorData.system.traits.languages.custom + languageContext + ";" })
                }
                    
                if (language.search(patternLanguages) !== -1) {
                    let languageKey = sbcUtils.getKeyByValue(CONFIG["PF1"].languages, language)
                    const languages = [...sbcData.characterData.actorData.system.traits.languages.value, languageKey];
                    sbcData.characterData.actorData.updateSource({"system.traits.languages.value": languages})
                } else {
                    specialLanguages.push(language)
                }

                if (specialLanguages !== null) {
                    sbcData.characterData.actorData.updateSource({ "system.traits.languages.custom": sbcData.characterData.actorData.system.traits.languages.custom + specialLanguages.join(";") })
                }

                // Remove trailing semicolons
                sbcData.characterData.actorData.updateSource({ "system.traits.languages.custom": sbcData.characterData.actorData.system.traits.languages.custom.replace(/(;)$/, "") })

            }

            return true

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as languages."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
                    name: "Special Quality: " + specialQualities[i],
                    type: type,
                    desc: "sbc | Placeholder for Special Qualities, which in most statblocks are listed under SQ in the statistics block, but described in the Special Abilities. Remove duplicates as needed!"
                }
                let placeholder = await sbcUtils.generatePlaceholderEntity(specialQuality, line)
                sbcData.characterData.items.push(placeholder)
            }

        } catch (err) {

            let errorMessage = "Failed to parse " + value + " as SQ."
            let error = new sbcError(1, "Parse/Statistics", errorMessage, line)
            sbcData.errors.push(error)

            throw err

            return false

        }

    }

}

// Parse Gear
class gearParser extends sbcParserBase {

    async parse(value, line) {
        sbcConfig.options.debug && sbcUtils.log("Trying to parse " + value + " as gear")

        try {

            const weaponCompendium = "pf1.weapons-and-ammo"
            const armorCompendium = "pf1.armors-and-shields"
            const itemCompendium = "pf1.items"
            const spellCompendium = "pf1.spells";

            let patternSupportedWeapons = new RegExp("(" + sbcConfig.weapons.join("\\b|\\b") + ")", "gi")
            let patternSupportedArmors = new RegExp("(" + sbcConfig.armors.join("\\b|\\b") + ")", "gi")
            let patternSupportedItems = new RegExp("(" + sbcConfig.items.join("\\b|\\b") + ")", "gi")
            let patternSupportedSpells = /(potion|wand|scroll)s?\s+of\s+(.+)/i;
            let patternGold = new RegExp("^(\\d+[\\.,]*\\d*\\s+)(?:PP|GP|SP|CP)", "i")
    
            let gears = sbcUtils.sbcSplit(value)
            let placeholdersGenerated = []

            for (let i=0; i<gears.length; i++) {

                let input = gears[i].trim()
                let splitInput = sbcUtils.parseSubtext(input)
                let gearText = splitInput[0]
                let gearSubtext = splitInput[1] 

                let gear = {
                    type: "loot",
                    name: gearText.replace(/^([\d\+]+|masterwork|mwk)/g, "").trim(),
                    rawName: input,
                    subtext: gearSubtext,
                    value: 0,
                    enhancementValue: 0,
                    enhancementTypes: [],
                    mwk: false
                }

                let gearKeys = Object.keys(gear)
                
                if (/^\+/.test(gearText)) {
                    gear.enhancementValue = +gearText.match(/(\d+)/)[1].trim()
                }

                if (/(masterwork|mwk)/.test(gearText)) {
                    gear.mwk = true
                }
                
                let entity = {}

                if (patternSupportedWeapons.test(gearText)) {
                    patternSupportedWeapons.lastIndex = 0
                    // If the input is a weapon in one of the compendiums
                    gear.type = "weapon"
                    entity = await sbcUtils.findEntityInCompendium(weaponCompendium, gear)

                } else if (patternSupportedArmors.test(gearText)) {
                    patternSupportedArmors.lastIndex = 0
                    // If the input is a armor in one of the compendiums
                    gear.type = "equipment"
                    entity = await sbcUtils.findEntityInCompendium(armorCompendium, gear)
                    
                } else if (patternSupportedItems.test(gearText)) {
                    patternSupportedItems.lastIndex = 0
                    // If the input is a item in one of the compendiums
                    gear.type = "loot"
                    entity = await sbcUtils.findEntityInCompendium(itemCompendium, gear)   
                    
                } else if (patternGold.test(gearText)) {
                    patternGold.lastIndex = 0
                    // If the input is Money
                    gear.name = "Money Pouch"
                    gear.type = "container"
                    gear.currency = {
                        pp: splitInput[0].search(/\bPP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*PP)/i)[1] : 0,
                        gp: splitInput[0].search(/\bGP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*GP)/i)[1] : 0,
                        sp: splitInput[0].search(/\bSP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*SP)/i)[1] : 0,
                        cp: splitInput[0].search(/\bCP\b/i) !== -1 ? +splitInput[0].match(/(\d+)(?:\s*CP)/i)[1] : 0
                    }

                } else if (patternSupportedSpells.test(gearText)) {
                    patternSupportedSpells.lastIndex = 0
                    gear.type = "consumable";
                    
                    let namePattern = gearText.match(patternSupportedSpells);
                    let consumableType = namePattern[1]?.toLowerCase();
                    let spellName = namePattern[2];
                    let charges = gearSubtext?.match(/\d+/)?.[0] ?? (/wand/i.test(consumableType) ? 50 : 1);
                    
                    entity = await sbcUtils.findEntityInCompendium(spellCompendium, {name: spellName});
                    if (entity) {
                        const consumable = await CONFIG.Item.documentClasses.spell.toConsumable(entity.toObject(), consumableType);
                        if (consumableType == "wand")
                            consumable.data.uses.value = parseInt(charges);
                        else
                            consumable.data.quantity = parseInt(charges);
                        gear.rawName = consumable.name;
                        // Following is somewhat redundant re-creation
                        entity = await Item.create(consumable, {temporary: true});
                    }
                } else {
                    entity = await sbcUtils.findEntityInCompendium(itemCompendium, gear)
                }

                if (entity && Object.keys(entity).length !== 0) {

                    entity.data.update({
                        name: sbcUtils.capitalize(gear.rawName),
                        data: {
                            identifiedName: sbcUtils.capitalize(gear.rawName)
                        }
                    })

                    for (let i=0; i<gearKeys.length; i++) {
                        let key = gearKeys[i]
                        let change = gear[key]

                        if (change) {
                            switch (key) {
                                case "enhancementValue":
                                    if (gear.type === "weapon") {
                                        entity.data.update({
                                            data: {
                                                enh: +change,
                                                masterwork: true,
                                            }
                                        })
                                    } else if (gear.type === "equipment") {
                                        entity.data.update({
                                            data: {
                                                masterwork: true,
                                                armor: {
                                                    enh: +change,
                                                }
                                            }
                                        })
                                    } else {
                                        break
                                    }
                                    break
                                case "mwk":
                                    entity.updateSource({ "masterwork": change })
                                    break
                                case "value":
                                    entity.updateSource({ "price": +change })
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

            throw err

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
        hasTactics: true
    }

    let parserTactics = sbcMapping.map.tactics

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            // Parse Before Combat
            if (!parsedSubCategories["beforeCombat"]) {
                if (/(Before Combat)/i.test(lineContent)) {
                    let beforeCombat = {
                        name: "Before Combat",
                        entry: lineContent.match(/^(?:Before Combat)([\s\S]*?)(?=$|During Combat|Morale|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.beforeCombat = beforeCombat.entry
                    parsedSubCategories["beforeCombat"] = await parserTactics.parse(beforeCombat, startLine + line)
                }
            }

            // Parse During Combat
            if (!parsedSubCategories["duringCombat"]) {
                if (/(During Combat)/i.test(lineContent)) {
                    let duringCombat = {
                        name: "During Combat",
                        entry: lineContent.match(/^(?:During Combat)([\s\S]*?)(?=$|Morale|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.duringCombat = duringCombat.entry
                    parsedSubCategories["duringCombat"] = await parserTactics.parse(duringCombat, startLine + line)
                }
            }

            // Parse Morale
            if (!parsedSubCategories["morale"]) {
                if (/(Morale)/i.test(lineContent)) {
                    let morale = {
                        name: "Morale",
                        entry: lineContent.match(/^(?:Morale)([\s\S]*?)(?=$|Base Statistics)/i)[1]                       
                    }
                    sbcData.notes.tactics.morale = morale.entry
                    parsedSubCategories["morale"] = await parserTactics.parse(morale, startLine + line)
                }
            }

            // Parse Base Statistics
            if (!parsedSubCategories["baseStatistics"]) {
                if (/(Base Statistics)/i.test(lineContent)) {
                    let baseStatistics = {
                        name: "Base Statistics",
                        entry: lineContent.match(/^(?:Base Statistics)([\s\S]*?)$/i)[1]                       
                    }
                    sbcData.notes.tactics.baseStatistics = baseStatistics.entry
                    parsedSubCategories["baseStatistics"] = await parserTactics.parse(baseStatistics, startLine + line)
                }
            }


        } catch (err) {
            let errorMessage = `Parsing the tactics data failed at line ${line+startLine} (non-critical)`
            let error = new sbcError(2, "Parse/Tactics", errorMessage, line+startLine)
            sbcData.errors.push(error)
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

            let tacticsDesc = `<div><strong>${value.name}</strong>: ${value.entry}</div>`

            // Check, if there already is a tactics document
            let currentItems = sbcData.characterData.items
            let alreadyHasTacticsDocument = false
            let tacticsItemIndex = null
            for (let i=0; i<currentItems.length; i++) {
                if (currentItems[i].name === "Tactics") {

                    // When a race was found, do not create a custom one to hold the creatureType and SubType
                    alreadyHasTacticsDocument = true
                    tacticsItemIndex = i
                }
            }

            
            if (alreadyHasTacticsDocument) {

                let tempDesc = sbcData.characterData.items[tacticsItemIndex].data.data.description.value

                sbcData.characterData.items[tacticsItemIndex].updateSource({ "description.value": tempDesc + tacticsDesc })

            } else {

                let tacticsEntry = {
                    name: "Tactics",
                    type: "misc",
                    desc: tacticsDesc,
                    img: "icons/skills/targeting/crosshair-pointed-orange.webp"
                }

                let placeholder = await sbcUtils.generatePlaceholderEntity(tacticsEntry, line)
                sbcData.characterData.items.push(placeholder)

            }

            return true

        } catch (err) {
            let errorMessage = "Failed to parse " + value + " as tactics."
            let error = new sbcError(2, "Parse/Ecology", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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
        hasEcology: true
    }

    // Loop through the lines
    for (let line = 0; line < data.length; line++) {

        try {
            let lineContent = data[line]

            let parserEcology = sbcMapping.map.ecology

            // Parse Environment
            if (!parsedSubCategories["environment"]) {
                if (/(Environment)/i.test(lineContent)) {
                    let environment = {
                        name: "Environment",
                        entry: lineContent.match(/^(?:Environment)([\s\S]*?)(?=$|Organization|Treasure)/i)[1]                       
                    }
                    sbcData.notes.ecology.environment = environment.entry
                    parsedSubCategories["environment"] = await parserEcology.parse(environment, startLine + line)
                }
            }

            // Parse Organization
            if (!parsedSubCategories["organization"]) {
                if (/(Organization)/i.test(lineContent)) {
                    let organization = {
                        name: "Organization",
                        entry: lineContent.match(/(?:Organization)([\s\S]*?)(?=$|Treasure)/i)[1]                    
                    }
                    sbcData.notes.ecology.organization = organization.entry
                    parsedSubCategories["organization"] = await parserEcology.parse(organization, startLine + line)
                }
            }

            // Parse Treasure
            if (!parsedSubCategories["treasure"]) {
                if (/(Treasure)/i.test(lineContent)) {
                    let treasure = {
                        name: "Treasure",
                        entry: lineContent.match(/(?:Treasure)([\s\S]*?)$/i)[1]                     
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

            throw err

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

            let ecologyDesc = `<div><strong>${value.name}</strong>: ${value.entry}</div>`

            // Check, if there already is a tactics document
            let currentItems = sbcData.characterData.items
            let alreadyHasEcologyDocument = false
            let ecologyItemIndex = null
            for (let i=0; i<currentItems.length; i++) {
                if (currentItems[i].name === "Ecology") {

                    // When a race was found, do not create a custom one to hold the creatureType and SubType
                    alreadyHasEcologyDocument = true
                    ecologyItemIndex = i
                }
            }

            
            if (alreadyHasEcologyDocument) {

                let tempDesc = sbcData.characterData.items[ecologyItemIndex].system.description.value

                sbcData.characterData.items[ecologyItemIndex].updateSource({ "description.value": tempDesc + ecologyDesc })

            } else {

                let ecologyEntry = {
                    name: "Ecology",
                    type: "misc",
                    desc: ecologyDesc,
                    img: "icons/environment/wilderness/tree-oak.webp"
                }

                let placeholder = await sbcUtils.generatePlaceholderEntity(ecologyEntry, line)
                sbcData.characterData.items.push(placeholder)

            }

            /*
            let ecologyEntry = {
                "name": value.name + ": " + value.entry,
                "type": "misc",
                "desc": "sbc | Here you’ll find information on how the monster fits into the world, notes on its ecology and society, and other bits of useful lore and flavor that will help you breathe life into the creature when your PCs encounter it."
            }

            let placeholder = await sbcUtils.generatePlaceholderEntity(ecologyEntry, line)
           
            sbcData.characterData.items.push(placeholder)
            */

            return true

        } catch (err) {
            let errorMessage = "Failed to parse " + value + " as ecology."
            let error = new sbcError(2, "Parse/Ecology", errorMessage, line)
            sbcData.errors.push(error)

            throw err

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

            throw err

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

                // (2) If no abilityType is found, things aren't solvable.
                //     Sometimes the name will be anything up to the first word which first letter is lowercase
                //     Other times the name will include an "of" or "the" with a lower letter, which will break the name finding
                //     Sometimes, the name isn't present because this line is actually part of the previous ability.
                //     Removing this code until WIP: split abilities by titles instead of by line

                //let patternFindStartOfDescription = new RegExp("(^\\w*)(?:\\s)(?!is|the|of)(\\b[a-z]+\\b)", "")
                //let patternFindStartOfDescription = new RegExp("(?:^[a-zA-Z]+?\\s+)([a-z]?)", "")
                /* let patternFindStartOfDescription = new RegExp("((?:[A-Z][a-z]*)*\\s*(?:of|the|is)*\\s*(?:[A-Z][a-z]*)[a-z])", "")
                let indexOfStartOfDescription = 0

                if (value.match(patternFindStartOfDescription) !== null) {
                    indexOfStartOfDescription = value.match(patternFindStartOfDescription)[0].length
                }


                specialAbilityName = value.slice(0,indexOfStartOfDescription).trim()
                specialAbilityDesc = value.slice(indexOfStartOfDescription).trim()
                */
                specialAbilityName = `Special Ability (${line})`;
                specialAbilityDesc = value.trim();

                let errorMessage = `There may be some issues here. Please check the preview!`
                let error = new sbcError(3, "Parse/Special Abilties", errorMessage, line)
                sbcData.errors.push(error)

            }

            // Create a placeholder for the special ability using the data found
            let specialAbility = {
                name: specialAbilityName || "Special Ability",
                specialAbilityType: specialAbilityType,
                type: "classFeat",
                desc: specialAbilityDesc
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

            throw err

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

            throw err

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
                    fields = ["system.attributes.hpAbility", "system.attributes.savingThrows.fort.ability"]
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
export async function createEmbeddedDocuments() {

    try {
        sbcData.characterData.actorData.prepareData()
        return sbcData.characterData.actorData.updateSource({ items: sbcData.characterData.items.map(i => i.toObject()) })
    
    } catch (err) {

        let errorMessage = `Failed to create embedded entities (items, feats, etc.)`
        let error = new sbcError(1, "Parse", errorMessage)
        sbcData.errors.push(error)
        sbcData.parsedInput.success = false
        return false

    }

}

export async function generateNotesSection() {

    let preview = await renderTemplate('modules/pf1-statblock-converter/templates/sbcPreview.hbs' , {data: sbcData.characterData.actorData.system, notes: sbcData.notes })

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
    sbcData.characterData.actorData.updateSource({ "system.details.notes.value": sbcInfo + styledNotes + rawNotes })
}

/* ------------------------------------ */
/* Initialize Parser Mapping            */
/* ------------------------------------ */

export function initMapping() {

    if (sbcMapping.map) {
        return;
    }

    sbcMapping.map = {
        base: {
            name: new singleValueParser(["name", "prototypeToken.name"], "string"),
            cr: new singleValueParser(["system.details.cr.base", "system.details.cr.total"], "number"),
            mr: new notesParser(["base.mr"]),                                                 // currently not supported by the game system
            level: new notesParser(["system.details.level.value"]),                             // gets calculated by foundry
            xp: new notesParser(["system.details.xp.value"]),                                   // gets calculated by foundry
            gender: new singleValueParser(["system.details.gender"], "string"),
            race: new raceParser(),
            classes: new classesParser(),
            source: new notesParser(["base.source"]),                                         // used in the notes section
            alignment: new singleValueParser(["system.details.alignment"], "string"),
            size: new singleValueParser(["system.traits.size"], "string"),
            creatureType: new creatureTypeParser(),
            init: new singleValueParser(["system.attributes.init.total"], "number"),
            senses: new sensesParser(),
            aura: new auraParser()
        },
        defense: {
            acNormal: new singleValueParser(["system.attributes.ac.normal.total"], "number"),
            acFlatFooted: new singleValueParser(["system.attributes.ac.flatFooted.total"], "number"),
            acTouch: new singleValueParser(["system.attributes.ac.touch.total"], "number"),
            //"acContext": new singleValueParser(["system.attributes.acNotes"], "string"),
            acTypes: new acTypesParser(),
            
            hp: new hpParser(),
            saves: new savesParser(),
            immune: new immuneParser(),
            resist: new resistParser(),
            weakness: new weaknessParser(),
            defensiveAbilities: new entityParser(),
            dr: new singleValueParser(["system.traits.dr"], "string"),
            sr: new srParser(),  
        },
        offense: {
            speed: new speedParser(),
            attacks: new attacksParser(),
            specialAttacks: new specialAttacksParser(),
            spellBooks: new spellBooksParser()
            
        },
        tactics: new tacticsParser(),
        statistics: {
            
            str: new abilityParser(["system.abilities.str.total", "system.abilities.str.value"], ["system.abilities.str.mod"], "number"),
            dex: new abilityParser(["system.abilities.dex.total", "system.abilities.dex.value"], ["system.abilities.dex.mod"], "number"),
            con: new abilityParser(["system.abilities.con.total", "system.abilities.con.value"], ["system.abilities.con.mod"], "number"),
            int: new abilityParser(["system.abilities.int.total", "system.abilities.int.value"], ["system.abilities.int.mod"], "number"),
            wis: new abilityParser(["system.abilities.wis.total", "system.abilities.wis.value"], ["system.abilities.wis.mod"], "number"),
            cha: new abilityParser(["system.abilities.cha.total", "system.abilities.cha.value"], ["system.abilities.cha.mod"], "number"),
            bab: new singleValueParser(["system.attributes.bab.total"], "number"),
            cmb: new singleValueParser(["system.attributes.cmb.total"], "number"),
            cmd: new singleValueParser(["system.attributes.cmd.total"], "number"),
            feats: new entityParser(),
            skills: new skillsParser(),
            languages: new languageParser(),
            sq: new sqParser(),
            gear: new gearParser(),

        },        
        ecology: new ecologyParser(),
        "special abilities": new specialAbilityParser(),
        description: new notesParser(["description.long"], "string")
    }
}
