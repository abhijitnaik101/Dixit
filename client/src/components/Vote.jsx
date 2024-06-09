// src/components/Vote.js
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { gameState, roomState } from '../state/atoms';
import socket from '../socket';

const Vote = () => {
  const [room] = useRecoilState(roomState);
  const [game] = useRecoilState(gameState);
  const [vote, setVote] = useState('');

  const submitVote = () => {
    socket.emit('voteCard', room, vote, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  };
    return (
      <div className='w-full bg-indigo-950 flex flex-col items-center text-white'>
        {
          (game.submittedCards.length == 0) ? 
          <div>Waiting for others to submit cards.</div>
            :
            <div className='flex w-full items-center justify-between'>
              <div className='px-5 py-2 h-10 bg-indigo-500'>Vote: {vote}</div>
              <div className='flex justify-start overflow-x-scroll no-scroll'>
                {game.submittedCards.map((card, index) => (
                  <button key={index} onClick={() => setVote(card.card)} className='mx-1 h-10 w-10 rounded-full bg-white flex justify-center items-center hover:bg-slate-300 text-black'>{index + 1}</button>
                ))}
              </div>
              <button onClick={submitVote} className='px-5 h-10 bg-blue-500 hover:bg-blue-600'>Submit</button>
            </div>
        }
      </div>
    );
};

export default Vote;
