const Joi = require('@hapi/joi');

const schema = Joi.object({
	merchantCode: Joi.string().required(),
	merchantRefNum: Joi.string().required(),
	customerProfileId: Joi.string().required(),
	amount: Joi.number().precision(2).required(),
	description: Joi.string().required(),
	customerMobile: Joi.string().required(),
	chargeItems: [{
		itemId: Joi.string().required(),
		description: Joi.string().required(),
		price: Joi.number().precision(2).required(),
		quantity: Joi.number().integer().required()
	}],

	currencyCode: Joi.string(),
	cardToken: Joi.string(),
	customerEmail: Joi.string().email(),
	paymentMethod: Joi.string(),
	paymentExpiry: Joi.number().integer()
})
	.when('.paymentMethod', {
		is: Joi.valid('CARD'),
		then: Joi.object({
			cardToken: Joi.required()
		})
	});

module.exports = schema;
