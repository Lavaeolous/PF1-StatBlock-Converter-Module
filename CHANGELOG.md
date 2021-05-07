# Change Log

2021_05_07 - v3.1.6
*  Hotfix for feat-parsing, where an error prevented feats to be found in custom compendia (#411)

2021_05_07 - v3.1.5
*  Fixed a bug where class names in the statblock source got incorrectly parsed as a class (#409)
*  Reworked the parsing of special abilities to also parse abilities without type-keywords (Su, Sp, Ex) and added an info message to inform the user about this. Also reclassified these errors as warnings so the statblock can be parsed incomplete if errors occur (#408)
*  Added replacement for ligatures, which up until now broke sbc when copied from pdfs (#405)
*  Added parsing of Special Attacks (#390), for now just as placeholders (see #410)
*  Added line numbers to the input field to more easily identify "unwanted" linebreaks
*  Added more status info into the placeholder text of the input field to inform users who do not frequent the git.

2021_05_02 - v3.1.4
*  Fixed a bug where additional attack effects were not parsed (#395)
*  Added damage in attack effects to nonCritDamageParts of attacks (#394)
*  Fixed missing wordboundary in regex for resistance parsing (#403)
*  Fixed a bug where weaknesses were not parsed correctly and not entered into the preview (#402)
*  Fixed a bug where regeneration and fast healing (as special cases of hdAbilities) were not parsed into the correct fields in the sheet (#401)
*  Fixed errors in the languageParser (missing trim, etc.) (#396)
*  Added Title-Case-Formatting for the name of the creature (#393)
*  Fixed findEntityInCompendium() by a) escaping "+"-signs (#398), b) fixing a couple of bugs regarding the usage of custom compendia (#399, #397)
*  Changed the max-height of the preview area to 500px to prevent large statblocks from making the error area unreachable (#351)
*  Fixed a bug where damage reduction was not parsed (#400)

2021_04_28 - v3.1.3
*  Fixed an error where custom compendia were not handled correctly when entered with extra spaces (#388) 

2021_04_27 - v3.1.2
*  Fixed an error where custom compendia were not handled correctly when searching for existing entities (#386)

2021_04_26 - v3.1.1
*  Changed handling of set flags (e.g. "isUndead") to only run when needed (#385)
*  Reworked the way hp and hd get parsed so that all three kinds of cases get handled correctly. Namely cases where the statblock represents a npc with JUST Racial HD, JUST Class HD or a mix of both. (#365)
*  Fixed error where parts of the hd/hp line would get double parsed as a hpAbility (#382)
*  Added "Monk" and "Wis" to valid armorClassTypes (#381)
*  Added rangeIncrements to ranged weapons and melee weapons that can be thrown in sbcContent.attackDamageTypes (#380)
*  Added support for ranged attacks parsing the default range for a given weapon (#380)
*  Added support for ranged attack parsing (#379)
*  Fixed error in the attack modifier calculation for masterwork and enhanced weapons (#378)
*  Added handling of racial modifiers in the skills section by ignoring these (as they are already included in the skill totals given in the statblock) (#9 - WOW! This was an old one).


2021_04_23 - v3.1.0
*  Added parsing of ranged attacks (#379)
*  Fixed #377 so that statisticData gets parsed correctly
*  Fixed errors in the calculation of attack modifiers and damage modifiers for attacks, especially for attacks with bows (which don't get a strength bonus).

2021_04_21 - v3.0.3
*  Updated compatibility to PF1 System 0.77.21
*  Fixed Copy & Paste Error in Morale parsing (#373)
*  Reworked the sequence in which categories get parsed in (#376)
*  Started rework on the attack parsing, as these was flawed rather spectacularily with attacks regularily achieving over +50 modifiers :). This relates to issues #374, #375 and fixes #357 mostly - i think.
*  Changed the manifest file to always point to the latest release. I think updates via foundry may have been broken for some time, but i'm not really sure. Let me know.

2021_04_19 - v3.0.2
*  Hotfix for #362
*  Fix for missing abilities in statblock preview (#370)
*  Fix for missed identification of rage as a valid armor modificator type (#369). Rage is not supported as a valid change in the pf1 system, but statblocks including rage armor modificators in the ac-line will no longer break sbc
*  Reworked the hp calculation and fixed giant errors in the validation of the hp calculation via conversion buff (#368)

2021_04_14 - v3.0.1
*  Updated compatibility to PF1 System 0.77.20
*  Fixed broken token settings which led to missing configuration for prototype tokens
*  Added additional resets for intermediary data, e.g. objects that store data in temporary actors (which up until now never got removed when the input changed)
*  In the same vein: Added a reset for data set via flags, e.g. when CHA was used for HP and Fort for undead creatures.

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