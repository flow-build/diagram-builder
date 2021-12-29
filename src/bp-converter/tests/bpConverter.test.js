const fs = require('fs')
const { BpConverter } = require("../bpConverter");

test('works with a complete, single lane diagram', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/listHierarchiesComplete.xml'
  const diagramData = fs.readFileSync(diagram)
  const blueprint = await converter.convert(diagramData);
  
  const expectedBp = require('./samples/listHierarchiesComplete')

  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();

  expect(blueprint).toMatchObject(expectedBp.blueprint)

  fs.writeFileSync(`assets/${blueprint.name}.json`, JSON.stringify(blueprint, null, 2));
})

test('single lane', async () => {
  const converter = new BpConverter();
  const diagram = 'src/bp-converter/tests/samples/noLane.bpmn'
  const diagramData = fs.readFileSync(diagram)
  const blueprint = await converter.convert(diagramData);
  
  expect(blueprint.name).toBeDefined();
  expect(blueprint.blueprint_spec).toBeDefined();
  expect(blueprint.blueprint_spec.nodes).toBeDefined();
  expect(blueprint.blueprint_spec.lanes).toBeDefined();
  expect(blueprint.blueprint_spec.prepare).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toBeDefined();
  expect(blueprint.blueprint_spec.requirements).toEqual(expect.arrayContaining(["core"]));
  expect(blueprint.blueprint_spec.environment).toBeDefined();
  
  fs.writeFileSync(`assets/${blueprint.name}.json`, JSON.stringify(blueprint, null, 2));
})