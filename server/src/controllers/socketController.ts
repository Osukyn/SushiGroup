import { Server } from 'socket.io';
import { User } from '../models/User';
import {GroupOrder, OrderStatus} from '../models/Order';

let onlineUsers: User[] = [];
let groups: GroupOrder[] = [];

export const initializeSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket: any) => {
        console.log('A user connected:', socket.id);

        socket.on('setUser', (data: any) => {
            let index = onlineUsers.findIndex(user => user.email === data.email);
            if (index === -1) {
                onlineUsers.push(new User(socket.id, data.email, data.name, data.picture));
            } else {
                onlineUsers[index].id = socket.id;
            }
            socket.emit('userSet', {id: socket.id});
        });

        socket.on('getOnlineUsers', () => {
            socket.emit('onlineUsers', onlineUsers);
        });

        socket.on('getGroups', () => {
            socket.emit('groups', groups);
        });

        socket.on('createGroup', (data: any) => {
            let index = onlineUsers.findIndex(user => user.id === socket.id);
            if (index !== -1) {
                groups.push(new GroupOrder(onlineUsers[index]));
                socket.broadcast.emit('groupsUpdate', groups[groups.length - 1]);
            }
        });

        socket.on('updateOrder', (data: any) => {
            let index = onlineUsers.findIndex(user => user.email === data.email);
            if (index !== -1) {
                onlineUsers[index].order = data;

                socket.broadcast.emit('orderUpdated', onlineUsers[index]);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            let index = onlineUsers.findIndex(user => user.id === socket.id);
            if (index !== -1) {
                setTimeout(() => {
                    index = onlineUsers.findIndex(user => user.id === socket.id);
                    if (index !== -1 && (onlineUsers[index].order === undefined || onlineUsers[index].getOrder().status !== OrderStatus.CONFIRMED)) {
                        if (onlineUsers[index].order) {
                            let tempOrder = onlineUsers[index].getOrder();
                            tempOrder.items = [];
                            onlineUsers[index].setOrder(tempOrder);
                        }
                        socket.broadcast.emit('orderUpdated', onlineUsers[index]);
                        onlineUsers.splice(index, 1);
                    }
                }, 5 * 60 * 1000 / 20);  // 5 minutes
            }
        });
    });
}

// Vous pouvez également exporter d'autres fonctions ou variables si elles doivent être accessibles depuis d'autres fichiers.
