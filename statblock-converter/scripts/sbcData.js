export class sbcData {

    static errors = []
    static foundCategories = 0
    static parsedCategories = 1
    static actorType = 0
    static input = ""
    static preparedInput = {}
    static parsedInput = {}
    static characterData = {}
    static notes = {}

}

export class sbcError {
    constructor(level = 0, keyword = "Default Error Keyword", message = "Default Error Message", line = -1) {
        this.level = level
        this.keyword = keyword
        this.message = message
        this.line = line
    }
}

export const sbcErrorLevels = {
    0: "FATAL",
    1: "ERROR",
    2: "WARNING",
    3: "INFO"
}