import express, { Application } from 'express'
import cors from 'cors'
import httpStatus from 'http-status'
import config from './config'
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';

const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
    res.status(httpStatus.OK).json({
        message : 'Welcome to L2B7A4'
    })
})

app.use(globalErrorHandler);
app.use(notFound);

export default app
