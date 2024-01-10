import { BadRequest } from "../exceptions/BadRequest";
import { IHttpRequestOptions } from "./IHttpRequestOptions";

export class APIService {
    private API_ROOT_URL = 'http://localhost:9000';

    public async get(path: string, queryParams?: Record<string, string>): Promise<Response> {
        return this.makeRequest(path, 'GET', queryParams);
    }

    public async post(path: string, queryParams?: Record<string, string>, options?: IHttpRequestOptions): Promise<Response> {
        console.log(options);

        return await this.makeRequest(path, 'POST', queryParams, options);
    }

    public async put(path: string, queryParams: Record<string, string>, options?: IHttpRequestOptions): Promise<Response> {
        return this.makeRequest(path, 'PUT', queryParams, options);
    }

    public async delete(path: string, queryParams?: Record<string, string>, options?: IHttpRequestOptions): Promise<Response> {
        return this.makeRequest(path, 'DELETE', queryParams, options);
    }

    private async makeRequest(
        path: string,
        method: string,
        queryParams?: Record<string, string>,
        options?: IHttpRequestOptions
    ): Promise<Response> {
        const url = `${this.API_ROOT_URL}${path}${queryParams === undefined ? '' : '?' + this.resolveQueryParams(queryParams)}`; 

        console.log('body', options?.body);

        const response: Response = await fetch(url, {
            method: method,
            headers: options?.headers,
            body: options?.body
        });

        if (!response.ok) {
            throw new BadRequest('Server error');
        }

        return response;
    }

    private resolveQueryParams(queryParams: Record<string, string>): string {
        if (queryParams === undefined) {
            return '';
        }

        const badQuery = Object.entries(queryParams).reduce<string>((params: string, record: [string, string]) => {
            return params + `${record[0]}=${record[1]}&`;
        }, '');

        return badQuery.substring(0, badQuery.length - 1);
    }
}

export const DB_API = new APIService();