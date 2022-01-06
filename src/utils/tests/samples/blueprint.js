const valid = {
  "name": "unknownTypes",
  "description": "",
  "blueprint_spec": {
    "requirements": [
      "core"
    ],
    "prepare": [],
    "lanes": [
      {
        "id": "free",
        "name": "free",
        "rule": ["fn",["&","args"],true]
      }
    ],
    "environment": {},
    "nodes": [
      {
        "id": "1",
        "name": "START",
        "type": "Start",
        "next": "2",
        "lane_id": "free",
        "parameters": {
          "input_schema": {},
          "timeout": 0
        }
      },
      {
        "id": "2",
        "name": "TWO",
        "type": "systemTask",
        "category": "setToBag",
        "next": "3",
        "lane_id": "free",
        "parameters": {
          "input": {
            "decision": ""
          }
        }
      },
      {
        "id": "3",
        "name": "END",
        "type": "Finish",
        "next": null,
        "lane_id": "free",
        "parameters": {
          "input": {}
        }
      }
    ]
  }
}

module.exports = {
  valid
}