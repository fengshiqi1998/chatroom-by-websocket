const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3100 });

const roomList = []; // 房间列表

server.on('connection', (ws, req) => {
  const ip = req.connection.remoteAddress;
  const port = req.connection.remotePort;
  ws.on('message', (msg) => {
    console.log(
      'date: ',
      new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    );
    console.log('ws message before:\n', roomList);
    console.log('ws message: ', msg);
    let str = ''; // 要发送的信息
    try {
      const data = JSON.parse(msg);
      const client = data.username;
      let curRoom = null;
      // 若客户端为 mac
      if (client.indexOf('mac') > -1) {
        let hasMac = -1;
        let hasSeat = -1;
        // 查询是否有该 mac 的记录
        hasMac = roomList.findIndex(
          (item) => item.mac && item.mac.name === client
        );
        // 查询是否有空余的 mac 位置
        hasSeat = roomList.findIndex((item) => !item.mac);
        switch (true) {
          // mac已存在于某一房间中，则直接拿出来
          case hasMac > -1:
            curRoom = roomList[hasMac];
            curRoom.mac.socket = ws; // 更新socket
            break;
          // 有空位则将 mac 放入该房间中
          case hasSeat > -1:
            roomList[hasSeat].mac = {
              name: client,
              socket: ws,
            };
            curRoom = roomList[hasSeat];
            break;
          // 其他情况，目前考虑有：没有多余的房间 ，则新建一个房间
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
        // 若房间中有 phone 则对 phone 进行通信
        if (curRoom.phone && curRoom.phone.socket) {
          str = `${data.username} say: ${data.message}`;
          curRoom.phone.socket.send(str);
        }
        // 相反的情况
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
            curRoom.phone.socket = ws;
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
              mac: '',
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
    console.log('ws message after:\n', roomList, '\n');
    // // 遍历所有的客户端
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

  ws.on('close', (e) => {
    console.log('ws close', e);
    ws.send('ws disconnected');
  });
});

server.on('open', function open() {
  console.log('server connected');
});

server.on('close', function close() {
  console.log('server disconnected');
});
