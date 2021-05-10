const { XmlConverter } = require('./src/xml-converter/xml-converter');

async function buildXmlDiagram(blueprintSpec, workflowName, format=false) {
  const json2xml = new XmlConverter();
  json2xml.buildGraph(blueprintSpec, workflowName);
  return json2xml.to_xml(format);
}

module.exports = buildXmlDiagram;
