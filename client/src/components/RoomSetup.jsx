// src/components/CreateRoom.js
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { roomState, playerState } from '../state/atoms';
import socket from '../socket';

const RoomSetup = () => {
    const [createRoomID, setCreateRoomID] = useState('');
    const [joinRoomID, setJoinRoomID] = useState('');
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
        socket.emit('createRoom', createRoomID, playerName, (response) => {
            if (response.success) {
                setRoom(createRoomID);
                setPlayer({ id: socket.id, name: playerName });
            } else {
                alert(response.message);
            }
        });
    };
    const joinRoom = () => {
        socket.emit('joinRoom', joinRoomID, playerName, (response) => {
            if (response.success) {
                setRoom(joinRoomID);
                setPlayer({ id: socket.id, name: playerName });
            } else {
                alert(response.message);
            }
        });
    };

    return (
        <div className='p-5 w-max bg-gradient-to-l from-orange-400 to-orange-500 border-r-2 border-b-2 border-orange-700 font-mono flex flex-col justify-center items-center'>
            <div className='w-full flex'>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Name"
                    className='px-4 py-2 m-1 w-full border-2'
                />
            </div>

            <div className='m-1 flex'>
                <input
                    type="text"
                    value={createRoomID}
                    onChange={(e) => setCreateRoomID(e.target.value)}
                    placeholder="Room Name"
                    className='px-4 py-2 border-2'
                />
                <button onClick={createRoom} className='p-2 w-32 text-black border-2 border-black bg-orange-200 hover:bg-orange-300 font-semibold text-sm sm:text-base'>Create Room</button>
            </div>

            <div className='m-1 flex'>
                <input
                    type="text"
                    value={joinRoomID}
                    onChange={(e) => setJoinRoomID(e.target.value)}
                    placeholder="Room Name"
                    className='px-4 py-2 border-2'
                />
                <button onClick={joinRoom} className='p-2 w-32 text-black border-2 border-black bg-orange-200 hover:bg-orange-300 font-semibold text-sm sm:text-base'>Join Room</button>
            </div>
        </div>

    );
};

export default RoomSetup;
