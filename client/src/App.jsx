// src/App.js
import React from 'react';
import { useRecoilValue } from 'recoil';
import { roomState, gameState } from './state/atoms';
import Game from './components/Game';
import Vote from './components/Vote';
import RoomSetup from './components/RoomSetup';
import Cards from './components/Cards';
import video from './assets/purplePlanet.mp4';

const App = () => {

  const room = useRecoilValue(roomState);
  const game = useRecoilValue(gameState);
  //bg-[url('./assets/vectorSpace2.jpeg')]
  //bg-[url('./vectorSpace2_bg.jpeg')]
  return (
    <div className="h-screen w-full md:p-5 bg-center bg-cover bg-[url('./assets/asteroid.jpg')] sm:bg-none flex flex-col justify-center items-center">
      <video src={video} className='absolute -z-10 h-full w-full object-center object-cover' autoPlay loop muted/>
      <h1 className='font-bold text-indigo-500 font-mono'>Dixit Game</h1>
      <p className='font-bold text-indigo-500 font-mono'>room : {room}</p>
      {!room 
      ? ( <RoomSetup />) 
      : (<Game />)}
    </div>
  );
};

export default App;
