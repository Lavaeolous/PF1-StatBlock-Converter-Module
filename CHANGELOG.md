# Change Log

2022_11_23 - v4.0.3
*  Fixed critical bugs regarding wrong attack (#613, #616) and ac (#609, #610) calculations
*  Fixed attack and action generation (#618, #620, #616)
*  Fixed critical error in treasure parsing (#614)
*  Fixed preview generation in the notes section (#619)
*  Fixed parsing of primary natural attacks (#617)

2022_10_30 - v4.0.2
*  I had a v4.0.1 but lost in while building a new pc :shrug:
*  Fixed the preview generation, as some fields were not filled correctly (#603)
*  Added a method to parse NPC Gear when it is found in the treasure section (by editing the input and reparsing everything ...) (see discussion in #601)

2022_09_26 - v4.0.0
*  Breaking: v10 of FoundryVTT introduced breaking changes to the underlying data model.
*  Breaking: sbc v4.0.0+ will not work with FoundryVTT v9 or earlier
*  Breaking: sbc v3.4.0 or earlier will not work with Foundry v10+
*  Changed the data model used according to FoundryVTT v10, for a list of all changes, see [PR #595](https://github.com/Lavaeolous/PF1-StatBlock-Converter-Module/pull/595)

2022_06_27 - v3.4.0
*  Breaking: v0.81.0 of the PF1e system introduced a new attack / action system with is not compatible with version 3.3.6 or earlier of sbc!
*  Added support for the new attack / action system (#544, #543, #542, #540, #539, #536, #535, #534)
*  Fixed a bug where attack effects included an empty entry in their array (#533)
*  Added a method to change the attack ability to dex when the weapon finesse feat is found in the statblock (#538)
*  Fixed a critical error that led to sbc changing compendium entities (#541)

2022_05_30 - v3.3.6
*  Fixed an error with placeholders for non playable races (#527)
*  Updated the parsing of senses to be compatible to the current pf1e system version (#525, #523)
*  Fixed an error when parsing constant spells (#520)
*  Fixed parsing of consumables (#519)
*  Fixed parsing of Resistances and Spell Resistance (#518)

2022_04_11 - v3.3.5
*  Merged multiple important PRs from mkahvi (#514, #510, #509, #507) that fix a whole range of issues (#513, #511, #508, #506)
*  Refactored string clean up for skills to only work in the skills section (Fixes #515)
*  Escaped Asterisks (Fixed #505)
*  Fixed an error that lead to every other item being parsed as placeholder because of weird ways pattern.test(input) changes the index of strings while searching (Fixes #504)

2022_02_09 - v3.3.4
* Fix for gear parsing, e.g. Combat Gear and Other Gear on separate lines (#488)
* Fix for wrongly calculated BAB for attacks with enchanted weapons (#503)

2021_12_21 - v3.3.3
*  Updated compatibility to FoundryVTT v9 stable
*  Fixed a minor bug where brightSight and mineSight was parsed as string instead of int (#494)
*  Disabled pre-indexing of all compendiums at start, as it seems it's no longer needed (#493)
*  Rearranged the order of compendia to search through with `findInCompendia()` so that customCompendia get searched first (again?) (#496)
*  Fixed a bug where the toggle for prototypeToken vision settings was ignored (#495)
*  Fixed improper tag creation for classes/racialHD (e.g. for `magical beast` and `monstrous humanoid`) (#482)

2021_11_24 - v3.3.2
*  **Merge Request** from `dmrickey`
*  Add specificity to mark style override, to prevent incompatibilities to other modules using the `<mark></mark>` tag.

*  **Merge Request** from `JustNoon`
*  Too many to note here in full, so see https://github.com/Lavaeolous/PF1-StatBlock-Converter-Module/pull/489 for all the details
*  Sanitizing, adding fallbacks, refactoring, changing RegEx searches to tests, etc.
*  A lot of work, thats very much appreciated! Thanks a lot Noon!

2021_07_08 - v3.3.1
*  **Added support for `findInCompendia()`, a PF1 system function, that greatly improves the loading times of SBC** (#469,#470)
*  **Fixed brokeness under PF1 0.78.14** (#475)
*  Added support for landspeeds denoted by "Spd" instead of "Speed" (#476)
*  Fixed an error which prevented CMD and CMB of "-" to be parsed (#474)
*  Fixed an error in the parsing of attackgroups which lead to incorrectly separated attacks (#468)
*  Fixed attack parsing for attacks without damage (#473)
*  Fixed an error, where defensive abilities that included the keyword "resist" were not parsed correctly (#467)
*  Fixed an error in spell parsing, where sometimes sbc tried to create empty spells (#465)

2021_06_01 - v3.3.0
*  **Updated SBC to work with FoundryVTT 8.x (#425)**
*  Fixed a bug where custom compendia were not correctly searched for specific equipment types (#444)
*  Fixed a bug where certain speeds could not be parsed correctly (#459)
*  Fixed a bug where skills with subskills were parsed incorrectly (#452), which led to malformed changes in the conversion buff (#456)
*  Negative save modifiers could not be parsed (#454), which is now fixed. Saves without a "+" or "-" glyph now can be parsed as well (as positive modifiers)
*  Fixed a calculation error for spell dcs, where instead of calculating a spell dc offset the total included in the statblock was used as offset (#449, #448)
*  Changed the documents/feats created for tactics and ecology information to now only use one item instead of multiple (#453)
*  Migrating to 0.8.x led to an error, where attack modifiers and attack damage were not entered correctly in attacks. This is now fixed (#441, #442)
*  Changed SBC to work in the new document based structure of FoundryVTT, which led to multiple bug manifestations (#445, #439, #440, #439, #438)

2021_05_21 - v3.2.2
*  Fixed a bug where LN and LG Alignments broke the import (#437)
*  Added support for "Any Aligment" aligments (#431)
*  Refactored spellparsing (#436, #435, #434, #433, #432, #423, #422)
*  Added support for natural attacks with prefix' (#430)
*  Refactored parsing of auras (#429, #428, #427, #426)
*  Fixed a bug where classes without archetypes had empty brackets in the name (#421)

2021_05_16 - v3.2.1
*  Added a progress bar (#419)
*  Fixed a bug where context notes in the AC section broke sbc (#417)
*  Fixed a bug where non-numeric characters in the HP section where parsed (#416)
*  Fixed a bug where the generation of PC-Actors was broken (#414)

2021_05_12 - v3.2.0
*  Added spell-parsing (#383. #329 partial)
*  Fixed a bug where class names with suffix (e.g. "Cleric of Rovagug") failed to parse (#413)


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