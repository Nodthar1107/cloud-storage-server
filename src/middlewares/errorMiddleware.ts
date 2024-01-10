import * as express from 'express';
import { BadRequest } from '../exceptions/BadRequest';

export function errorMiddleware(error: Error, _: express.Request, response: express.Response) {
    if (error instanceof BadRequest) {
        return response.status(400).json({ message: 'Bad request', details: error.message });
    }

    return response.status(500).json({ message: 'Server error' });
}