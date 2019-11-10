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

const init = ({
	fawrySecureKey,
	isSandbox = false
} = {}) => {
	const request = axios.create({
		baseURL: getUrl(isSandbox)
	});

	return {
		request,
		charge: data => {
			const signature = getSignature(
				data.merchantCode,
				data.merchantRefNum,
				data.customerProfileId,
				data.paymentMethod,
				formatAmount(data.amount),
				data.cardToken || '',
				fawrySecureKey
			);

			return request.post('charge', {
				...data,
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
