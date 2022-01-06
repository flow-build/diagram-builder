const { XmlConverter } = require('./src/xml-converter/xmlConverter');
const { BpConverter } = require('./src/bp-converter/bpConverter');

async function buildXmlDiagram(blueprintSpec, workflowName, format=false) {
  const json2xml = new XmlConverter();
  json2xml.buildGraph(blueprintSpec, workflowName);
  return json2xml.to_xml(format);
}

async function buildBlueprintFromBpmn(diagram) {
  const converter = new BpConverter();
  return await converter.convert(diagram);
}

module.exports = {
  buildXmlDiagram,
  buildBlueprintFromBpmn
};
