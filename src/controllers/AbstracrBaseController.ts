import { DB_API } from "../api/ApiHelper";

export interface IInitializationType {
    id: number;
}

export class AbstractBaseController {
    protected idSequence = -1;

    protected async initializeIdSequence<T extends IInitializationType>(path: string) {
        const entity = (await (await DB_API.get(path)).json()) as T[];

        if (entity.length === 0) {
            this.idSequence = 0;

            return;
        }

        this.idSequence = ++entity[entity.length - 1].id;
    }
}