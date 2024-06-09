// src/components/Game.js
import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { roomState, gameState, playerState } from '../state/atoms';
import socket from '../socket';
import Cards from './Cards';
import Vote from './Vote';
import Card from './Card';
import { cardData } from '../assets/cardData';

const Game = () => {
  const [room] = useRecoilState(roomState);
  const [game, setGame] = useRecoilState(gameState);
  const [player] = useRecoilState(playerState);
  const [story, setStory] = useState('');
  const [card, setCard] = useState('');
  const [usersRegistry, setUsersRegistry] = useState([]);


  useEffect(() => {
    socket.on('gameStarted', (gameState, players) => {
      setGame(gameState);
      setUsersRegistry(players);
    });


    // socket.on('dealCards',(cards) => {
    //   setDeck([...cards[player.id]]);
    // })

    //added
    socket.on('newRound', (gameState) => {
      setGame(gameState);
    });

    socket.on('newStory', ({ story, storyteller, storyCard }) => {
      setGame((prevGame) => ({
        ...prevGame,
        story,
        storyteller,
        storyCard,
      }));
    });

    socket.on('cardsSubmitted', (submittedCards) => {
      setGame((prevGame) => ({
        ...prevGame,
        submittedCards,
      }));
    });

    socket.on('votesSubmitted', (votes) => {
      setGame((prevGame) => ({
        ...prevGame,
        votes,
      }));
    });

    socket.on('roundEnded', (gameState) => {
      setGame(gameState);
      console.log("rounde ended: ", gameState.playersData);
    });

    socket.on('newStoryteller', (storyteller) => {
      setGame((prevGame) => ({
        ...prevGame,
        storyteller,
      }));
    });

    return () => {
      socket.off('gameStarted');
      socket.off('newStory');
      socket.off('cardsSubmitted');
      socket.off('votesSubmitted');
      socket.off('roundEnded');
      socket.off('newStoryteller');
    };
  }, [setGame]);

  const startGame = () => {
    socket.emit('startGame', room, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  };
  //for story teller only
  const submitStory = () => {
    //logic for submitting cards also
    socket.emit('submitStory', room, story, card, (response) => {
      if (!response.success) {
        alert(response.message);
      }else{
        setCard('');
      }
    });
  };

  //for listeners only
  const submitCard = () => {
    socket.emit('submitCard', room, card, (response) => {
      if (!response.success) {
        alert(response.message);
      }else{
        setCard('');
      }
    });
  };

  return (
    <>
      <div className='h-full w-full flex flex-col justify-between font-mono'>
        <div className='h-full flex flex-col justify-center items-center'>
          {(!game.started) && (
            
              <button onClick={startGame} className='relative p-2 w-32 text-black border-2 border-black bg-yellow-300 hover:bg-yellow-400 font-semibold text-sm sm:text-base animate-bounce'>Start Game</button>
            
          )}

          {(game.started) &&
            <div className='h-full w-full flex flex-col'>
              <div className='h-1/2 w-full bg-indigo-600 contain-content overflow-clip flex flex-col justify-center items-center text-white'>
                <p>Score board</p>
                <div>
                  {Object.entries(game.playersData).map(([id, score]) => <p>{usersRegistry[id]}: {score}</p>)}
                </div>
                <div className='flex flex-col items-center'>
                <h2>Story: {game.story}</h2>
                <div>Card(secret): {game.storyCard}</div>

                <div className='flex'>
                  {game.submittedCards.map((card, index) => 
                    <Card key={index} card={cardData[card.card]}/>
                  )}
                </div>
              </div>
              </div>
              
              {
                (player.id == game.storyteller) ?
                  <div className='h-1/2 md:h-2/5 flex flex-col justify-evenly items-center'>

                    <div className='flex h-10 w-full justify-center'>
                      <input type="text" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Story"
                        className='p-2 px-4 w-full' />
                        <button onClick={submitStory} className='h-10 w-20  bg-blue-500 hover:bg-blue-600 text-white'>Send</button>
                    </div>
                    <Cards callback={setCard} />
                  </div>
                  :
                  <div className='h-1/3 md:h-5/6 md:w-1/2 '>
                    
                    <div className='h-max w-full bg-yellow-300'>
                      {game.started ?
                        <div className=''>
                          <Vote />
                        </div> :
                        <div className='h-1/5'>
                          waiting for another players...
                        </div>
                      }
                    </div>
                    <div className='w-full flex justify-center bg-indigo-950'>
                      {card && <button onClick={submitCard} className='p-2 border-2 border-black bg-yellow-300 hover:bg-yellow-400'>Submit Card</button>}
                    </div>
                    <Cards callback={setCard} />
                  </div>
              }
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default Game;
