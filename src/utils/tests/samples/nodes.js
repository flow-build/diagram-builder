const systemTask = {
  setToBag: {
    id: "a string",
    name: "another string",
    next: "one more string",
    type: "systemTask",
    category: "setToBag",
    lane_id: "just a string",
    parameters: {
      input: {}
    }
  },
  unknown: {
    id: "a string",
    name: "another string",
    next: "one more string",
    type: "systemTask",
    category: "whatever",
    lane_id: "just a string",
    parameters: {
      input: {}
    }
  },
  undefined: {
    id: "a string",
    name: "another string",
    next: "one more string",
    type: "systemTask",
    lane_id: "just a string",
    parameters: {
      input: {}
    }
  }
}

const unknownType = {
  id: "a string",
  name: "another string",
  next: "one more string",
  type: "unknown",
  lane_id: "just a string",
  parameters: {
    input: {}
  }
}

module.exports = {
  systemTask,
  unknownType
}