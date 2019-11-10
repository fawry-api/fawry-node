const Joi = require('@hapi/joi');

const schema = Joi.object({
	fawrySecureKey: Joi.string().required(),
	isSandbox: Joi.boolean()
});

module.exports = schema;
