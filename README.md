# SBC | StatBlock-Converter for Pathfinder 1E
FoundryVTT Module to create new PC and NPC Actors from a text-based Statblock (as found for example on [Archives of Nethys](https://www.aonprd.com/))


# Installation
Install the SBC Module via the Add-On Module Tab in FoundryVTT using the following link to the manifest
```
https://raw.githubusercontent.com/Lavaeolous/PF1-StatBlock-Converter-Module/master/statblock-converter/module.json
```
# Compatibility
GameSystem: Latest Check on [PF1 0.75.7](https://gitlab.com/Furyspark/foundryvtt-pathfinder1)
FoundryVTT: 0.7.5

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