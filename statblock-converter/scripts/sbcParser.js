import { sbcConfig } from "./sbcConfig.js"
import { sbcUtils } from "./sbcUtils.js"
import { sbcData, sbcError } from "./sbcData.js"
import { checkFlags, createEmbeddedDocuments, parseCategories, sbcMapping, generateNotesSection } from "./sbcParsers.js"

/* ------------------------------------ */
/* sbcParser    						*/
/* ------------------------------------ */

export class sbcParser {

    /* ------------------------------------ */
    /* Prepare the input                    */
    /* ------------------------------------ */

    static async prepareInput() {
        sbcConfig.options.debug && console.group("sbc-pf1 | PREPARING INPUT")

        try {

            // Initial Clean-up of input
            $( "#sbcProgressBar" ).css("width", "5%")
            
            // Replace different dash-glyphs with the minus-glyph
            sbcData.preparedInput.data = sbcData.input.replace(/–|—|−/gm,"-")
            // Remove weird multiplication signs
            .replace(/×/gm, "x")
            // Remove double commas
            .replace(/,,/gm, ",")
            // Replace real fractions with readable characters (½ ⅓ ¼ ⅕ ⅙ ⅛)
            .replace(/½/gm, "1/2")
            .replace(/⅓/gm, "1/3")
            .replace(/¼/gm, "1/4")
            .replace(/⅕/gm, "1/5")
            .replace(/⅙/gm, "1/6")
            .replace(/⅛/gm, "1/8")
            // Remove Source Superscript (e.g. ^APG, ^UE)
            .replace(/(APG\b|ACG\b|UE\b|UM\b|HA\b|OA\b|ISWG\b|B\b)/gm, "")
            // Replace common Skill shorthands and misswordings
            .replace(/\bEnter Choice\b/igm, "any one")
            .replace(/Arcane/igm, "Arcana")
            .replace(/\bPer\./igm, "Perception")
            .replace(/S\. Motive/igm, "Sense Motive")
            .replace(/\bLing\./igm, "Linguistics")
            // Replace ligatures
            .replace(/ﬂ/igm, "fl")
            .replace(/ﬁ/igm, "fi")
            .replace(/ﬀ/igm, "ff")
            .replace(/ﬃ/igm, "ffi")
            .replace(/ﬄ/igm, "ffl")
            .replace(/ﬆ/igm, "st")


            // Separate the input into separate lines and put them into an array,
            // so that we can place highlights on specific lines when for
            // example an error occurs

            .split(/\n/g)

            //sbcUtils.parseCategories()
            sbcUtils.resetErrorLog()
            sbcUtils.resetHighlights()
            
            sbcData.preparedInput.success = true

            await this.parseInput()

        } catch (errorMessage) {
            let error = new sbcError(0, "Prepare", errorMessage)
            sbcData.errors.push(error)
            sbcData.preparedInput.success = false
            throw errorMessage
        }

        sbcConfig.options.debug && console.groupEnd()
    }

    /* ------------------------------------ */
    /* Parse the input                      */
    /* ------------------------------------ */

