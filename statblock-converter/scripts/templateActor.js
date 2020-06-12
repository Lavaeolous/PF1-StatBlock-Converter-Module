export default {
  "name": "templateNPC",
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
        "userPenalty": 0
      },
      "dex": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0
      },
      "con": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0
      },
      "int": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0
      },
      "wis": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0
      },
      "cha": {
        "total": 10,
        "mod": 0,
        "value": 10,
        "checkMod": 0,
        "damage": 0,
        "drain": 0,
        "penalty": 0,
        "userPenalty": 0
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
      "hd": {
        "base": {
          "_deprecated": true,
          "value": 0
        },
        "total": 1,
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
      "cmbNotes": "",
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
      "acp": {
        "gear": 0,
        "encumbrance": 0,
        "total": 0
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
        "base": 0,
        "max": 0,
        "temp": null,
        "nonlethal": null
      },
      "wounds": {
        "min": 0,
        "value": 0
      },
      "vigor": {
        "min": 0,
        "value": 0,
        "temp": 0
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
          "total": null
        },
        "swim": {
          "base": 0,
          "total": null
        },
        "burrow": {
          "base": 0,
          "total": null
        },
        "fly": {
          "base": 0,
          "total": null,
          "maneuverability": "average"
        }
      },
      "conditions": {
        "blind": false,
        "dazzled": false,
        "deaf": false,
        "entangled": false,
        "fatigued": false,
        "exhausted": false,
        "grappled": false,
        "helpless": false,
        "paralyzed": false,
        "pinned": false,
        "fear": false,
        "sickened": false,
        "stunned": false
      },
      "spells": {
        "concentration": {
          "bonus": 0,
          "context": ""
        },
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
            "spells": {
              "spell0": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell1": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell2": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell3": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell4": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell5": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell6": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell7": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell8": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell9": {
                "value": 0,
                "max": 0,
                "base": null
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
            "spells": {
              "spell0": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell1": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell2": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell3": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell4": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell5": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell6": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell7": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell8": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell9": {
                "value": 0,
                "max": 0,
                "base": null
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
            "spells": {
              "spell0": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell1": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell2": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell3": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell4": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell5": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell6": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell7": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell8": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell9": {
                "value": 0,
                "max": 0,
                "base": null
              }
            }
          },
          "spelllike": {
            "name": "Spell-likes",
            "class": "_hd",
            "cl": {
              "base": 0,
              "value": 0,
              "total": 1,
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
            "spells": {
              "spell0": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell1": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell2": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell3": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell4": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell5": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell6": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell7": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell8": {
                "value": 0,
                "max": 0,
                "base": null
              },
              "spell9": {
                "value": 0,
                "max": 0,
                "base": null
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
      "spellLevel": 0,
      "mods": {
        "skills": {}
      }
    },
    "details": {
      "level": {
        "value": 0,
        "min": 0,
        "max": 40
      },
      "alignment": "",
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
      "cr": 1,
      "xp": {
        "value": 400
      }
    },
    "skills": {
      "acr": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "apr": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "art": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true,
        "subSkills": {}
      },
      "blf": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "clm": {
        "value": 0,
        "ability": "str",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "crf": {
        "value": 0,
        "ability": "int",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true,
        "subSkills": {}
      },
      "dip": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "dev": {
        "value": 0,
        "ability": "dex",
        "rt": true,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "dis": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "esc": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "fly": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "han": {
        "value": 0,
        "ability": "cha",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "hea": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "int": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "kar": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "kdu": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "ken": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "kge": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "khi": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "klo": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "kna": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "kno": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "kpl": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "kre": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "lin": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "lor": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true,
        "subSkills": {}
      },
      "per": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "prf": {
        "value": 0,
        "ability": "cha",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true,
        "subSkills": {}
      },
      "pro": {
        "value": 0,
        "ability": "wis",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true,
        "subSkills": {}
      },
      "rid": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "sen": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "slt": {
        "value": 0,
        "ability": "dex",
        "rt": true,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": true
      },
      "spl": {
        "value": 0,
        "ability": "int",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "ste": {
        "value": 0,
        "ability": "dex",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "sur": {
        "value": 0,
        "ability": "wis",
        "rt": false,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "swm": {
        "value": 0,
        "ability": "str",
        "rt": false,
        "acp": true,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
      },
      "umd": {
        "value": 0,
        "ability": "cha",
        "rt": true,
        "acp": false,
        "rank": 0,
        "notes": "",
        "mod": 0,
        "background": false
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
    },
    "classes": {}
  },
  "sort": 100001,
  "flags": {
    "pf1": {},
    "exportSource": {
      "world": "rappan-athuk",
      "system": "pf1",
      "coreVersion": "0.6.0",
      "systemVersion": 0.56
    }
  },
  "token": {
    "flags": {},
    "name": "templateNPC",
    "displayName": 0,
    "img": "icons/svg/mystery-man.svg",
    "width": 1,
    "height": 1,
    "scale": 1,
    "lockRotation": false,
    "rotation": 0,
    "vision": false,
    "dimSight": 0,
    "brightSight": 0,
    "dimLight": 0,
    "brightLight": 0,
    "sightAngle": 360,
    "lightAngle": 360,
    "lightAlpha": 1,
    "actorId": "QlJH0KiscySfUlCb",
    "actorLink": false,
    "actorData": {},
    "disposition": -1,
    "displayBars": 0,
    "bar1": {},
    "bar2": {},
    "randomImg": false
  },
  "items": [],
  "_id": "QlJH0KiscySfUlCb",
  "img": "icons/svg/mystery-man.svg"
}