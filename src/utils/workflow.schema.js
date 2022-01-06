const workflowSchema = {
  type: "object",
  properties: {
    workflow_id: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string" },
    version: { type: "integer" },
    blueprint_hash: { type: "string" },
    blueprint_spec: {
      type: "object",
      properties: {
        requirements: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
        },
        prepare: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
        },
        environment: { type: "object" },
        parameters: { type: "object" },
        lanes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              rule: { 
                oneOf: [
                  { type: "array" },
                  { 
                    type: "object",
                    required: ["$js"],
                    properties: {
                      $js: { "type": 'string' }
                    }
                  }
                ]
              }
            },
            additionalProperties: false,
            required: ["id", "name", "rule"],
          },
          uniqueItems: true,
          minItems: 1,
        },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              category: { type: "string" },
              lane_id: { type: "string" },
              next: {
                oneOf: [
                  { type: "object" },
                  { type: "string" },
                  { type: "null" },
                ],
              },
              parameters: { type: "object" },
            },
            required: ["id", "name", "type", "lane_id", "next"],
          },
          minItems: 2,
        },
      },
      required: ["requirements", "prepare", "environment", "lanes", "nodes"],
    }
  },
  required: ["name", "description", "blueprint_spec"],
};
  
module.exports = {
  workflowSchema,
};
  