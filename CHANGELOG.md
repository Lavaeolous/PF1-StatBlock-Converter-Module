# Change Log

2021_02_15
*  Updated compatibility to PF1 System 0.77.9
*  Corrected Parsing of stats when there are derived values (e.g. dex for init) before the conversionValidation happens
*  Corrected conversionValidation for Abilities to account for changes in race, class or racialHD items (or items in general)
*  Updated the preview of meleeAttacks

2021_01_25
*  Reduced loading times by around 50%
*  Partial parsing of offense data (currently melee attacks)

2021_01_18
*  Initial Release of Version 3.0.0 in an alpha stadium, as currently offense data does not get parsed

2020_12_20
*  Fix for error in splitting tactics data from offense data

2020_12_18
*  Hotfix for missing subskills section in profession, art and craft skill
*  Fixed broken Skills Parsing. Now it's parsing skills again, but not all values may be correct for now.

2020_12_09
*  Hotfix for missing HP for Actors with classHD (but no racialHD) #342
*  Fix for wrongly set base value of spellbook cl ( now just setting that to value and total)

2020_12_04
*  Hotfix for spellRows with leading spaces

2020_12_01
*  Hotfix for v0.76.6 of Pathfinder 1E (Thanks Noon#3951 !)

2020_11_27
*  Hotfix for v0.76.5 of Pathfinder 1E

2020_11_26
*  Hotfix for v..76.5 of Pathfinder 1E

2020_11_21
*  Hotfix for Spell Settings

2020_10_30
*  Additional Bug Fixes (#278, #303, #302, #300, #304, #291, #317)

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