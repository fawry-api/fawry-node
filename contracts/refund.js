const Joi = require('@hapi/joi');

const schema = Joi.object({
	merchantCode: Joi.string().required(),
	referenceNumber: Joi.string().required(),
	refundAmount: Joi.number().precision(2).required(),
	reason: Joi.string().required()
});

module.exports = schema;
