// src/components/CreateRoom.js
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { roomState, playerState } from '../state/atoms';
import socket from '../socket';

const RoomSetup = () => {
    const [roomID, setRoomID] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [room, setRoom] = useRecoilState(roomState);
    const [player, setPlayer] = useRecoilState(playerState);

    // useEffect(()=>{
    //     setPlayerName('useer');
    //     setCreateRoomID('room1');
    //     createRoom();
    //     joinRoom();
    // }, []);

    const createRoom = () => {
        if(!roomID || !playerName) return;
        socket.emit('createRoom', roomID, playerName, (response) => {
            if (response.success) {
                setRoom(roomID);
                setPlayer({ id: socket.id, name: playerName });
            } else {
                alert(response.message);
            }
        });
    };
    const joinRoom = () => {
        if(!roomID && !playerName) return;
        socket.emit('joinRoom', roomID, playerName, (response) => {
            if (response.success) {
                setRoom(roomID);
                setPlayer({ id: socket.id, name: playerName });
            } else {
                alert(response.message);
            }
        });
    };

    return (
        <div className='p-5 w-2/3 sm:w-80 bg-gradient-to-b from-violet-600 to-indigo-800 border-2 rounded-lg border-black flex flex-col justify-center items-center'>
            <div className='w-full flex flex-col '>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Name"
                    className='px-4 py-2 mb-1 w-full border-2 rounded-md'
                />
                <input
                    type="text"
                    value={roomID}
                    onChange={(e) => setRoomID(e.target.value)}
                    placeholder="Room Name"
                    className='px-4 py-2 mb-1 w-full border-2 rounded-md'
                />
            </div>

            <div className='flex w-full justify-evenly'>
                <button onClick={createRoom} className='mr-1 p-2 w-1/2 text-white rounded-md bg-[#544BF1] hover:bg-indigo-700 font-semibold text-sm sm:text-base border-b-2 border-indigo-900'>Create</button>
                <button onClick={joinRoom} className=' p-2 w-1/2 text-white rounded-md bg-[#544BF1] hover:bg-indigo-700 font-semibold text-sm sm:text-base border-b-2 border-indigo-900'>Join</button>
            </div>
        </div>

    );
};

export default RoomSetup;
