# SBC | StatBlock-Converter for Pathfinder 1E
FoundryVTT Module to create new PC and NPC Actors from a text-based Statblock (as found for example on [Archives of Nethys](https://www.aonprd.com/))

[![Buy me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-red.png)](https://www.buymeacoffee.com/Lavaeolous)

# Installation
Install the SBC Module via the Add-On Module Tab in FoundryVTT using the following link to the manifest
```
https://raw.githubusercontent.com/Lavaeolous/PF1-StatBlock-Converter-Module/master/statblock-converter/module.json
```
# Compatibility
GameSystem: Latest Check on [PF1 0.74.8](https://gitlab.com/Furyspark/foundryvtt-pathfinder1)
FoundryVTT: 0.6.6

# How to Use
1.  Copy a Statblock for the creature, enemy or npc you want to generate (beginning with the name).
2.  In the Actor Directory tab of foundry, click on "Import Statblock"
3.  Paste the Statblock into the textarea, check the preview for any errors and import via button as NPC or PC actor

# Disclaimer
SBC is currently in development, so not all data will be parsed or may be parsed/calculated incorrectly.
If you find any errors or have a statblock that can't be converted at all, feel free to open an issue here or let me know on the FoundryVTT Discord.

# What gets converted
SBC creates a mostly complete Actor (PC or NPC) with embedded entities for feats, spells and stuff like that. Most of the time the conversion will not be complete, as for example items and gear as well as other smaller sections won't get imported or may be imported incorrect. For most actors this will be fine, for critical and important NPCs, Bosses and PCs i strongly advise you to use sbc for the bulk, but check for errors carefully!

# Known Bugs
*  Special Abilities and Spells do not appear in the preview currently
*  Not all Statblocks are equally formatted. As long as its reasonably well formed, it should work. If not, check the preview area or console.
*  See Issues. If you find anythings thats not noted there, please let me know.

# To Do
*  **Bug Fixing**
*  Parse Ecology, Gear & Treasure

# Contact
Primer#2220 | FoundryVTT Discord

# Change Log

2020_10_11
*  sbc now grabs feats from the compendium instead of generating placeholders

2020_10_08
*  Minor Bug-Fixes

2020_08_28
*  Fix for wrongly calculated spell DCs

2020_08_27
*  Release of v2.0.0 which includes the first iteration of an import preview which should help identify problematic areas of the input before importing

2020_08_12
*  Added Hotfix for Issue #286

2020_08_09
*  Started work on the Preview Window
*  Further Bug Fixing

2020_07_11
*  Reworked the notes section to include the input as a written statblock
*  Added support for NPCs without CR or XP

2020_07_10
*  Finished and fixed Spell- & SLA-Parsing
*  Merging PR for the auto-conversion of bestiaries, see [PF1 Bestiary](https://github.com/JamesDeVore/pf1_Bestiary)
*  Bug-Fixing

2020_06_28:
*  Added Resilience for malformed input
*  bugfixing
*  introducing new bugs ;)

2020_06_26:
*  Hotfix for compatibility to the PF1 system update 0.621
*  Groundwork for spellbook and spell parsing
*  Reworked Race-Parsing to use Compendium Entries
*  Fixes for a range of smaller issues

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