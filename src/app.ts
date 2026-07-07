import express, { Application } from 'express'
import cors from 'cors'
import httpStatus from 'http-status'
import config from './config'
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import { authRoutes } from './module/auth/auth.routes';
import { categoryRoutes } from './module/category/category.route';
import { adminRoutes } from './module/admin/admin.route';
import { serviceRoutes } from './module/service/service.route';
import { technicianPublicRoutes, technicianManagementRoutes } from './module/technician/technician.route';

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



app.use('/api/auth', authRoutes)
app.use("/api/categories", categoryRoutes);

app.use("/api/services", serviceRoutes);
app.use("/api/technicians", technicianPublicRoutes);
app.use("/api/technician", technicianManagementRoutes);


// admin route
app.use("/api/admin", adminRoutes);










app.use(notFound);
app.use(globalErrorHandler);

export default app
