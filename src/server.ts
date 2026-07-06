import { prisma } from "./lib/prisma";
import app from "./app";
import config from "./config";


const PORT = config.port;

async function main() {
    try {
        await prisma.$connect();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();