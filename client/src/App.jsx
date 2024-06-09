// src/App.js
import React from 'react';
import { useRecoilValue } from 'recoil';
import { roomState, gameState } from './state/atoms';
import Game from './components/Game';
import Vote from './components/Vote';
import RoomSetup from './components/RoomSetup';
import Cards from './components/Cards';

const App = () => {

  const room = useRecoilValue(roomState);
  const game = useRecoilValue(gameState);

  return (
    <div className="h-screen w-full md:p-5 bg-cover bg-orange-400 bg-[url('./assets/desertDay1.jpeg')] bg-repeat flex flex-col justify-center items-center">
      <h1 className='font-bold text-orange-800 font-mono'>Dixit Game</h1>
      <p className='font-bold text-orange-800 font-mono'>room : {room}</p>
      {!room 
      ? ( <RoomSetup />) 
      : (<Game />)}
    </div>
  );
};

export default App;
