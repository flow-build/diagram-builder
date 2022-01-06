require('jest-xml-matcher')
const { XmlConverter } = require('../xmlConverter');
const fs = require('fs')
const BpmnModdle = require('bpmn-moddle');
const moddle = new BpmnModdle();

const simpleWorkflow = require('./blueprints/simple-workflow');
const scriptExample = require('./blueprints/script-example');
const lanesExample = require('./blueprints/lanes-example');
const allNodeTypes = require('./blueprints/allNodeTypes');

const startNode = simpleWorkflow.blueprint_spec.nodes[0];
const systemTaskNode = simpleWorkflow.blueprint_spec.nodes[1];
const finishNode = simpleWorkflow.blueprint_spec.nodes[2];
const scriptNode = scriptExample.blueprint_spec.nodes[1];

function write(element) {
  return moddle.toXML(element, { preamble: false });
}

describe('buildGraph', () => {
  test('should throw an error for an empty blueprint', () => {
    const converter = new XmlConverter();
    const result = converter.buildGraph({});
    expect(result.error).toBeDefined();
  });
})

describe('Sequence parser', () => {
  test('should work for a startNode', async () => {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:sequenceFlow xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'id="Flow_1_2" sourceRef="Node_1" targetRef="Node_2" />';

    const tagObj = converter.parseSequenceFlow(startNode)[0];
    const { xml } = await write(tagObj);

    expect(xml).toEqual(expectedXML);
  })
})

describe('Node Parser', () => { 
  test("Id index bijection", async () => {
    const converter = new XmlConverter();
    const id2index = converter.buildNodesId2Index(simpleWorkflow.blueprint_spec.nodes);
    const expected = { "1": 0, "2": 1, "99": 2 };

    expect(id2index).toStrictEqual(expected);
  });

  test("Simple node rank discover", async () => {
    const converter = new XmlConverter();
    const id2index = converter.buildNodesId2Index(simpleWorkflow.blueprint_spec.nodes);
    const { id2rank } = converter.discoverNodeRanks(simpleWorkflow.blueprint_spec, id2index);
    const expected = { "Node_1": [0, 0], "Node_2": [1, 0], "Node_99": [2, 0] };

    expect(id2rank).toStrictEqual(expected);
  });

  test("Start node", async function () {
    const converter = new XmlConverter();
    const sequences = converter.buildSequenceFlows(simpleWorkflow.blueprint_spec.nodes);
    const expectedXML = '<bpmn:startEvent xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Node_1" name="Start node">' +
      '<bpmn:outgoing>Flow_1_2</bpmn:outgoing>' +
      '</bpmn:startEvent>';

    const tagObj = converter.parseNode(startNode, sequences.incoming_flows);
    const { xml } = await write(tagObj);
    expect(xml).toEqual(expectedXML);
  });

  it("Finish node", async function () {
    const converter = new XmlConverter();
    const sequences = converter.buildSequenceFlows(simpleWorkflow.blueprint_spec.nodes);
    
    const expectedXML = '<bpmn:endEvent xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Node_99" name="Finish node">' +
      '<bpmn:incoming>Flow_2_99</bpmn:incoming>' +
      '</bpmn:endEvent>';

    const tagObj = converter.parseNode(finishNode, sequences.incoming_flows);
    const { xml } = await write(tagObj);
    expect(xml).toEqual(expectedXML);
  });

  it("System task node", async function () {
    const converter = new XmlConverter();
    const sequences = converter.buildSequenceFlows(simpleWorkflow.blueprint_spec.nodes);
    
    const expectedXML = '<bpmn:serviceTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Node_2" name="Set to bag node">' +
      '<bpmn:incoming>Flow_1_2</bpmn:incoming>' +
      '<bpmn:outgoing>Flow_2_99</bpmn:outgoing>' +
      '</bpmn:serviceTask>';

    const tagObj = converter.parseNode(systemTaskNode, sequences.incoming_flows);
    const { xml } = await write(tagObj);
    expect(xml).toEqual(expectedXML);
  });

  it('Script task node', async function () {
    const converter = new XmlConverter();
    const sequences = converter.buildSequenceFlows(scriptExample.blueprint_spec.nodes);

    const expectedXML = '<bpmn:scriptTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Node_2" name="Script tag">' +
      '<bpmn:incoming>Flow_1_2</bpmn:incoming>' +
      '<bpmn:outgoing>Flow_2_99</bpmn:outgoing>' +
      '</bpmn:scriptTask>';

    const tagObj = converter.parseNode(scriptNode, sequences.incoming_flows);
    const { xml } = await write(tagObj);
    expect(xml).toEqual(expectedXML);
  })
})

