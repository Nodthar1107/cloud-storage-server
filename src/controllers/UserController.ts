import * as express from 'express';
import * as encrypt from 'crypto-js';

import { IUserCandidateDto } from '../dtos/IUserCandidateDto';
import { DB_API } from '../api/ApiHelper';
import { IUserDto } from '../dtos/IUsertDto';
import { ApiError } from '../exceptions/ApiError';
import { BadRequest } from '../exceptions/BadRequest';
import { ENCRYPT_SALT } from '../config';
import { IUser } from '../models/IUser';
import { AbstractBaseController } from './AbstracrBaseController';


export class UserController extends AbstractBaseController {
    public static async create(request: express.Request<{}, {}, IUserCandidateDto>, response: express.Response, next: express.NextFunction) {
        if (this.idSequence === -1) {
            await this.initializeIdSequence<IUser>('/users');
        }

        try {
            const candidate = request.body;

            const users = await (await DB_API.get('/users', { 'username': candidate.username })).json() as IUser[];

            if (users.length > 0) {
                throw new ApiError('Пользователь с таким именем уже существует');
            }

            if (candidate.password === candidate.confirmPassword) {
                throw new BadRequest('Пароли пользователя не совпадают');
            }

            const hashedPassword = encrypt.SHA256(candidate.password, { salt: ENCRYPT_SALT }).toString();

            const dbResponse = await DB_API.post(
                '/users',
                undefined,
                { body: JSON.stringify({ id: this.idSequence++, username: candidate.username, hashPassword: hashedPassword, imageUrl: '' } as IUser) }
            );

            if (dbResponse.status === 201) {
                const createdUser = await dbResponse.json() as IUser;

                return response
                    .status(201)
                    .json({
                        id: createdUser.id,
                        username: createdUser.username,
                        imageUrl: createdUser.imageUrl
                    } as IUserDto);
            }

            return response.status(500).json({ message: 'Server Error' });
        } catch (e) {
            return next(e);
        }
    }
}