// src/socket.js
import { io } from 'socket.io-client';
//const END_POINT = 'https://dixit-c812.onrender.com';
const END_POINT = 'http://localhost:5000/';
const socket = io(END_POINT);

export default socket;
