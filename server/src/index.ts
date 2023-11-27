import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { connectToDatabase } from './config/database';
import userRoutes from './routes/userRoutes';
import menuRoutes from './routes/menuRoutes';
import * as fs from "fs";
import * as http from "http";
import mongoose from "mongoose";
import {initializeSocket} from "./controllers/socketController";
import * as https from "https";
import orderRoutes from "./routes/orderRoutes";
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transport = new DailyRotateFile({
  filename: `${logDir}/%DATE%.log`,
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  frequency: '7d'
});

const logger = winston.createLogger({
  transports: [transport]
});

// Redéfinition de console.log pour utiliser winston
console.log = (message: any) => {
  logger.info(message);
};

const app = express();
const PORT = 3000;

const privateKey = fs.readFileSync(__dirname + '/certificates/privkey.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/certificates/fullchain.pem', 'utf8');
const ca = fs.readFileSync(__dirname + '/certificates/chain.pem', 'utf8');  // This might not be necessary for self-signed certificates.

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const server = https.createServer(credentials, app);
//const server = http.createServer(app);

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

app.use('/api', userRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);

initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    connectToDatabase().then(() => {
        console.log('Connected to database');
        mongoose.models.FullUser.find().then((users) => {
            console.log(users);
        });
    });
});
