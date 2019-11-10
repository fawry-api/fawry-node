const Joi = require('@hapi/joi');

const schema = Joi.object({
	merchantCode: Joi.string().required(),
	merchantRefNumber: Joi.string().required()
});

module.exports = schema;
