# SBC | StatBlock-Converter for Pathfinder 1E
FoundryVTT Module to create new PC and NPC Actors from a text-based Statblock (as found for example on [Archives of Nethys](https://www.aonprd.com/))


# Installation
Install the SBC Module via the Add-On Module Tab in FoundryVTT using the following link to the manifest
```
https://raw.githubusercontent.com/Lavaeolous/PF1-StatBlock-Converter-Module/master/statblock-converter/module.json
```

# How to Use
1.  Copy a Statblock for the creature, enemy or npc you want to generate (beginning with the name).
2.  In the Actor Directory tab of foundry, click on "Import Statblock"
3.  Paste the Statblock into the textarea and confirm with enter

# Disclaimer
SBC is currently in development, so not all data will be parsed or may be parsed/calculated incorrectly.
If you find any errors or have a statblock that can't be converted at all, feel free to open an issue here or let me know on the FoundryVTT Discord.

# What gets converted
Currently, the tool only parses the following data and generates equivalent Foundry Data and Items:

![Status Image](/assets/images/status.png)

*  **General Data**: Name, CR, XP, Gender, Race<sup>1</sup>, Class(es)<sup>1</sup>, Alignment, Size<sup>3</sup>, Type (Subtype)<sup>1</sup>, Init, Senses<sup>3</sup>, Aura (but there is no field for that in the character sheet)
*  **Defensive Data:** AC, Touch and Flat-Footed)<sup>2</sup>, HP<sup>2</sup>, Hit Dice<sup>2</sup>, Saves<sup>2</sup>, Defensive Abilities<sup>1</sup>, Immunities, Resistances, Weaknesses, Damage and Spell Resistance
*  **Tactics:** Before &amp; During Combat, Morale (Buggy)
*  **Statistics Data:** Attributes (Str, Dex, Con, Int, Wis, Cha), BAB, CMD and CMB (context notes WIP), Feats<sup>4</sup>, Skills<sup>2</sup> (context notes WIP), Languages, Special Qualities
*  **Offense Data:** Speed(s), Melee Attacks (Weapon, Natural, Swarm), Ranged Attacks, Damage Types, Special Attacks, [SPELLS ARE NOT YET IMPLEMENTED]
*  ** Special Abilities [WIP, currently only the ones noted under Special Attacks]

[1]: A new Item is created for these Values including the needed calculations for Hit Dice, HP, etc.  
[2]: Including the needed calculations  
[3]: Including changes to the token (e.g. size and vision)  
[4]: Creates empty Items for now

# Known Bugs
*  Not all Statblocks are equally formatted. As long as its reasonably well formed, it should work. If not, check the console (F12).
*  A lot more ... see Issues. If you find anythings thats not noted there, please include it


# To Do
*  **Bug Fixing**
*  Parse Spells, Ecology, Description (only for SRD-Content), Gear & Treasure, Special Abilities
*  Give usable Feedback or implement a debug mode (for now some comments are visible in the console)

# Contact
Primer#2220 | FoundryVTT Discord

# Change Log

2020_06_19:
*  First Draft of Special Attack and Special Ability parsing. These get added as mostly empty items to Features / Miscellaneous for now.
*  Special Attacks like Rend get parsed as new attacks.
*  As this introduces new features, some stuff may have broken. Let me know if you find anything.

2020_06_14:
*  Fixed empty "New Attacks"
*  Fixed Parsing of Monsters with "-" Abilities
*  Fixed Parsing of CR 1/6 Monsters

2020_06_13:
*  Bug-Fixing for Multiclassed Characters and "Knowledge (any X)" Skills
*  Build a module out of the [SBC Web-Version](https://github.com/Lavaeolous/Foundry-PF1-StatBlock-Converter) 

2020_06_11:
*  Fixes to Attack Parsing
*  Added Support for Ranged Attacks Parsing

2020_06_10:
*  First Draft of Melee Attack Parsing done: Weapon and Natural Attacks will be parsed and converted into separate Attacks
*  Calculations of Attack and Damage Boni needs to be checked over a larger sample size

2020_06_08:
*  Started Work on the Offense Data, finished the parsing of speed(s)
*  Reworked the skill separation to support subSkills, e.g. Perform (Sing) +3
*  Reworked the parsing of defensive stats to be line-independent
*  Included Changes from Race into the calculation of HP, AC, Abilities and Skills

2020_06_07:
*  Added support for language parsing
*  Added support for feat parsing (these get saved as named but empty items in the character sheet)
*  Added support for skill parsing (ranks are autocalculated to match the given total in the statblock depending on attribute modifiers and class skill boni)
*  Reworked calculation of saving throws to use the class or racialHD progression