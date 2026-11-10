import axios from 'axios'

export const api = axios.create({
	baseURL:
		'https://shelf-behaviour-transaction-northeast.trycloudflare.com/api',
})
