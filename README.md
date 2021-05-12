![Downloads](https://img.shields.io/github/downloads-pre/lavaeolous/PF1-StatBlock-Converter-Module/latest/total?style=flat-square)
![Downloads](https://img.shields.io/github/downloads/lavaeolous/PF1-StatBlock-Converter-Module/total?style=flat-square)

# SBC | StatBlock-Converter for Pathfinder 1E
FoundryVTT Module to create new PC and NPC Actors from a text-based Statblock (as found for example on [Archives of Nethys](https://www.aonprd.com/))

<a href="https://www.buymeacoffee.com/Lavaeolous" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" width="150" ></a>

# Installation
Install the SBC Module via the Add-On Module Tab in FoundryVTT using the following link to the manifest
```
https://github.com/Lavaeolous/PF1-StatBlock-Converter-Module/releases/latest/download/module.json
```
# Compatibility
GameSystem: [PF1 0.77.23](https://gitlab.com/Furyspark/foundryvtt-pathfinder1)

FoundryVTT: 0.7.8-0.7.9

# How to Use
1.  Copy a Statblock for the creature, enemy or npc you want to generate (beginning with the name).
2.  In the Actor Directory tab of foundry, click on "Import Statblock"
3.  Paste the Statblock into the textarea, check the preview for any errors and import via button as NPC or PC actor

# Disclaimer
sbc is currently in development, some data may not be parsed. See change log for latest updates and issues for known bugs.

If you find any errors or have a statblock that can't be converted at all, feel free to open an issue here or let me know on the FoundryVTT Discord.

# What gets converted
SBC creates a mostly complete Actor (PC or NPC) with embedded entities for feats, spells and stuff like that. Most of the time the conversion will not be complete, as for example items and gear may be imported incorrectly or as placeholders. For most actors this will be fine, for critical and important NPCs, Bosses and PCs i strongly advise you to use sbc for the bulk, but check for errors carefully!

# Known Bugs
*  Depending on the size of the input, there may be **long** loading times!
*  Not all Statblocks are equally formatted. As long as its reasonably well formed, it should work. If not, check the preview area or console.
*  See Issues. If you find anythings thats not noted there, please let me know.

# To Do
*  Finalize spell parsing
*  Optimize loading times, as currently the search for items in compendia is taking forever

# Contact
Primer#2220 | FoundryVTT Discord