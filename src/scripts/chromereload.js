/*
    Name: chromereload.js
    Author: Ashish Chopra
    Date: 16 Jan, 2017

    This script is used for development purpose only and must be removed,
    before making a production ready builds.

    This script, setup a connection with web server using Websockets and listen
    for changes to reload the extension automatically.

*/
'use strict';

const LIVERELOAD_HOST = 'localhost:';
const LIVERELOAD_PORT = 35729;
const connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');

connection.onerror = error => {
  console.log('reload connection got error:', error);
};

connection.onmessage = e => {
  if (e.data) {
    const data = JSON.parse(e.data);
    if (data && data.command === 'reload') {
      chrome.runtime.reload();
    }
  }
};