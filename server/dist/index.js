"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const User_1 = require("./model/User");
const Order_1 = require("./model/Order");
const fs = __importStar(require("fs"));
const app = (0, express_1.default)();
const PORT = 3000;
const path_1 = __importDefault(require("path"));
const myFilePath = path_1.default.join(__dirname, 'certificates', 'privkey.pem');
console.log(myFilePath);
if (fs.existsSync(myFilePath)) {
    console.log('File exists');
}
else {
    console.log('File does not exist');
}
console.log(__dirname);
const privateKey = fs.readFileSync(__dirname + '/certificates/privkey.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/certificates/fullchain.pem', 'utf8');
const ca = fs.readFileSync(__dirname + '/certificates/chain.pem', 'utf8'); // This might not be necessary for self-signed certificates.
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
const corsOptions = {
    origin: '*'
};
app.use((0, cors_1.default)(corsOptions));
const server = https_1.default.createServer(credentials, app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
app.get('/api/menu', (req, res) => {
    axios_1.default.get('https://83.easysushi.fr/Commander.aspx/')
        .then((response) => {
        const jsonRegex = /var json = (\[.*?]);/s; // Regular expression to capture JSON value
        const match = response.data.match(jsonRegex);
        if (match && match[1]) {
            const jsonData = match[1];
            res.json(JSON.parse(jsonData));
        }
        else {
            console.error('json variable not found in the provided data.');
            res.status(500);
        }
    })
        .catch((error) => {
        console.error("Error fetching data: ", error);
        res.status(500);
    });
});
let onlineUsers = [];
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('setUser', (data) => {
        let index = onlineUsers.findIndex(user => user.email === data.email);
        if (index === -1) {
            onlineUsers.push(new User_1.User(socket.id, data.email, data.name, data.picture));
        }
        else {
            onlineUsers[index].id = socket.id;
        }
        console.log('User set:', onlineUsers);
    });
    socket.on('getOnlineUsers', () => {
        socket.emit('onlineUsers', onlineUsers);
    });
    // Écoute de l'événement de mise à jour de commande
    socket.on('updateOrder', (data) => {
        // Mettre à jour les données de l'utilisateur dans votre structure de données (si nécessaire)
        let index = onlineUsers.findIndex(user => user.email === data.email);
        if (index !== -1) {
            onlineUsers[index].order = data;
            // Émettre l'événement de mise à jour à tous les autres utilisateurs connectés
            socket.broadcast.emit('orderUpdated', onlineUsers[index]);
        }
    });
    // On disconnect, set a timeout to remove user data after 5 mins
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        let index = onlineUsers.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            setTimeout(() => {
                index = onlineUsers.findIndex(user => user.id === socket.id);
                if (index !== -1 && (onlineUsers[index].order === undefined || onlineUsers[index].getOrder().status !== Order_1.OrderStatus.CONFIRMED)) {
                    console.log('User removed:', onlineUsers[index]);
                    if (onlineUsers[index].order) {
                        let tempOrder = onlineUsers[index].getOrder();
                        tempOrder.items = [];
                        onlineUsers[index].setOrder(tempOrder);
                    }
                    socket.broadcast.emit('orderUpdated', onlineUsers[index]);
                    onlineUsers.splice(index, 1);
                }
            }, 5 * 60 * 1000 / 20); // 5 minutes
        }
    });
});
server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