describe('Lane parser', () => {
  test("should work for a single lane", async () => {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:laneSet xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Global_LaneSet">' +
      '<bpmn:lane id="Lane_99" name="everyone">' +
      '<bpmn:flowNodeRef>Node_1</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_2</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_99</bpmn:flowNodeRef>' +
      '</bpmn:lane>' +
      '</bpmn:laneSet>';

    converter.buildGraph(simpleWorkflow);

    const { xml } = await write(converter.xml_laneset);
    expect(xml).toEqual(expectedXML);
  });

  test("should work for multiple lanes", async () => {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:laneSet xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Global_LaneSet">' +
      '<bpmn:lane id="Lane_1" name="initialLane">' +
      '<bpmn:flowNodeRef>Node_1</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_2</bpmn:flowNodeRef>' +
      '</bpmn:lane>' +
      '<bpmn:lane id="Lane_2" name="finalLane">' +
      '<bpmn:flowNodeRef>Node_3</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_99</bpmn:flowNodeRef>' +
      '</bpmn:lane>' +
      '</bpmn:laneSet>';

    converter.buildGraph(lanesExample);

    const { xml } = await write(converter.xml_laneset);
    expect(xml).toEqual(expectedXML);
  })
});

describe('Collab parser', () => {
  test("Create participant tag", async function () {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:participant xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Global_Actor" name="SIMPLE_WORKFLOW" processRef="Global_Process" />';

    converter.buildGraph(simpleWorkflow);
    const { xml } = await write(converter.xml_participant);
    expect(xml).toEqual(expectedXML);

  });

  test("Create collab tag", async function () {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:collaboration xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="Global_Colab" workflowId="ec1949b8-a2d6-4e9d-8cec-648bc13d3c49">' +
      '<bpmn:participant id="Global_Actor" name="SIMPLE_WORKFLOW" processRef="Global_Process" />' +
      '</bpmn:collaboration>';

    converter.buildGraph(simpleWorkflow);
    const { xml } = await write(converter.xml_collab);
    expect(xml).toEqual(expectedXML);

  });

  test("Build process tag", async function () {
    const converter = new XmlConverter();
    const expectedXML = '<bpmn:process xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Global_Process" isExecutable="true">' + '<bpmn:laneSet id="Global_LaneSet">' +
      '<bpmn:lane id="Lane_99" name="everyone">' +
      '<bpmn:flowNodeRef>Node_1</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_2</bpmn:flowNodeRef>' +
      '<bpmn:flowNodeRef>Node_99</bpmn:flowNodeRef>' +
      '</bpmn:lane>' +
      '</bpmn:laneSet>' +
      '<bpmn:startEvent id="Node_1" name="Start node">' +
      '<bpmn:outgoing>Flow_1_2</bpmn:outgoing>' +
      '</bpmn:startEvent>' +
      '<bpmn:serviceTask id="Node_2" name="Set to bag node">' +
      '<bpmn:incoming>Flow_1_2</bpmn:incoming>' +
      '<bpmn:outgoing>Flow_2_99</bpmn:outgoing>' +
      '</bpmn:serviceTask>' +
      '<bpmn:endEvent id="Node_99" name="Finish node">' +
      '<bpmn:incoming>Flow_2_99</bpmn:incoming>' +
      '</bpmn:endEvent>' +
      '<bpmn:sequenceFlow id="Flow_1_2" sourceRef="Node_1" targetRef="Node_2" />' +
      '<bpmn:sequenceFlow id="Flow_2_99" sourceRef="Node_2" targetRef="Node_99" />' +
      '</bpmn:process>';

    converter.buildGraph(simpleWorkflow);
    const { xml } = await write(converter.xml_process);
    expect(xml).toEqual(expectedXML);
  });
});

describe('xml generator', () => {
  test('simple workflow', async () => {
    const converter = new XmlConverter();
    const diagram = fs.readFileSync('src/xml-converter/tests/diagrams/simpleWorkflow.bpmn', 'UTF-8')
    converter.buildGraph(simpleWorkflow);
    const result = await converter.to_xml();
    //fs.writeFileSync(`assets/result.bpmn`, result);
    expect(result).toEqualXML(diagram);
  });

  test('all engine version 2.5.0 default node types', async () => {
    const converter = new XmlConverter();
    const diagram = fs.readFileSync('src/xml-converter/tests/diagrams/allNodes.bpmn', 'UTF-8')
    converter.buildGraph(allNodeTypes);
    const result = await converter.to_xml();
    fs.writeFileSync(`assets/allnodes.bpmn`, result);
    expect(result).toEqualXML(diagram);
  });
});
