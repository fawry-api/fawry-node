'use strict';

const crypto = require('crypto');
const axios = require('axios');

const API_PATH = '/ECommerceWeb/Fawry/payments/';
const BASE_URL = 'https://www.atfawry.com';
const SANDBOX_BASE_URL = 'https://atfawry.fawrystaging.com';

const getUrl = isSandbox => (isSandbox ? SANDBOX_BASE_URL : BASE_URL) + API_PATH;
const formatAmount = amount => amount.toFixed(2);
const getSignature = (...strings) => {
	return crypto
		.createHash('sha256')
		.update(strings.join(strings, ''))
		.digest('hex');
};

const init = config => {
	const {fawrySecureKey, isSandbox = false} = config;

	const schema = require('./contracts/init');
	const {error} = schema.validate(config);

	if (error) {
		throw error;
	}

	const request = axios.create({
		baseURL: getUrl(isSandbox)
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

		refund: data => {
			const signature = getSignature(
				data.merchantCode,
				data.referenceNumber,
				formatAmount(data.refundAmount),
				data.reason,
				fawrySecureKey
			);

			return request.post('refund', {
				...data,
				signature
			});
		},

		status: params => {
			const signature = getSignature(
				params.merchantCode,
				params.merchantRefNumber,
				fawrySecureKey
			);

			return request.get('status', {
				...params,
				signature
			});
		}
	};
};

module.exports = {
	init
};
