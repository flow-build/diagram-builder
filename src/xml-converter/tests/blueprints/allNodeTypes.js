module.exports = {
  workflow_id: "d1ff277d-aa11-4d6f-8ea3-7b3a8bdd8bd4",
  name: "allNodes",
  description: "Simple workflow with a flow node",
  blueprint_spec: {
    requirements: [],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "START NODE",
        parameters: {
          input_schema: {},
        },
        next: "SETTOBAG",
        lane_id: "1"
      },
      {
        id: "SETTOBAG",
        type: "systemTask",
        category: "setToBag",
        name: "SET TO BAG NODE",
        next: "FLOW",
        lane_id: "1",
        parameters: {
          input: {}
        }
      },
      {
        id: "FLOW",
        type: "Flow",
        name: "FLOW NODE",
        next: {
          1: "SCRIPT",
          default: "SUBPROCESS",
          2: "HTTP"
        },
        lane_id: "1",
        parameters: {
          input: {
            decision: { $ref: "result.value" }
          }
        }
      },
      {
        id: "HTTP",
        type: "systemTask",
        category: "http",
        name: "HTTP NODE",
        next: "USERTASK",
        lane_id: "1",
        parameters: {
          input: {}
        }
      },
      {
        id: "SCRIPT",
        type: "scriptTask",
        name: "SCRIPT NODE",
        next: "USERTASK",
        lane_id: "1",
        parameters: {
          input: {},
          script: {
            package: "",
            function: [
              "fn",
              ["&", "args"],
              [
                "js",
                ["`",
                  "const val = {'value': 2}; val"
                ]
              ],
            ],
          },
        }
      },
      {
        id: "SUBPROCESS",
        type: "systemTask",
        category: "subProcess",
        next: "USERTASK",
        name: "SUBPROCESS NODE",
        lane_id: "1",
        parameters: {
          input: {
            value: "1"
          }
        }
      },
      {
        id: "USERTASK",
        type: "userTask",
        next: "TIMER",
        name: "USER TASK NODE",
        lane_id: "1",
        parameters: {
          action: 'ANY',
          input: {
            value: "not 1"
          }
        }
      },
      {
        id: "TIMER",
        type: "systemTask",
        category: 'timer',
        next: "ABORT",
        name: "TIMER NODE",
        lane_id: "1",
        parameters: {
          timeout: 10,
          input: {}
        }
      },
      {
        id: "ABORT",
        type: "systemTask",
        category: 'abortProcess',
        next: "STARTPROCESS",
        name: "ABORT NODE",
        lane_id: "1",
        parameters: {
          input: {}
        }
      },
      {
        id: "STARTPROCESS",
        type: "systemTask",
        category: 'startProcess',
        next: "END",
        name: "START PROCESS NODE",
        lane_id: "1",
        parameters: {
          input: {}
        }
      },
      {
        id: "END",
        type: "Finish",
        name: "FINISH NODE",
        next: null,
        lane_id: "2"
      }
    ],
    lanes: [
      {
        id: "1",
        name: "i am true",
        rule: [
          "fn",
          [
            "&",
            "args"
          ],
          true
        ]
      },
      {
        id: "2",
        name: "i am false",
        rule: [
          "fn",
          [
            "&",
            "args"
          ],
          false
        ]
      }
    ],
    environment: {},
  }
}