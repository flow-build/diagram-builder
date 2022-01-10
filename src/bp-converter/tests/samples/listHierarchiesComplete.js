module.exports = {
  blueprint: {
    name: "listHierarchies",
    description: "",
    blueprint_spec: {
      "requirements": [
        "core"
      ],
      "prepare": [],
      "lanes": [
        {
          "id": "authenticated",
          "name": "Lane_06b21u0",
          "rule": [
            "fn",
            [
              "&",
              "args"
            ],
            true
          ]
        }
      ],
      "environment": {},
      "nodes": [
        {
          "id": "StartEvent_1",
          "name": "START LIST HIERARCHIES",
          "type": "Start",
          "next": "Activity_14aiamf",
          "lane_id": "authenticated",
          "parameters": {
            "input_schema": {}
          }
        },
        {
          "id": "Activity_0ezazka",
          "name": "UPDATE HIERARCHIES",
          "type": "userTask",
          "next": "Event_18vsnl1",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "hierarchies": {
                "$js": "({bag, result})=> bag.hierarchies.map((hierarchy) => {\n hierarchy[\"quantidade\"] = bag.members.filter(\n        (member) => member.hierarchy_id === hierarchy.id\n    ).length;\n    const leader = result.profiles.find(prof => prof.actor_id === bag.members.find((member) => member.hierarchy_id === hierarchy.id).parent_id)\n    hierarchy[\"leader\"] = leader ? leader.name + ' ' + leader.lastname + ' - ' + leader.email : \"Não possui líder\"\n return hierarchy;\n});"
              }
            },
            "action": "UPDATE_HIERARCHIES"
          }
        },
        {
          "id": "Activity_1r35oz7",
          "name": "GET PROFILE",
          "type": "systemTask",
          "next": "Activity_0ezazka",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "account_id": {
                "$ref": "actor_data.account_id"
              }
            }
          }
        },
        {
          "id": "Activity_1dxd78s",
          "name": "BAG MEMBERS",
          "type": "systemTask",
          "next": "Activity_1r35oz7",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "members": {
                "$ref": "result.members"
              }
            }
          }
        },
        {
          "id": "Activity_10snt2r",
          "name": "GET MEMBER",
          "type": "systemTask",
          "next": "Activity_1dxd78s",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "account_id": {
                "$ref": "bag.account_id"
              }
            }
          }
        },
        {
          "id": "Activity_12qmsou",
          "name": "BAG HIERARCHIES",
          "type": "systemTask",
          "next": "Activity_10snt2r",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "hierarchies": {
                "$js": "({result}) => result.hierarchies.filter(h => h.type !== 'global')"
              }
            }
          }
        },
        {
          "id": "Activity_1cn06ly",
          "name": "GET HIERARCHY BY ACTOR ID",
          "type": "systemTask",
          "next": "Activity_12qmsou",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "actor_id": {
                "$ref": "actor_data.actor_id"
              },
              "account_id": {
                "$ref": "actor_data.account_id"
              }
            }
          }
        },
        {
          "id": "Activity_00knxhx",
          "name": "GET HIERARCHY BY ACCOUNT ID",
          "type": "systemTask",
          "next": "Activity_12qmsou",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "account_id": {
                "$ref": "actor_data.account_id"
              }
            }
          }
        },
        {
          "id": "Activity_0gx1q15",
          "name": "GET ACCOUNT",
          "type": "systemTask",
          "next": "Gateway_00k0jf1",
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "account_id": {
                "$ref": "actor_data.account_id"
              }
            }
          }
        },
        {
          "id": "Activity_14aiamf",
          "name": "CONFIG",
          "type": "systemTask",
          "next": "Gateway_0s4h0t0",
          "lane_id": "authenticated",
          "parameters": {
            "input": {}
          }
        },
        {
          "id": "Gateway_00k0jf1",
          "name": "TEAM IS RESTRICTED",
          "type": "Flow",
          "next": {
            "true": "Activity_1cn06ly",
            "default": "Activity_00knxhx"
          },
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "decision_key": {
                "$js": "({result,actor_data}) => result.accounts.find(acc => acc.id === actor_data.account_id).configuration"
              }
            }
          }
        },
        {
          "id": "Gateway_0s4h0t0",
          "name": "USER IS ADMIN",
          "type": "Flow",
          "next": {
            "default": "Activity_0gx1q15",
            "true": "Activity_00knxhx"
          },
          "lane_id": "authenticated",
          "parameters": {
            "input": {
              "decision_key": {
                "$js": "({actor_data}) => actor_data.claims.includes('admin')"
              }
            }
          }
        },
        {
          "id": "Event_18vsnl1",
          "name": "FINISH LIST HIERARCHIES",
          "type": "Finish",
          "lane_id": "authenticated",
          "parameters": {
            "input": {}
          }
        }
      ]
    }
  }
}