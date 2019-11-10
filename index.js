'use strict';

const crypto = require('crypto');
const axios = require('axios');
const Joi = require('@hapi/joi');
const queryString = require('query-string');

const API_PATH = '/ECommerceWeb/Fawry/payments/';
const BASE_URL = 'https://www.atfawry.com';
const SANDBOX_BASE_URL = 'https://atfawry.fawrystaging.com';

const getUrl = isSandbox => (isSandbox ? SANDBOX_BASE_URL : BASE_URL) + API_PATH;
const getSignature = (...strings) => {
	return crypto
		.createHash('sha256')
		.update(strings.join(''))
		.digest('hex');
};

const validateCallbackParams = ({fawrySecureKey, params} = {}) => {
	const signature = getSignature(
		params.fawryRefNumber,
		params.merchantRefNum,
		params.paymentAmount,
		params.orderAmount,
		params.orderStatus,
		params.paymentMethod,
		params.paymentRefrenceNumber,
		fawrySecureKey
	);

	const {error} = Joi.assert(
		signature,
		Joi.valid(params.messageSignature),
		'Invalid Signature'
	);

	if (error) {
		throw error;
	}

	return params;
};

const init = config => {
	const {fawrySecureKey, isSandbox = false} = config;

	const schema = require('./contracts/init');
	const {error} = schema.validate(config);

	if (error) {
		throw error;
	}

	const request = axios.create({
		baseURL: getUrl(isSandbox),
		paramsSerializer: params => queryString.stringify(params, {encode: false})
	});

	return {
		request,
		charge: (data = {}) => {
			const schema = require('./contracts/charge');
			const {error, value} = schema.validate(data);

			if (error) {
				throw error;
			}

			const signature = getSignature(
				value.merchantCode,
				value.merchantRefNum,
				value.customerProfileId,
				value.paymentMethod,
				value.amount,
				value.cardToken || '',
				fawrySecureKey
			);

			return request.post('charge', {
				...value,
				signature
			});
		},

		refund: (data = {}) => {
			const schema = require('./contracts/refund');
			const {error, value} = schema.validate(data);

			if (error) {
				throw error;
			}

			const signature = getSignature(
				value.merchantCode,
				value.referenceNumber,
				value.refundAmount,
				value.reason,
				fawrySecureKey
			);

			return request.post('refund', {
				...value,
				signature
			});
		},

		status: (params = {}) => {
			const schema = require('./contracts/status');
			const {error, value} = schema.validate(params);

			if (error) {
				throw error;
			}

			const signature = getSignature(
				value.merchantCode,
				value.merchantRefNumber,
				fawrySecureKey
			);

			return request.get('status', {
				params: {
					...value,
					signature
				}
			});
		}
	};
};

module.exports = {
	init,
	validateCallbackParams
};
