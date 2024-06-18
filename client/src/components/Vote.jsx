// src/components/Vote.js
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { gameState, roomState } from '../state/atoms';
import socket from '../socket';

const Vote = () => {
  const [room] = useRecoilState(roomState);
  const game = useRecoilValue(gameState);
  const [vote, setVote] = useState('');
  const [cardNumber, setCardNumber] = useState(0);
  const [submited, setSubmited] = useState(false);

  useEffect(()=>{
    setCardNumber(0);
    setVote('');
    setSubmited(false);
  }, [game.storyteller])

  const submitVote = () => {
    setSubmited(true);
    socket.emit('voteCard', room, vote, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
    //alert("vote submitted");
  };
  const chooseVote = (card, index) => {
    setVote(card);
    setCardNumber(index);
  }
  return (
    <div className='w-full bg-indigo-950 flex flex-col items-center text-white'>
      {
        (game.submittedCards.length == 0) ?
          <div>Waiting for others to submit cards.</div>
          :
          <div className='flex w-full items-center justify-between'>
            <div className='py-2 h-10 max-w-24 border-2 border-black flex  items-center'>
              <span className='bg-orange-500 border-y-2 border-black p-2 h-10'>Vote</span>
              <span className='bg-orange-600 border-y-2 border-black p-2 h-10'>{cardNumber}</span>
            </div>
            <div className='flex justify-start overflow-x-scroll no-scroll'>
              {game.submittedCards.map((card, index) => (
                <button key={index} onClick={() => chooseVote(card.card, index + 1)} className='mx-1 h-10 w-10 rounded-lg bg-indigo-500 flex justify-center items-center hover:bg-indigo-600 text-white'>{index + 1}</button>
              ))}
            </div>
            <button onClick={submitVote} className='px-5 h-10 border-2 border-black bg-orange-500 hover:bg-orange-600'>{submited ? 'submited':'submit'}</button>
          </div>
      }
    </div>
  );
};

export default Vote;
