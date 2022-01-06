const fs = require('fs')
const { BpConverter } = require("../bpConverter");

test('works with a complete, all parameters, single lane diagram', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/listHierarchiesComplete.xml'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;
  
  const expectedBp = require('./samples/listHierarchiesComplete')

  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined(); ''
  expect(blueprint.blueprint_spec.nodes).toHaveLength(13);
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(1);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeTruthy();

  expect(blueprint).toMatchObject(expectedBp.blueprint)
})

test('works with a diagram with pool but no lane, returning validation errors', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/noLane.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;
  
  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toHaveLength(5);
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(0);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeFalsy();
})

test('works with all nodes elements (flowbuild version 2.5.0)', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/allNodeTypes.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;
  
  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toHaveLength(8);
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(1);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeFalsy();
})

test('works with all nodes elements (flowbuild version 2.5.0) and multiple lanes', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/multipleLanes.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;
  
  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toHaveLength(8);

  const maybeNodes = blueprint.blueprint_spec.nodes.filter(node => node.lane_id === 'maybeFree');

  expect(maybeNodes).toHaveLength(2);

  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(2);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeFalsy();
})

test('return error with no pool is defined', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/noPool.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  
  expect(result.validation.isValid).toBeFalsy();
  expect(result.validation.errors[0].message).toEqual('No pool defined');
  expect(result.blueprint).toBeUndefined();
})

test('works with pool but no types', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/noTypes.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;

  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toHaveLength(4);
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(0);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeFalsy();
})


test('ignore and report unknown types', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/unknownTypes.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const result = await converter.convert(diagramData);
  const blueprint = result.blueprint;
  
  fs.writeFileSync(`assets/teste.json`, JSON.stringify(blueprint, null, 2));

  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toHaveLength(4);
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toHaveLength(1);
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(result.validation.isValid).toBeFalsy();
  expect(result.unknownTypes).toBeDefined();
})