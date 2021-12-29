const fs = require('fs')
const { BpConverter } = require("../bpConverter");


test('works with a complete, single lane diagram', async () => {
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

test('works with a diagram without lane, returning validation errors', async () => {
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