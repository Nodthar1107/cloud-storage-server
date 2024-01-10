import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { UserController } from './controllers/UserController';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api', router);
app.use(errorMiddleware);

app.use((_: express.Request, response: express.Response) => {
  return response.status(404).json({ message: 'Page not found' });
})

router.get('/', (_: express.Request, response: express.Response) => {
  console.log('request');
  return response.send('Hello world');
});

router.post('/create', (request: express.Request, response: express.Response, next: express.NextFunction) => {
  console.log("Post");
  return UserController.create(request, response, next);
})

app.listen(5000, () => {
  console.log('Listened on 5000 port');
});
