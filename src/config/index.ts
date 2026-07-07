import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(process.cwd(), ".env") });


export default {
    port : process.env.PORT,
    database_url : process.env.DATABASE_URL,
    app_url : process.env.APP_URL,
    api_url : process.env.API_URL,
    node_env : process.env.NODE_ENV || "development",
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret : process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret : process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in : process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in : process.env.JWT_REFRESH_EXPIRES_IN!,

    ssl_store_id: process.env.SSL_STORE_ID!,
    ssl_store_pass: process.env.SSL_STORE_PASS!,
    ssl_base_url: process.env.SSL_BASE_URL || "https://sandbox.sslcommerz.com",
}