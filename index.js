"use strict";

process.title = 'node-chat';

const websockPort = 3032;

/* Server storage */
const history = [];
const clients = [];

// const WebSocket = require('isomorphic-ws');

// const ws = new WebSocket();

const express = require('express');
const server = express();
const expressWs = require('express-ws')(server);


/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
  return String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'yellow', 'orange' ]

// const wss = new WebSocket.Server({ server });

server.ws('/', (ws, req) => {
  console.log((new Date()) + ' Connection from origin '
  + req.connection.remoteAddress + '.');

  // console.log(req.connection._peername);

  const index = clients.push(ws) - 1;
  let userName = false;
  let userColor = false;

  // console.log((new Date()) + ' Connection accepted.');
  if (history.length > 0) {
    ws.send(
      JSON.stringify({ type: 'history', data: history })
    );
  }

  ws.on('message', message => {
    // console.log('message:', message);
    if (message) {
      if (!userName) {
        userName = htmlEntities(message);
        userColor = colors[4];
        ws.send(
          JSON.stringify({ type: 'color', data: userColor })
        );
        console.log(`${new Date()} User is known as: ${userName} with ${userColor} color.`);
      } else {
        console.log(`${new Date()} Received Message from ${userName}: ${message}`);
        const newMessage = {
          time: (new Date()).getTime(),
          text: htmlEntities(message),
          author: userName,
          color: userColor
        };
        if (history.push(newMessage) > 100 ) {
          history.shift();
        }
        
        const jsonMessage = JSON.stringify({ type: 'message', data: newMessage });
        for (let i=0; i < clients.length; i++) {
          clients[i].send(jsonMessage);
        }
      }
    }
  });

  ws.on('close', connection => {
    if (userName && userColor) {
      console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`);

      clients.splice(index, 1);
      colors.push(userColor);
    }
  });

  // ws.send(JSON.stringify({ type: 'color', data: colors[0] }));
  // ws.on('open', request => {
  //   console.log("hello?");
  // });

})

// wss.on('request', (request) => {
//   console.log((new Date()) + ' Connection from origin '
//   + request.origin + '.');

//   const connection = request.accept(null, request.origin);

  // connection.on('message', message => {
  //   if (message.type === 'utf8') {
  //     if (!userName) {
  //       username = htmlEntities(message.utf8Data);
  //       userColot = colors.shift();
  //       connection.sendUTF(
  //         JSON.stringify({ type: 'color', data: userColor })
  //       );
  //       console.log(`${new Date()} User is known as: ${userName} with ${userColor} color.`);
  //     } else {
  //       console.log(`${new Date()} Received Message from ${userName}: ${message.utf8Data}`);
  //       const newMessage = {
  //         time: (new Date()).getTime(),
  //         text: htmlEntities(messag.utf8Data),
  //         author: userName,
  //         color: userColor
  //       };
  //       if (history.push(newMessage) > 100 ) {
  //         history.shift();
  //       }
        
  //       const jsonMessage = JSON.stringify({ type: 'message', data: newMessage });
  //       for (let i=0; o < clients.length; i++) {
  //         clients[i].sendUTF(json);
  //       }
  //     }
  //   }
  // });


// });

server.listen(websockPort, () => {
  console.log((new Date()) + " Server is listening on port " + websockPort);
});