    static async parseInput() {
        sbcConfig.options.debug && console.group("sbc-pf1 | PARSING INPUT")

        // Check if there is stuff to parse and a temporary actor to hold the data
        if (sbcData.characterData == null || !sbcData.input) {
            sbcData.characterData == null && sbcData.errors.push(new sbcError(0, "Input", "No valid characterData found"))
            !sbcData.input && sbcData.errors.push(new sbcError(0, "Parse", "Not enough input found to parse"))
            sbcData.parsedInput.success = false
        }

        if (sbcData.preparedInput.success) {

            // DO STUFF WITH THE PARSED INPUT
            // parse the different blocks of content

            try {

                
                sbcUtils.updateProgressBar("Preparation", "Clean-up", 1, 1)

                let availableCategories = Object.keys(sbcMapping.map);

                /* ------------------------------------ */
                /* The input was prepared and is        */
                /* currently in the form of an array    */
                /* which consists of one entry per line */
                /* ------------------------------------ */

                // Split the input data via the category names of our mapping
                // base (no keyword, so use everything up to the defense keyword)
                // defense
                // offense
                // tactics
                // statistics
                // ecology
                // special abilities
                // description

                // Get the index position of our keywords/categories
                // Bonus, filter for the categories found in the statblock
                
                let categoryIndexPositions = {}
                for (let i=1; i<availableCategories.length; i++) {

                    let categoryPattern = new RegExp("^\\b" + availableCategories[i] + "\\b\\s*(?:\\r?\\n|$)","i")
                    sbcData.preparedInput.data.filter(function(item, index){

                        if (categoryPattern.test(item) && categoryIndexPositions[availableCategories[i]] == null) {
                            categoryIndexPositions[availableCategories[i]] = index
                        }

                    })
                    
                }

                // Check, if any categories could be found
                let foundCategories = Object.keys(categoryIndexPositions)
                let foundCategoriesString = sbcUtils.capitalize(foundCategories.join(", "))
                foundCategories.unshift("base")
                let parsedCategories = {}

                sbcData.foundCategories = foundCategories.length

                if (foundCategories.length !== 0) {

                    // Check, if the needed categories are there
                    let neededCategories = ["defense","offense","statistics"]
                    let foundAllNeededCategories = neededCategories.every(i => foundCategories.includes(i));

                    if (foundAllNeededCategories) {

                        // Split the input into chunks for the found categories
                        // via the index positions found earlier
                        // and send these chunks off to the correct parser in sbcParsers.js

                        let dataChunks = {
                            "base": [],
                            "defense": [],
                            "offense": [],
                            "statistics": [],
                            "tactics": [],
                            "ecology": [],
                            "special abilities": [],
                            "description": [],
                        }

                        let startLines = {
                            "base": 0,
                            "defense": 0,
                            "offense": 0,
                            "statistics": 0,
                            "tactics": 0,
                            "ecology": 0,
                            "special abilities": 0,
                            "description": 0,
                        }
                        
                        let lastLine = 0

                        // put the found data in the dataChunks and parse them after rearranging them
                        // so that needed statistical data gets parsed first
                        // even though its written after defense and offense data
                        for (let i=0; i<foundCategories.length; i++) {
                            
                            let category = foundCategories[i]

                            let startLine = lastLine
                            startLines[category] = startLine
                            let stopLine = categoryIndexPositions[foundCategories[i+1]]

                            if (i === foundCategories.length-1) {
                                dataChunks[category] = sbcData.preparedInput.data.slice(startLine)
                            } else {
                                dataChunks[category] = sbcData.preparedInput.data.slice(startLine, stopLine)
                            }

                            //parsedCategories[category] = await parseCategories(category, dataChunks[category], startLine)

                            lastLine = stopLine

                        }

                        // Rearrange the foundCategories so that statistics gets parsed before defense and offense
                        let orderedFoundCategories = foundCategories
                        orderedFoundCategories.splice(foundCategories.indexOf("statistics"),1)[0]
                        orderedFoundCategories.splice(1,0,"statistics")

                        for (let i=0; i<orderedFoundCategories.length; i++) {
                            let category = orderedFoundCategories[i]
                            sbcUtils.updateProgressBar("Parsing", category, orderedFoundCategories.length, i+1)
                            parsedCategories[category] = await parseCategories(category, dataChunks[category], startLines[category])
                            
                        }

                        // After parsing all available subCategories, create embedded entities
                        sbcUtils.updateProgressBar("Entities", "Creating Embedded Entities", 1, 1)
                        await createEmbeddedDocuments()

                        // After parsing all available subCategories, check the flags set on the way
                        sbcUtils.updateProgressBar("Flags", "Checking if Special Flags were set", 1, 1)
                        await checkFlags()

                        // Create the notes section composed of the statblock and the raw input
                        sbcUtils.updateProgressBar("Preview", "Generating Preview", 1, 1)
                        await generateNotesSection()

                    

                        // If parsing and character generation is success
                        // close the inputDialog and resetSBC

                        // SET THIS TO TRUE WHEN ALL CATEGORIES ARE PARSED SUCCESSFULLY (MORE OR LESS)
                        sbcUtils.updateProgressBar("Actor", "Actor is ready", 1, 1)
                        sbcData.parsedInput.success = true

                    } else {

                        let errorMessage = `Failed to find enough keywords to parse the input.<br>
                                        Found Keywords: ${foundCategoriesString}<br>
                                        Needed Keywords: Defense, Offense, Statistics<br>
                                        Optional Keywords: Special Abilities, Ecology, Tactics, Description`
                        let error = new sbcError(0, "Parse", errorMessage)
                        sbcData.errors.push(error)
                        sbcData.parsedInput.success = false

                    }

                } else {

                    let errorMessage = `Failed to find any keywords to parse the input.<br>
                                        Needed Keywords: Defense, Offense, Statistics<br>
                                        Optional Keywords: Special Abilities, Ecology, Tactics, Description`
                    let error = new sbcError(0, "Parse", errorMessage)
                    sbcData.errors.push(error)
                    sbcData.parsedInput.success = false

                }

            } catch (e) {

                let errorMessage = "parseInput() failed with an unspecified error. Sorry!"
                let error = new sbcError(0, "Parse", errorMessage)
                sbcData.errors.push(error)
                sbcData.parsedInput.success = false
                throw e

            }

        } else {

            let errorMessage = "parseInput() failed as the input could not be prepared successfully"
            let error = new sbcError(0, "Parse", errorMessage)
            sbcData.errors.push(error)
            sbcData.parsedInput.success = false
            
        }
        
        sbcConfig.options.debug && console.groupEnd()

    }

}

