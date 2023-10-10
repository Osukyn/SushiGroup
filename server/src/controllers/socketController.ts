import {Server} from 'socket.io';
import {OnlineUser, User} from '../models/User';
import {GroupOrder, Order, OrderStatus} from '../models/Order';
import mongoose from "mongoose";
import axios from "axios";
import FormData from "form-data";

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

export const getOnlineUsersOfGroupUsers = (group: GroupOrder) => {
  return onlineUsers.filter(u => group.users.some(user => user.email === u.fullUser.email));
}
export const exitGroup = (email: string) => {
  const group = findGroupByUserEmail(email);
  if (group) {
    if (group.host.email === email) {
      for (const user of getOnlineUsersOfGroupUsers(group)) {
        io.sockets.sockets.get(user.socketId)?.emit(`groupDeletion/${group.id}`, group.toJSON());
      }
      groups.splice(groups.findIndex(g => g.id === group.id), 1);
      // create new array of JSON group from groups
      io.sockets.emit('groupsUpdate', groups.map(g => g.toJSON()));
    } else {
      group.removeUser(group.users.find(u => u.email === email)!);
      io.sockets.emit('groupsUpdate', groups.map(g => g.toJSON()));
      for (const user of getOnlineUsersOfGroup(group)) {
        io.sockets.sockets.get(user.socketId)?.emit(`groupUpdate/${group.id}`, group.toJSON());
      }
    }
  }
}
function formatDateToISO(str: string) {
  const [day, month, year] = str.split("/");
  return `${year}-${month}-${day}`;
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
      mongoose.models.FullUser.findOne({email: data.email}).then((user) => {
        if (user === null) {
          const localUser = <User>{
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            profilePicture: data.picture,
            phone: '',
            deliveriesInfos: []
          }

          if (index === -1) {
            let onlineUser = new OnlineUser(socket.id, localUser);
            onlineUsers.push(onlineUser);
          } else {
            onlineUsers[index].socketId = socket.id;  // Update socket id
          }

          socket.emit('userSet', {id: socket.id});
          socket.emit('userUpdate', localUser);
        } else {
          if (index === -1) {
            let onlineUser = new OnlineUser(socket.id, user);
            onlineUsers.push(onlineUser);
            socket.emit('userSet', {id: socket.id});
            socket.emit('userUpdate', user);
          } else {
            onlineUsers[index].socketId = socket.id;  // Update socket id
            socket.emit('userSet', {id: socket.id});
            socket.emit('userUpdate', user);
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    });

    socket.on('getOnlineUsers', () => {
      socket.emit('onlineUsers', onlineUsers.map(u => u.fullUser));  // Sending only User details, not socket ids
    });

    socket.on('getGroups', () => {
      socket.emit('groups', groups.map(g => g.toJSON()));
    });

    socket.on('createGroup', (data: any) => {
      const onlineUser = onlineUsers.find(u => u.socketId === socket.id);
      if (onlineUser) {
        const group = groups.find(group => group.host.email === onlineUser.fullUser.email || group.users.some(u => u.email === onlineUser.fullUser.email));
        if (group === undefined) {
          console.log('Create group:', data);
          const newGroup = new GroupOrder(onlineUser.fullUser, data.deliveriesInfos, data.creneau, data.date);
          groups.push(newGroup);
          socket.broadcast.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.emit('groupCreated', newGroup.toJSON());
        } else {
          exitGroup(onlineUser.fullUser.email);
          const newGroup = new GroupOrder(onlineUser.fullUser, data.deliveriesInfos, data.creneau, data.date);
          groups.push(newGroup);
          socket.broadcast.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.emit('groupCreated', newGroup.toJSON());
        }
      }
    });

    socket.on('exitGroup', (email: any) => {
      exitGroup(email);
    });

    socket.on('joinGroup', (groupId: string) => {
      const onlineUser = onlineUsers.find(u => u.socketId === socket.id);
      if (onlineUser) {
        let groupIndex = groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          if (findGroupByUserEmail(onlineUser.fullUser.email)) {
            exitGroup(onlineUser.fullUser.email);
          }
          groupIndex = groups.findIndex(group => group.id === groupId);
          groups[groupIndex].addUser(onlineUser.fullUser);
          socket.broadcast.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.emit('groupsUpdate', groups.map(g => g.toJSON()));
          socket.broadcast.emit(`groupUpdate/${groupId}`, groups[groupIndex].toJSON());
          socket.emit(`groupUpdate/${groupId}`, groups[groupIndex].toJSON());
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
          console.log('Order updated:', order);
          group.setUserOrder(onlineUser.fullUser.email, order);
          socket.broadcast.emit(`groupUpdate/${group.id}`, group.toJSON());
        }
      }
    });

    socket.on('kickUser', (data: any) => {
      console.log('Kick user:', data);
      const onlineUser = onlineUsers.find(u => u.fullUser.email === data.email);
      if (onlineUser) {
        // Search for the group where the user is a member
        const group = groups.find(group => {
          return group.users.some(u => u.email === onlineUser.fullUser.email) || group.host.email === onlineUser.fullUser.email;
        });

        if (group) {
          exitGroup(onlineUser.fullUser.email);
          socket.broadcast.emit(`groupUpdate/${group.id}`, group.toJSON());
          socket.emit(`groupUpdate/${group.id}`, group.toJSON());
          socket.broadcast.emit(`groupKick/${group.id}`, onlineUser.fullUser.email);
        }
      }
    });

    socket.on('order', (data: any) => {
      const onlineUser = onlineUsers.find(u => u.fullUser.email === data.email);
      if (onlineUser) {
        // Search for the group where the user is a member
        const group = groups.find(group => {
          return group.users.some(u => u.email === onlineUser.fullUser.email) || group.host.email === onlineUser.fullUser.email;
        });

        if (group) {
          group.setStatus(OrderStatus.SENT);
          console.log(JSON.stringify(group.getItems()));
          console.log(group);
          const form = new FormData();
          form.append('idLieuLivraison', group.deliveryInfos.restaurant);
          if (group.deliveryInfos.sousLieux !== '') form.append('sousville', group.deliveryInfos.sousLieux);
          form.append('dateLivraison', formatDateToISO(group.date));
          form.append('heureLivraison', group.creneau.id);
          form.append('livraison', 1);
          form.append('client', 1);
          form.append('prenom', group.host.firstName);
          form.append('nom', group.host.lastName);
          form.append('tel', group.host.phone);
          form.append('email', group.host.email);
          form.append('adresse1', group.deliveryInfos.address);
          form.append('complementAdresse', group.deliveryInfos.address2);
          form.append('observations', '');
          form.append('heureLivraisonTexte', group.creneau.libelle);
          form.append('dateLivraisonTexte', group.date);
          form.append('contenuJson', JSON.stringify(group.getItems()));
          form.append('idCoupon', '');
          form.append('codeCoupon', '');
          form.append('cgv', 'on');

          console.log(form);

          axios.post('https://83.easysushi.fr/Commander.aspx', form).then((response) => {
            console.log(response);
            console.log(response.data);
          }).catch((error) => {
            console.log(error);
          });
          //socket.broadcast.emit(`groupUpdate/${group.id}`, group.toJSON());
        }
      }
    });

    socket.on('disconnect', () => {
      let index = onlineUsers.findIndex(u => u.socketId === socket.id);
      if (index !== -1) {
        if (onlineUsers[index].fullUser) {
          console.log('User disconnected:', onlineUsers[index].fullUser.email);
          setTimeout(() => {
            index = onlineUsers.findIndex(user => user.socketId === socket.id);
            if (index !== -1) {
              const group = findGroupByUserEmail(onlineUsers[index].fullUser.email);
              if (group === undefined || group.getUserOrder(onlineUsers[index].fullUser.email)?.status !== OrderStatus.CONFIRMED) {
                exitGroup(onlineUsers[index].fullUser.email);
                onlineUsers.splice(index, 1);
              }
            }
          }, 5 * 60 * 1000 / 20);  // 5 minutes
        } else {
          onlineUsers.splice(index, 1);
        }
      }
    });
  });
}
