












/* ------------------------------------ */
/* MISC FUNCTIONS    					*/
/* ------------------------------------ */

function getModifier(attr) {
    return Math.floor(((attr-10)/2));
}

function getSumOfChangeModifiers(changePool) {
    let sumOfChanges = 0;
    let changeKeys = Object.keys(changePool)
    for (let i=0; i<changeKeys.length; i++) {
        sumOfChanges += changePool[changeKeys[i]];
    }
    return sumOfChanges;
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
        
    var output = inputText.replace(/(\d+d\d+)/g, "[[$1]]");
    
    return output;
}

function capitalize (str) {
    return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
        return letter.toUpperCase();
    })
}

/* ------------------------------------ */
/* FOUNDRY COMPENDIUM FUNCTIONS    		*/
/* ------------------------------------ */


async function createSpellFromCompendium(spellName, actor_id) {
    
    // Suppose we are working with a particular pack named "dnd5e.spells"
    const pack = game.packs.get("pf1.spells");

    // We can load the index of the pack which contains all entity IDs, names, and image icons
    let packIndex = await pack.getIndex().then(index => {
        index = index.name;
    });

    // We can find a specific entry in the compendium by its name
    let entry = await pack.index.find(e => e.name === spellName);
            
    // Given the entity ID of "Acid Splash" we can load the full Entity from the compendium
    await pack.getEntity(entry._id).then(spell => {
        return spell;
    });
}

async function getItemFromCompendium(packInput, item) {
    const pack = game.packs.get(packInput);

    // We can load the index of the pack which contains all entity IDs, names, and image icons
    let packIndex = await pack.getIndex().then(index => {
        index = index.name;
    });

    // We can find a specific entry in the compendium by its name
    let entry = await pack.index.find(e => e.name.toLowerCase() === item.toLowerCase());
            
    // Given the entity ID we can load the full Entity from the compendium
    let output = await pack.getEntity(entry._id).then(entity => {
        return entity;
    });
    
    return output;
    
}