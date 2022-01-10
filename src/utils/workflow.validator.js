const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const { logger } = require("./logger");
const { nodeSchema, categorySchema } = require("./node.schema");
const { workflowSchema } = require("./workflow.schema");

const validateSchema = (schema, data) => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const isValid = validate(data);
  return {
    isValid,
    errors: validate.errors || [],
  };
};

const validateBlueprint = (blueprint) => {
  return validateSchema(workflowSchema, blueprint);
} 

const validateNodes = (nodes) => {
  logger.debug("[validateNodes]");
  
  const validations = nodes.map((node) => {
    logger.silly(`validating node ${node.name}`)
    const nodeType = node.type?.toLowerCase();
    
    let typeValidation = {};

    if (nodeSchema[nodeType]) {
      logger.silly(`[${node.name}] validating type [${node.type}]`);
      typeValidation = validateSchema(nodeSchema[nodeType], node);
      typeValidation.warning = false;
    } else {
      logger.info(`[${node.name}] bypassing type validation, no schema defined for type [${nodeType}]`);
      typeValidation.warning = true;
      typeValidation.isValid = true;
      typeValidation.errors = [{
        message: 'unknown type'
      }]
    }

    let nodeCategory;
    let parametersValidation = {};
    
    if (nodeType === "systemtask") {
      nodeCategory = node.category?.toLowerCase() || 'not defined';
    }

    if (nodeCategory) {
      logger.silly(`[${node.name}] validate category`);
      if (categorySchema[nodeCategory]) {
        parametersValidation = validateSchema(categorySchema[nodeCategory], node.parameters);
      } else {
        if(nodeCategory === 'not defined') {
          logger.info(`[${node.name}] bypassing parameters validation, no category defined`);   
        } else {
          logger.info(`[${node.name}] bypassing parameters validation, no schema defined for category [${nodeCategory}]`);
        }
        parametersValidation.warning = true;
        parametersValidation.isValid = true;
        parametersValidation.errors = [{
          message: "parameters schema not defined"
        }]
      }
    } else {
      parametersValidation.isValid = true;
    }

    return {
      data: node,
      warning: typeValidation.warning || parametersValidation.warning,
      isValid: typeValidation.isValid && parametersValidation.isValid,
      errors: [...(typeValidation.errors || []), ...(parametersValidation.errors || [])],
    };
  });

  return {
    isValid: true,
    warnings: validations.filter((item) => item.warning)
      .map((result) => {
        let response;
        response = {
          node: result.data.id,
          type: result.data.type,
          category: result.data.category,
          errors: result.errors.map((error) => {
            return {
              message: error.message,
            };
          }),
        };
        return response;
      }),
    errors: validations.filter((item) => !item.isValid)
      .map((result) => {
        let response;
        response = {
          node: result.data.id,
          type: result.data.type,
          category: result.data.category,
          errors: result.errors.map((error) => {
            return {
              field: error.instancePath,
              message: error.message,
            };
          }),
        };
        return response;
      }),
  }
  
};

module.exports = {
  validateBlueprint,
  validateNodes
};
