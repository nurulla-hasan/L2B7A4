
import express, { Application } from 'express'
import cors from 'cors'
import config from './config'
import cookieParser from 'cookie-parser';

const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());






app.get('/', (req, res) => {
    res.status(200).json({
        message : "Welcome to L2B7A4"
    })
})

export default app