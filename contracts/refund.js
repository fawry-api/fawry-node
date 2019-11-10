const Joi = require('@hapi/joi');
const {amountRegex} = require('./patterns');

const schema = Joi.object({
	merchantCode: Joi.string().required(),
	referenceNumber: Joi.string().required(),
	refundAmount: Joi.string().pattern(amountRegex, 'money').required(),
	reason: Joi.string().required()
});

module.exports = schema;
