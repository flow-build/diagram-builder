const { validateNodes, validateBlueprint } = require('../workflow.validator');
const { valid } = require('./samples/blueprint');
const { systemTask, unknownType } = require('./samples/nodes');

describe('node validator', () => {
  test('works valid systemTask, setToBag node', async () => {
    const node = [ systemTask['setToBag'] ];
    const result = validateNodes(node)
      
    expect(result.isValid).toBeTruthy();
    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  })
      
  test('return a warning to a system task with an unknown category', async () => {
    const node = [ systemTask['unknown'] ];
    const result = validateNodes(node)
      
    expect(result.isValid).toBeTruthy();
    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  })

  test('return a warning to a unknown type', async () => {
    const node = [ unknownType ];
    const result = validateNodes(node)
      
    console.log(result)

    expect(result.isValid).toBeTruthy();
    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  })

  test('return a warning and a error to a system task without category', async () => {
    const node = [ systemTask['undefined']  ];
    const result = validateNodes(node)
    
    expect(result.isValid).toBeTruthy();
    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  })
})

describe('blueprint validator', () => {
  test('works valid blueprint', async () => {
    const blueprint = valid
    const result = validateBlueprint(blueprint)
        
    expect(result.isValid).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  })
        
})