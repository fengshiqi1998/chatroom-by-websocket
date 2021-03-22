const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3100 });

const roomList = [];
// let roomId = 0;

server.on('connection', (ws, req) => {
  const ip = req.connection.remoteAddress;
  const port = req.connection.remotePort;
  ws.on('message', (msg) => {
    console.log('ws message: ', msg);
    console.log(roomList);
    // if (roomList.length === 0) {
    //   roomList.push();
    // }
    // if (roomList.length === 0 || index === -1) {
    // }
    let str = '';
    try {
      const data = JSON.parse(msg);

      const client = data.username;
      let curRoom = null;
      if (client.indexOf('mac') > -1) {
        let hasMac = -1;
        let hasSeat = -1;
        hasMac = roomList.findIndex(
          (item) => item.mac && item.mac.name === client
        );
        hasSeat = roomList.findIndex((item) => !item.mac);
        // if (roomList.length === 0 || hasSeat === -1) {
        //   const room = {
        //     mac: client,
        //     phone: ''
        //   };
        //   roomList.push(room)
        // }
        switch (true) {
          case hasMac > -1:
            curRoom = roomList[hasMac];
            break;
          case hasSeat > -1:
            roomList[hasSeat].mac = {
              name: client,
              socket: ws,
            };
            curRoom = roomList[hasSeat];
            break;
          // case roomList.length > 0:
          //   const room = {
          //     mac: {
          //       name: client,
          //       socket: ws
          //     },
          //     phone: '',
          //   };
          //   roomList.push(room);
          //   break;
          default:
            const room = {
              mac: {
                name: client,
                socket: ws,
              },
              phone: '',
            };
            roomList.push(room);
            curRoom = room;
            break;
        }
        if (curRoom.phone && curRoom.phone.socket) {
          str = `${data.username} say: ${data.message}`;
          curRoom.phone.socket.send(str);
        }
      } else {
        let hasPhone = -1;
        let hasSeat = -1;
        hasPhone = roomList.findIndex(
          (item) => item.phone && item.phone.name === client
        );
        hasSeat = roomList.findIndex((item) => !item.phone);
        switch (true) {
          case hasPhone > -1:
            curRoom = roomList[hasPhone];
            break;
          case hasSeat > -1:
            roomList[hasSeat].phone = {
              name: client,
              socket: ws,
            };
            curRoom = roomList[hasSeat];
            break;
          default:
            const room = {
              phone: {
                name: client,
                socket: ws,
              },
              phone: '',
            };
            roomList.push(room);
            curRoom = room;
            break;
        }
        if (curRoom.mac && curRoom.mac.socket) {
          str = `${data.username} say: ${data.message}`;
          curRoom.mac.socket.send(str);
        }
      }
    } catch (e) {
      str = msg;
    }

    // server.clients.forEach((client) => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(str);
    //   }
    // });
  });

  ws.on('open', () => {
    console.log('ws connected');
    ws.send('ws connected');
  });

  ws.on('close', () => {
    console.log('ws close');
    ws.send('ws disconnected');
  });
});

server.on('open', function open() {
  console.log('server connected');
});

server.on('close', function close() {
  console.log('server disconnected');
});
