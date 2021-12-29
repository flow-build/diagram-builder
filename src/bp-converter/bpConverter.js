const xml2js = require('xml2js')
const stripPrefix = require('xml2js').processors.stripPrefix;
const { logger } = require('../utils/logger');
const { validateBlueprint, validateNodes } = require('../utils/workflow.validator');

class BpConverter {
  constructor() {
    this.connectors = [];
    this.lanes = [];
    this.parameterDefaults = {
      Start: {
        input_schema: {},
        timeout: 600
      },
      userTask: {
        input: {},
        action: "",
        timeout: 600,
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
      }
    }
  }

  getLane() {
    if(this.lanes) {
      return this.lanes.find(lane => lane.flowNodeRef.includes(this.node.base.id)).base.name
    } else {
      return null
    }
  }

  buildLanes() {
    logger.verbose(`building lanes`)
    if(this.lanes) {
      return this.lanes.map(lane => { 
        logger.debug(`building lane ${lane.base.name}`)
        return { 
          id: lane.base.name, 
          name: lane.base.id, 
          rule: this.parseRule(lane.base.rule)
        }
      })
    } else {
      logger.warn(`No lanes defined`)
      return []
    }
  }

  parseRule(rule) {
    let result;

    if(!rule) {
      logger.warn(`rule -> not defined`)
      return null;
    }
  
    try {
      logger.debug(`rule -> parsing`)
      if(typeof rule === 'string') {
        result = JSON.parse(rule)
      } else {
        result = rule
      }
    } catch(e) {
      logger.error(`rule -> unable to convert, error ${e}`)
    }
    return result
  }

  getNext() {
    if(this.node.outgoing) {
      return this.connectors.find(connector => connector.base.id === this.node.outgoing[0]).base.targetRef
    } else {
      return null
    }
  }

  buildFlowNext() {
    let result = {};
    this.connectors.forEach(connector => {
      if (connector.base.sourceRef === this.node.base.id) {
        const condition = connector.base.name || 'default';
        result[condition] = connector.base.targetRef
      }
    })
    return result;
  }

  buildParameters(type) {
    const data = this.node.base.parameters;
    let result = this.parameterDefaults[type]
  
    if(!data) {
      logger.warn(`parameters -> not defined for node [${this.node.base.name}]`)
      return result;
    }
  
    try {
      logger.debug(`parameters -> parsing ${type}`)
      if(typeof data === 'string') {
        result = JSON.parse(data)
      } else {
        result = data
      }
    } catch(e) {
      logger.error(`parameters -> unable to convert, error ${e}`)
    }
    return result
  }

  buildNode(node, type) {
    this.node = node;
    logger.debug(`building ${this.node.base.name} nodes, id [${this.node.base.id}]`)
    return {
      id: this.node.base.id,
      name: this.node.base.name || "",
      type,
      category: this.node.base.category,
      next: type === "Flow" ? this.buildFlowNext() : this.getNext(),
      lane_id: this.getLane(),
      parameters: this.buildParameters(type)
    }
  }

  async convert(data) {
    logger.info('starting conversion');

    let baseJson = await xml2js.parseStringPromise(data, {
      explicitRoot: false,
      attrkey: 'base',
      tagNameProcessors: [stripPrefix],
      attrNameProcessors: [stripPrefix]
    });
  
    const tasks = baseJson.process[0].task;
    const workflow = baseJson.collaboration[0].participant[0];
    const userTasks = baseJson.process[0].userTask;
    const systemTasks = baseJson.process[0].serviceTask;
    const finishEvents = baseJson.process[0].endEvent;
    const flowEvents = baseJson.process[0].exclusiveGateway;
    const startEvents = baseJson.process[0].startEvent;
    this.lanes = baseJson.process[0]?.laneSet?.[0]?.lane;
    this.connectors = baseJson.process[0].sequenceFlow;
  
    logger.verbose(`workflow name: ${workflow.base.name}`)
  
    const nodes = [];
  
    startEvents.forEach(element => {
      logger.debug('building start nodes')
      nodes.push(this.buildNode(element, 'Start'))
    });

    if(tasks) {
      tasks.forEach(element => {
        logger.debug('building tasks')
        nodes.push(this.buildNode(element, null))
      });  
    }

    if(userTasks) {
      userTasks.forEach(element => {
        logger.debug('building userTasks')
        nodes.push(this.buildNode(element, 'userTask'))
      });  
    }
  
    if(systemTasks) {
      systemTasks.forEach(element => {
        logger.debug('building systemTasks')
        nodes.push(this.buildNode(element, 'systemTask'))
      });
    }
  
    if(flowEvents) {
      flowEvents.forEach(element => {
        logger.debug('building flow nodes')
        nodes.push(this.buildNode(element, 'Flow'))
      });
    }

    if(finishEvents) {
      finishEvents.forEach(element => {
        logger.debug('building finish nodes')
        nodes.push(this.buildNode(element, 'Finish'))
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
    logger.info('conversion done!')   

    const blueprintValidation = await validateBlueprint(blueprint)
    const nodesValidation = await validateNodes(nodes)

    return {
      blueprint,
      validation: blueprintValidation,
      nodesValidation
    };
  }
}

module.exports = {
  BpConverter,
};