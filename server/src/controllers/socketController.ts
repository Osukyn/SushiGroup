/*
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
            const index = onlineUsers.findIndex(user => user.id === socket.id);
            if (index !== -1) {
              const group = groups.findIndex(group => group.host === onlineUsers[index]);
              if (group === -1) {
                groups.push(new GroupOrder(onlineUsers[index], data));
                socket.broadcast.emit('groupsUpdate', groups);
                console.log(groups);
              }
            }
        });

        socket.on('joinGroup', (id: any) => {
            const index = onlineUsers.findIndex(user => user.id === socket.id);
            if (index !== -1) {
              const group = groups.findIndex(group => group.id === id);
              if (group !== -1) {
                if (groups[group].getHost().id !== onlineUsers[index].id) {
                  groups[group].addUser(onlineUsers[index]);
                  socket.broadcast.emit('groupsUpdate', groups);
                  console.log(groups);
                }
              }
            }
        })

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
*/

import {Server} from 'socket.io';
import {OnlineUser, User} from '../models/User';
import {GroupOrder, Order, OrderStatus} from '../models/Order';

let onlineUsers: OnlineUser[] = [];
let groups: GroupOrder[] = [];
let io: Server;
export const getSocketByUserEmail = (email: string) => {
    const onlineUser = onlineUsers.find(u => u.fullUser.email === email);
    if (onlineUser) {
        return io.sockets.sockets.get(onlineUser.socketId);
    }
    return null;
}
export const getOnlineUserByEmail = (email: string) => {
    return onlineUsers.find(u => u.fullUser.email === email);
}
export const findGroupByUserEmail = (email: string) => {
    return groups.find(group => group.users.some(u => u.email === email) || group.host.email === email);
}
export const getOnlineUsersOfGroup = (group: GroupOrder) => {
    return onlineUsers.filter(u => group.users.some(user => user.email === u.fullUser.email) || group.host.email === u.fullUser.email);
}
export const exitGroup = (email: string) => {
    const group = findGroupByUserEmail(email);
    if (group) {
        group.removeUser(group.users.find(u => u.email === email)!);
        io.sockets.emit('groupsUpdate', groups);
        for (const user of getOnlineUsersOfGroup(group)) {
            io.sockets.sockets.get(user.socketId)?.emit(`groupUpdate/${group.id}`, group);
        }
    }
}
export const initializeSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket: any) => {
        console.log('A user connected:', socket.id);

        socket.on('setUser', async (data: any) => {
            let index = onlineUsers.findIndex(u => u.fullUser.email === data.email);

            if (index === -1) {
                const user: User = {
                    name: data.name,
                    email: data.email,
                    phone: '', // Should be updated with actual data
                    profilePicture: data.picture,
                    deliveriesInfos: [null], // Should be updated with actual data
                };
                let onlineUser = new OnlineUser(socket.id, user);
                onlineUsers.push(onlineUser);
            } else {
                onlineUsers[index].socketId = socket.id;  // Update socket id
            }

            socket.emit('userSet', {id: socket.id});
        });

        socket.on('getOnlineUsers', () => {
            socket.emit('onlineUsers', onlineUsers.map(u => u.fullUser));  // Sending only User details, not socket ids
        });

        socket.on('getGroups', () => {
            socket.emit('groups', groups);
        });

        socket.on('createGroup', (data: any) => {
            const onlineUser = onlineUsers.find(u => u.socketId === socket.id);
            if (onlineUser) {
                const groupExists = groups.some(group => group.host.email === onlineUser.fullUser.email);
                if (!groupExists) {
                    const newGroup = new GroupOrder(onlineUser.fullUser, data);
                    groups.push(newGroup);
                    socket.broadcast.emit('groupsUpdate', groups);
                }
            }
        });

        socket.on('joinGroup', (groupId: string) => {
            const onlineUser = onlineUsers.find(u => u.socketId === socket.id);
            if (onlineUser) {
                const groupIndex = groups.findIndex(group => group.id === groupId);
                if (groupIndex !== -1 && findGroupByUserEmail(onlineUser.fullUser.email) === undefined) {
                    groups[groupIndex].addUser(onlineUser.fullUser);
                    socket.broadcast.emit('groupsUpdate', groups);
                }
            }
        });

        socket.on('updateOrder', (data: any) => {
            const onlineUser = onlineUsers.find(u => u.fullUser.email === data.email);
            if (onlineUser) {
                // Search for the group where the user is a member
                const group = groups.find(group => {
                    return group.users.some(u => u.email === onlineUser.fullUser.email) || group.host.email === onlineUser.fullUser.email;
                });

                if (group) {
                    const order = new Order(data.email);
                    order.items = data.items;
                    order.status = data.status;
                    group.setUserOrder(onlineUser.fullUser.email, order);
                    socket.broadcast.emit(`groupUpdate/${group.id}`, group);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            let index = onlineUsers.findIndex(u => u.socketId === socket.id);
            if (index !== -1) {
                setTimeout(() => {
                    index = onlineUsers.findIndex(user => user.socketId === socket.id);
                    const group = findGroupByUserEmail(onlineUsers[index].fullUser.email);
                    if (index !== -1 && (group === undefined || group.getUserOrder(onlineUsers[index].fullUser.email)?.status !== OrderStatus.CONFIRMED)) {
                        exitGroup(onlineUsers[index].fullUser.email);
                        onlineUsers.splice(index, 1);
                    }
                }, 5 * 60 * 1000 / 20);  // 5 minutes
            }
        });
    });
}
