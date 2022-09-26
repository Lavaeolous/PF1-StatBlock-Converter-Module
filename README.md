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
# Compatibility - SBC v4.0.0

*  GameSystem: [Pathfinder 1. Edition](https://gitlab.com/Furyspark/foundryvtt-pathfinder1),
    *  Minimum: 0.82.2
    *  Verified: 0.82.2
*  FoundryVTT: Version 10
    *  Minimum: 10
    *  Verified: 10.286

# Legacy Versions
*  v4.0.0 of sbc is not compatible to v9 of FoundryVTT. Use release [v3.4.0](!https://github.com/Lavaeolous/PF1-StatBlock-Converter-Module/releases/tag/v3.4.0) for this.

# How to Use
1  Copy &amp; Paste Statblocks into the input, you can edit the statblock after copying.
2  Errors, warnings and information will be shown below to help you identify potential errors in the statblock.
3  If you use multiple custom compendia, loading times may get very long.

# Disclaimer
sbc is never finished it seems :D. See change log for latest updates and issues for known bugs.
If you find any errors or have a statblock that can't be converted at all, feel free to open an issue here or let me know on the FoundryVTT Discord.

# Please note
*  The conversion from statblock text to actor is not perfect.
*  To reproduce the statblock as written, some adjustments (e.g. through buffs or changes to attacks) are added automatically.
*  Statblocks often include typographical errors (e.g. extra linebreaks) or ligatures (e.g. ﬁ instead of fi). You may need to fix these manually.
*  For important NPCs (e.g. named one's, bosses or the BBEG), check them manually after the conversion!
*  Skills are almost never given in full in statblocks, sbc only fills in the ones given.

# Known Bugs
*  This is the first FoundryVTT v10 compatible release, as such it may include (many) bugs
*  Not all Statblocks are equally formatted. As long as its reasonably well formed, it should work. If not, check the preview area or console.
*  See Issues. If you find anythings thats not noted there, please let me know.

# To Do
*  Fix bugs

# Contact
Primer#2220 | FoundryVTT Discord