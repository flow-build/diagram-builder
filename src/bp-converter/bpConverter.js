const xml2js = require('xml2js')
const _ = require('lodash')
const stripPrefix = require('xml2js').processors.stripPrefix;
const { logger } = require('../utils/logger');
const { validateBlueprint, validateNodes } = require('../utils/workflow.validator');

class BpConverter {
  constructor() {
    this.connectors = [];
    this.lanes = [];
    this.knownTypes = [
      'base', 'laneSet', 'task', 'userTask', 'serviceTask', 'endEvent', 'exclusiveGateway', 'subProcess', 'intermediateCatchEvent', 'startEvent', 'sequenceFlow'
    ]
    
    this.parameterDefaults = {
      Start: {
        input_schema: {},
        timeout: 0
      },
      userTask: {
        input: {},
        action: "",
        timeout: 0,
        activity_schema: {
          type: 'object',
          properties: {}
        }
      },
      systemTask: {
        input: {}
      },
      Flow: {
        input: {
          decision: ""
        }
      },
      Finish: {
        input: {}
      },
      subProcess: {
        input: {
          workflow_name: "",
          valid_response: ""
        },
        actor_data: ""
      },
      timer: {
        input: {},
        timeout: 0,
      }
    }
    this.categoryDefaults = {
      timer: 'timer',
      subProcess: 'subProcess',
      systemTask: ""
    }
    this.typeDefaults = {
      timer: 'systemTask',
      subProcess: 'systemTask'
    }
  }

  buildLanes() {
    logger.verbose(`[bpConverter] Build lanes`)

    if(!this.lanes) {
      logger.warn(`No lanes defined`)
      return []
    }

    return this.lanes.map(lane => { 
      logger.debug(`building lane ${lane.base.name}`)
      return { 
        id: lane.base.name, 
        name: lane.base.id, 
        rule: this.parseRule(lane.base.rule)
      }
    })
  }

  buildParameters(type) {
    logger.verbose(`[bpConverter] Build parameters`)
    const data = this.node.base.parameters;
    
    if(!data) {
      logger.warn(`parameters -> not defined for node [${this.node.base.name}]`)
      return this.parameterDefaults[type]
    }
  
    try {
      logger.debug(`parameters -> parsing ${type}`)
      if(typeof data === 'string') {
        return JSON.parse(data)
      } else {
        return data
      }
    } catch(e) {
      logger.error(`parameters -> unable to convert, error ${e}`)
    }
  }

  getCategory(type) {
    return this.node.base.category || this.categoryDefaults[type]
  }

  getLane() {
    if(this.lanes) {
      return this.lanes.find(lane => lane.flowNodeRef.includes(this.node.base.id)).base.name
    } else {
      return null
    }
  }
  
  getNext() {
    if(this.node.outgoing) {
      return this.connectors.find(connector => connector.base.id === this.node.outgoing[0]).base.targetRef
    } else {
      return null
    }
  }

  getNextFlow() {
    let result = {};
    this.connectors.forEach(connector => {
      if (connector.base.sourceRef === this.node.base.id) {
        const condition = connector.base.name || 'default';
        result[condition] = connector.base.targetRef
      }
    })
    return result;
  }

  getType(type) {
    return this.typeDefaults[type] || type
  }

  parseRule(rule) {
    logger.verbose(`[bpConverter] Parse Lane Rule`)
    
    if(!rule) {
      logger.warn(`rule not defined`)
      return null;
    }
  
    try {
      if(typeof rule === 'string') {
        return JSON.parse(rule)
      } else {
        return rule
      }
    } catch(e) {
      logger.error(`rule -> unable to convert, error ${e}`)
    }
  }

  buildNode(node, type) {
    logger.verbose(`[bpConverter] Build Node [${node.base.name}]`)

    this.node = node;
    
    return {
      id: this.node.base.id,
      name: this.node.base.name || "",
      type: this.getType(type),
      category: this.getCategory(type),
      next: type === "Flow" ? this.getNextFlow() : this.getNext(),
      lane_id: this.getLane(),
      parameters: this.buildParameters(type)
    }
  }

  async convert(data) {
    logger.info('[bpConverter] Convert Diagram');

    let baseJson = await xml2js.parseStringPromise(data, {
      explicitRoot: false,
      attrkey: 'base',
      tagNameProcessors: [stripPrefix],
      attrNameProcessors: [stripPrefix]
    });
  
    if(!baseJson.collaboration) {
      return {
        validation: {
          isValid: false,
          errors: [ { message: 'No pool defined' } ]
        }
      };
    }

    const elements = baseJson.process[0];
    const elementTypes = Object.keys(elements);
    const unknownTypes = _.difference(elementTypes, this.knownTypes)

    if(unknownTypes.length > 0) { logger.warn('unknown element types') }

    const tasks = baseJson.process[0].task;
    const workflow = baseJson.collaboration[0].participant[0];
    const userTasks = baseJson.process[0].userTask;
    const systemTasks = baseJson.process[0].serviceTask;
    const finishEvents = baseJson.process[0].endEvent;
    const flowEvents = baseJson.process[0].exclusiveGateway;
    const subProcesses = baseJson.process[0].subProcess;
    const timers = baseJson.process[0].intermediateCatchEvent?.filter(item => item.timerEventDefinition);
    const startEvents = baseJson.process[0].startEvent;

    this.lanes = baseJson.process[0]?.laneSet?.[0]?.lane;
    this.connectors = baseJson.process[0].sequenceFlow;
  
    logger.verbose(`workflow name: ${workflow.base.name}`)
  
    const nodes = [];
  
    startEvents.forEach(element => {
      nodes.push(this.buildNode(element, 'Start'))
    });

    if(tasks) {
      tasks.forEach(element => {
        nodes.push(this.buildNode(element, null))
      });  
    }

    if(userTasks) {
      userTasks.forEach(element => {
        nodes.push(this.buildNode(element, 'userTask'))
      });  
    }
  
    if(systemTasks) {
      systemTasks.forEach(element => {
        nodes.push(this.buildNode(element, 'systemTask'))
      });
    }
  
    if(flowEvents) {
      flowEvents.forEach(element => {
        nodes.push(this.buildNode(element, 'Flow'))
      });
    }

    if(finishEvents) {
      finishEvents.forEach(element => {
        nodes.push(this.buildNode(element, 'Finish'))
      });
    }

    if(subProcesses) {
      subProcesses.forEach(element => {
        nodes.push(this.buildNode(element, 'subProcess'))
      });
    }
    
    if(timers) {
      timers.forEach(element => {
        nodes.push(this.buildNode(element, 'timer'))
      });
    }

    const blueprint = {
      name: workflow.base.name || "",
      description: "",
      blueprint_spec: {
        requirements: ["core"],
        prepare: [],
        lanes: this.buildLanes(),
        environment: {},
        nodes
      }
    }
    
    const blueprintValidation = validateBlueprint(blueprint)
    const nodesValidation = validateNodes(nodes)

    return {
      blueprint,
      validations: {
        blueprint: blueprintValidation,
        nodes: nodesValidation,
        diagram: {
          unknownTypes
        }
      }
    };
  }
}

module.exports = {
  BpConverter,
};