module.exports = {
  "workflow_id": "ec1949b8-a2d6-4e9d-8cec-648bc13d3c49",
  "name": "SIMPLE_WORKFLOW",
  "description": "Simple workflow used to validation",
  "blueprint_spec": {
    "requirements": ["core"],
    "prepare": [],
    "environment": {},
    "nodes": [
      {
        "id": "1",
        "name": "Start node",
        "next": "2",
        "type": "Start",
        "lane_id": "99",
        "parameters": {
          "input_schema": {}
        }
      },
      {
        "id": "2",
        "name": "Set to bag node",
        "next": "99",
        "type": "SystemTask",
        "lane_id": "99",
        "category": "setToBag",
        "parameters": {
          "input": {
            "creatorId": {
              "$ref": "actor_data.actor_id"
            }
          }
        }
      },
      {
        "id": "99",
        "name": "Finish node",
        "next": null,
        "type": "Finish",
        "lane_id": "99",
        "parameters": {
          "input_schema": {}
        }
      }
    ],
    "lanes": [
      {
        "id": "99",
        "name": "everyone",
        "rule": [
          "fn",
          [
            "&",
            "args"
          ],
          true
        ]
      }
    ]
  }
}