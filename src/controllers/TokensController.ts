import * as express from 'express';
import * as encrypt from 'crypto-js';
import * as jsonwebtoken  from 'jsonwebtoken';

import { IUserDto } from '../dtos/IUsertDto';
import { AbstractBaseController } from './AbstracrBaseController';
import { IJwtRecord } from '../models/IJwtRecord';
import { DB_API } from '../api/ApiHelper';
import { BadRequest } from '../exceptions/BadRequest';
import { IUser } from '../models/IUser';
import { ENCRYPT_SALT, JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } from '../config';
import { ServerError } from '../exceptions/ServerError';

export class TokenController extends AbstractBaseController {
    public static async createTokensPair(request: express.Request<{}, {}, IUserDto>, response: express.Response, next: express.NextFunction) {
        try {
            if (this.idSequence === -1) {
                this.initializeIdSequence<IJwtRecord>('/tokens');
            }
    
            const users = (await(await DB_API.get('/users', { username: request.body.username })).json()) as IUser[];

            if (users.length === 0) {
                throw new BadRequest('Пользователь с таким логином не существует');
            }

            if (users[0].hashPassword !== encrypt.SHA256(users[0].hashPassword, { salt: ENCRYPT_SALT }).toString()) {
                throw new BadRequest('Введен некоректный пароль');
            }

            const user = users[0];
            const acessToken = jsonwebtoken.sign({ id: user.id }, JWT_ACCESS_TOKEN, { expiresIn: '15m' });
            const refreshToken = jsonwebtoken.sign({ id: user.id }, JWT_REFRESH_TOKEN, { expiresIn: '30d' });

            const dbResponse = await DB_API.post(
                '/tokens', {
                    body: JSON.stringify({ id: this.idSequence++, refreshToken: refreshToken, userId: user.id } as IJwtRecord) 
                });

            if (dbResponse.status === 201) {
                return response
                    .status(200)
                    .cookie(
                        'refreshToken',
                        JSON.stringify({ refreshToken: refreshToken }),
                        { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }
                    ).cookie(
                        'accessToken',
                        JSON.stringify({ refreshToken: acessToken }),
                        { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }                        
                    );
            }

            throw new ServerError('Server error');
        } catch (e) {
            return next(e);
        }
    }
}