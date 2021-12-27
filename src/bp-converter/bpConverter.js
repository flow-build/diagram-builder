const fs = require('fs')
const xml2js = require('xml2js')

const converter = async () => {
  const parser = new xml2js.Parser();
  const data = fs.readFileSync('assets/listHierarchiesEdited.xml')
  const baseJson = await parser.parseStringPromise(data)
  const userTasks = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:userTask'];
  const systemTasks = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:serviceTask']
  const finishEvents = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:endEvent'];
  const flowEvents = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:exclusiveGateway'];
  const startEvents = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:startEvent'];
  const lanes = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:laneSet'][0]['bpmn:lane'];
  const connectors = baseJson['bpmn:definitions']['bpmn:process'][0]['bpmn:sequenceFlow'];

  const nodes = [];

  startEvents.forEach(element => {
    let node = {
      id: element['$'].id,
      name: element['$'].name,
      type: 'Start',
      next: connectors.find(connector => connector['$'].id === element['bpmn:outgoing'][0])['$'].targetRef,
      lane_id: lanes.find(lane => lane['bpmn:flowNodeRef'].includes(element['$'].id))['$'].name,
      parameters: {
        input_schema: {}
      }
    }
    nodes.push(node)
  });

  finishEvents.forEach(element => {
    let node = {
      id: element['$'].id,
      name: element['$'].name,
      type: 'Finish',
      next: null,
      lane_id: lanes.find(lane => lane['bpmn:flowNodeRef'].includes(element['$'].id))['$'].name
    }
    nodes.push(node)
  });

  userTasks.forEach(element => {
    let node = {
      id: element['$'].id,
      name: element['$'].name,
      type: 'userTask',
      next: connectors.find(connector => connector['$'].id === element['bpmn:outgoing'][0])['$'].targetRef,
      lane_id: lanes.find(lane => lane['bpmn:flowNodeRef'].includes(element['$'].id))['$'].name,
      parameters: {
        input: {},
        action: ""
      }
    }
    nodes.push(node)
  });

  systemTasks.forEach(element => {

    let parameters = {};
    if (element['$']['custom:parameters']) {
      try{
        parameters = element['$']['custom:parameters']
      } catch(e) {
        console.log(element['$'].name)
        console.log(element['$']['custom:parameters'])
      }
    }

    let node = {
      id: element['$'].id,
      name: element['$'].name,
      type: 'systemTask',
      category: element['$']['custom:category'],
      next: connectors.find(connector => connector['$'].id === element['bpmn:outgoing'][0])['$'].targetRef,
      lane_id: lanes.find(lane => lane['bpmn:flowNodeRef'].includes(element['$'].id))['$'].name,
      parameters
    }
    nodes.push(node)
  });

  flowEvents.forEach(element => {

    let next = {}

    connectors.forEach(connector => {
      if (connector['$'].sourceRef ===  element['$'].id) {
        const condition = connector['$'].name || 'default';
        next[condition] = connector['$'].targetRef
      }
    })

    let node = {
      id: element['$'].id,
      name: element['$'].name,
      type: 'Flow',
      next,
      lane_id: lanes.find(lane => lane['bpmn:flowNodeRef'].includes(element['$'].id))['$'].name,
      parameters: element['$']['custom:parameters'] || { input: { decision: {} } },
    }
    nodes.push(node)
  });

  console.log('lanes', lanes)

  console.log('nodes', nodes)
}

converter();