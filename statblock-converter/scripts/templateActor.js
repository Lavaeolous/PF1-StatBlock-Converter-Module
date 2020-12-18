export default {
  "id": "",
  "name": "Template NPC",
  "type": "npc",
  "data": {
    "abilities": {
      "str": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "carryBonus": 0,
        "carryMultiplier": 1,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      },
      "dex": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      },
      "con": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      },
      "int": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      },
      "wis": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      },
      "cha": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0,
        "base": 10,
        "baseMod": 0
      }
    },
    "resources": {},
    "attributes": {
      "encumbrance": {
        "level": 0,
        "levels": {
          "light": 33,
          "medium": 66,
          "heavy": 100,
          "carry": 200,
          "drag": 500
        },
        "carriedWeight": 0
      },
      "vision": {
        "lowLight": false,
        "darkvision": 0
      },
      "hpAbility": "con",
      "cmbAbility": "str",
      "hd": {
        "total": 0,
        "max": {
          "_deprecated": true,
          "value": 0
        }
      },
      "naturalAC": 0,
      "ac": {
        "normal": {
          "value": 0,
          "total": 10
        },
        "touch": {
          "value": 0,
          "total": 10
        },
        "flatFooted": {
          "value": 0,
          "total": 10
        }
      },
      "bab": {
        "value": 0,
        "total": 0
      },
      "cmd": {
        "value": 0,
        "total": 10,
        "flatFootedTotal": 10
      },
      "cmb": {
        "value": 0,
        "total": 0
      },
      "sr": {
        "formula": "",
        "total": 0
      },
      "saveNotes": "",
      "acNotes": "",
      "cmdNotes": "",
      "srNotes": "",
      "attack": {
        "general": 0,
        "melee": 0,
        "ranged": 0
      },
      "damage": {
        "general": 0,
        "weapon": 0,
        "spell": 0
      },
      "maxDexBonus": null,
      "mDex": {
        "armorBonus": 0,
        "shieldBonus": 0
      },
      "acp": {
        "gear": 0,
        "encumbrance": 0,
        "total": 0,
        "armorBonus": 0,
        "shieldBonus": 0
      },
      "energyDrain": 0,
      "quadruped": false,
      "savingThrows": {
        "fort": {
          "total": 0,
          "ability": "con"
        },
        "ref": {
          "total": 0,
          "ability": "dex"
        },
        "will": {
          "total": 0,
          "ability": "wis"
        }
      },
      "hp": {
        "value": 0,
        "min": -100,
        "max": 0,
        "temp": 0,
        "nonlethal": 0
      },
      "wounds": {
        "min": 0,
        "value": 0,
        "max": 20
      },
      "vigor": {
        "min": 0,
        "value": 0,
        "temp": 0,
        "max": 0
      },
      "init": {
        "value": 0,
        "bonus": 0,
        "total": 0
      },
      "prof": 2,
      "speed": {
        "land": {
          "base": 30,
          "total": 30
        },
        "climb": {
          "base": 0,
          "total": 0
        },
        "swim": {
          "base": 0,
          "total": 0
        },
        "burrow": {
          "base": 0,
          "total": 0
        },
        "fly": {
          "base": 0,
          "total": 0,
          "maneuverability": "average"
        }
      },
      "conditions": {
        "bleed": false,
        "blind": false,
        "confused": false,
        "dazzled": false,
        "deaf": false,
        "entangled": false,
        "fatigued": false,
        "exhausted": false,
        "grappled": false,
        "helpless": false,
        "incorporeal": false,
        "invisible": false,
        "paralyzed": false,
        "pinned": false,
        "prone": false,
        "fear": false,
        "sickened": false,
        "staggered": false,
        "stunned": false
      },
      "spells": {
        "usedSpellbooks": [],
        "spellbooks": {
          "primary": {
            "name": "Primary",
            "class": "",
            "cl": {
              "base": 0,
              "value": 0,
              "total": 0,
              "formula": ""
            },
            "concentration": 0,
            "concentrationFormula": "",
            "concentrationNotes": "",
            "clNotes": "",
            "ability": "int",
            "autoSpellLevels": true,
            "arcaneSpellFailure": true,
            "baseDCFormula": "10 + @sl + @ablMod",
            "spontaneous": false,
            "spellPoints": {
              "useSystem": false,
              "value": 0,
              "max": 0,
              "maxFormula": "",
              "restoreFormula": ""
            },
            "spellSlotAbilityBonusFormula": "",
            "domainSlotValue": 1,
            "spells": {
              "spell0": {
                "base": null,
                "max": 0
              },
              "spell1": {
                "base": null,
                "max": 0
              },
              "spell2": {
                "base": null,
                "max": 0
              },
              "spell3": {
                "base": null,
                "max": 0
              },
              "spell4": {
                "base": null,
                "max": 0
              },
              "spell5": {
                "base": null,
                "max": 0
              },
              "spell6": {
                "base": null,
                "max": 0
              },
              "spell7": {
                "base": null,
                "max": 0
              },
              "spell8": {
                "base": null,
                "max": 0
              },
              "spell9": {
                "base": null,
                "max": 0
              }
            }
          },
          "secondary": {
            "name": "Secondary",
            "class": "",
            "cl": {
              "base": 0,
              "value": 0,
              "total": 0,
              "formula": ""
            },
            "concentration": 0,
            "concentrationFormula": "",
            "concentrationNotes": "",
            "clNotes": "",
            "ability": "int",
            "autoSpellLevels": true,
            "arcaneSpellFailure": true,
            "baseDCFormula": "10 + @sl + @ablMod",
            "spontaneous": false,
            "spellPoints": {
              "useSystem": false,
              "value": 0,
              "max": 0,
              "maxFormula": "",
              "restoreFormula": ""
            },
            "spellSlotAbilityBonusFormula": "",
            "domainSlotValue": 1,
            "spells": {
              "spell0": {
                "base": null,
                "max": 0
              },
              "spell1": {
                "base": null,
                "max": 0
              },
              "spell2": {
                "base": null,
                "max": 0
              },
              "spell3": {
                "base": null,
                "max": 0
              },
              "spell4": {
                "base": null,
                "max": 0
              },
              "spell5": {
                "base": null,
                "max": 0
              },
              "spell6": {
                "base": null,
                "max": 0
              },
              "spell7": {
                "base": null,
                "max": 0
              },
              "spell8": {
                "base": null,
                "max": 0
              },
              "spell9": {
                "base": null,
                "max": 0
              }
            }
          },
          "tertiary": {
            "name": "Tertiary",
            "class": "",
            "cl": {
              "base": 0,
              "value": 0,
              "total": 0,
              "formula": ""
            },
            "concentration": 0,
            "concentrationFormula": "",
            "concentrationNotes": "",
            "clNotes": "",
            "ability": "int",
            "autoSpellLevels": true,
            "arcaneSpellFailure": true,
            "baseDCFormula": "10 + @sl + @ablMod",
            "spontaneous": false,
            "spellPoints": {
              "useSystem": false,
              "value": 0,
              "max": 0,
              "maxFormula": "",
              "restoreFormula": ""
            },
            "spellSlotAbilityBonusFormula": "",
            "domainSlotValue": 1,
            "spells": {
              "spell0": {
                "base": null,
                "max": 0
              },
              "spell1": {
                "base": null,
                "max": 0
              },
              "spell2": {
                "base": null,
                "max": 0
              },
              "spell3": {
                "base": null,
                "max": 0
              },
              "spell4": {
                "base": null,
                "max": 0
              },
              "spell5": {
                "base": null,
                "max": 0
              },
              "spell6": {
                "base": null,
                "max": 0
              },
              "spell7": {
                "base": null,
                "max": 0
              },
              "spell8": {
                "base": null,
                "max": 0
              },
              "spell9": {
                "base": null,
                "max": 0
              }
            }
          },
          "spelllike": {
            "name": "Spell-likes",
            "class": "_hd",
            "cl": {
              "base": 0,
              "value": 0,
              "total": 0,
              "formula": ""
            },
            "concentration": 0,
            "concentrationFormula": "",
            "concentrationNotes": "",
            "clNotes": "",
            "ability": "cha",
            "autoSpellLevels": true,
            "arcaneSpellFailure": true,
            "baseDCFormula": "10 + @sl + @ablMod",
            "spontaneous": false,
            "spellPoints": {
              "useSystem": false,
              "value": 0,
              "max": 0,
              "maxFormula": "",
              "restoreFormula": ""
            },
            "spellSlotAbilityBonusFormula": "",
            "domainSlotValue": 1,
            "spells": {
              "spell0": {
                "base": null,
                "max": 0
              },
              "spell1": {
                "base": null,
                "max": 0
              },
              "spell2": {
                "base": null,
                "max": 0
              },
              "spell3": {
                "base": null,
                "max": 0
              },
              "spell4": {
                "base": null,
                "max": 0
              },
              "spell5": {
                "base": null,
                "max": 0
              },
              "spell6": {
                "base": null,
                "max": 0
              },
              "spell7": {
                "base": null,
                "max": 0
              },
              "spell8": {
                "base": null,
                "max": 0
              },
              "spell9": {
                "base": null,
                "max": 0
              }
            }
          }
        }
      },
      "spellcasting": {
        "_deprecated": true
      },
      "spelldc": {
        "_deprecated": true
      },
      "spellLevel": 0
    },
    "details": {
      "level": {
        "value": 0,
        "min": 0,
        "max": 40
      },
      "bonusFeatFormula": "",
      "alignment": "tn",
      "biography": {
        "value": "",
        "public": ""
      },
      "notes": {
        "value": "",
        "public": ""
      },
      "bonusSkillRankFormula": "",
      "type": "",
      "environment": "",
      "cr": {
        "base": 1,
        "total": 1
      },
      "xp": {
        "value": 0
      }
    },
    "skills": {
      "acr": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "apr": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "art": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "blf": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "clm": {
        "value": 0,
        "ability": "str",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "crf": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false,
        "subSkills": {}
      },
      "dip": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "dev": {
        "value": 0,
        "ability": "dex",
        "rt": true,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "dis": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "esc": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "fly": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "han": {
        "value": 0,
        "ability": "cha",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "hea": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "int": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "kar": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "kdu": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "ken": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "kge": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "khi": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "klo": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "kna": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "kno": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "kpl": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "kre": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "lin": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "lor": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "per": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "prf": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "pro": {
        "value": 0,
        "ability": "wis",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "rid": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "sen": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "slt": {
        "value": 0,
        "ability": "dex",
        "rt": true,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": true,
        "cs": false
      },
      "spl": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "ste": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "sur": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "swm": {
        "value": 0,
        "ability": "str",
        "rt": false,
        "acp": true,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      },
      "umd": {
        "value": 0,
        "ability": "cha",
        "rt": true,
        "acp": false,
        "rank": 0,
        "mod": 0,
        "background": false,
        "cs": false
      }
    },
    "customSkills": {},
    "traits": {
      "size": "med",
      "senses": "",
      "dr": "",
      "eres": "",
      "cres": "",
      "regen": "",
      "fastHealing": "",
      "languages": {
        "value": [],
        "custom": ""
      },
      "di": {
        "value": [],
        "custom": ""
      },
      "dv": {
        "value": [],
        "custom": ""
      },
      "ci": {
        "value": [],
        "custom": ""
      },
      "perception": {
        "_deprecated": true
      }
    },
    "currency": {
      "pp": 0,
      "gp": 0,
      "sp": 0,
      "cp": 0
    },
    "altCurrency": {
      "pp": 0,
      "gp": 0,
      "sp": 0,
      "cp": 0
    }
  },
  "sort": 100000,
  "flags": {
    "exportSource": {
      "world": "",
      "system": "pf1",
      "coreVersion": "",
      "systemVersion": ""
    }
  },
  "token": {
    "flags": {
      "pf1": {
        "staticSize": false,
        "lowLightVision": true,
        "disableLowLight": false
      }
    },
    "name": "",
    "displayName": 20,
    "img": "icons/svg/mystery-man.svg",
    "tint": "",
    "width": 1,
    "height": 1,
    "scale": 1,
    "lockRotation": false,
    "rotation": 0,
    "vision": true,
    "dimSight": 0,
    "brightSight": 0,
    "dimLight": 0,
    "brightLight": 0,
    "sightAngle": 360,
    "lightAngle": 360,
    "lightAlpha": 1,
    "lightAnimation": {
      "speed": 5,
      "intensity": 5,
      "type": ""
    },
    "actorId": "",
    "actorLink": false,
    "disposition": -1,
    "displayBars": 20,
    "bar1": {
        "attribute": "attributes.hp"
    },
    "bar2": {},
    "randomImg": false,
    "mirrorX": false,
    "mirrorY": false,
    "lightColor": ""
  },
  "items": [],
  "effects": []
}