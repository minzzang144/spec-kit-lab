const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${BASE_URL}${url}`, {
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		const errorBody = await response.json();
		throw errorBody;
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export const httpClient = {
	async get<T>(url: string): Promise<T> {
		return request<T>(url, { method: 'GET' });
	},

	async post<T>(url: string, body: unknown): Promise<T> {
		return request<T>(url, {
			method: 'POST',
			body: JSON.stringify(body),
		});
	},

	async put<T>(url: string, body: unknown): Promise<T> {
		return request<T>(url, {
			method: 'PUT',
			body: JSON.stringify(body),
		});
	},

	async delete<T>(url: string): Promise<T> {
		return request<T>(url, { method: 'DELETE' });
	},
};
