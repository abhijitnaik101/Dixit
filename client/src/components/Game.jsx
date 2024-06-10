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
  const [roundResults, setRoundResults] = useState({});


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

    socket.on('roundResults', (scores) => {
      setRoundResults(scores);
    })

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
      } else {
        setCard('');
      }
    });
  };

  //for listeners only
  const submitCard = () => {
    socket.emit('submitCard', room, card, (response) => {
      if (!response.success) {
        alert(response.message);
      } else {
        setCard('');
      }
    });
  };

  return (
    <>
      <div className='h-full w-full flex flex-col justify-between font-mono'>
        <div className='h-full flex flex-col justify-center items-center'>
          {(!game.started) && (
            <button onClick={startGame} className='relative p-2 w-32 text-white border-2 border-black rounded-md bg-indigo-500 hover:bg-indigo-600 font-semibold text-sm sm:text-base animate-bounce'>Start Game</button>
          )}

          {(game.started) &&
            <div className='h-full w-full flex flex-col items-center'>
              <div className="h-1/2 w-11/12 mb-2 bg-[url('./assets/indigoFloralbg.jpeg')] bg-contain bg-center from-[#553CCE] via-[#3F2BB6] to-[#2C2AA0] rounded-md contain-content border-2 border-white overflow-clip flex flex-col justify-center items-center text-white">
                <p className='w-4/5 text-center text-white'>Score board</p>
                <div className='w-4/5 h-3/5 p-5 bg-[#131974] rounded-md text-black overflow-y-scroll no-scroll'>
                  {Object.entries(game.playersData).map(([id, score]) =>
                    <div className='flex justify-between mb-1'>
                      <span className='w-2/3 text-center mr-1 bg-white'>{usersRegistry[id]}</span><span className='w-1/3 text-center bg-white'>{score}</span>
                    </div>)
                  }
                </div>
                <div className='flex flex-col items-center'>
                  <h2 className='text-base font-bold text-white underline'>riddle </h2>
                  {game.story && <p className='px-2 rounded-md text-base text-indigo-200 italic bg-indigo-600'>{game.story}</p>}

                  {/* game res modal */}
                  {game.submittedCards.length != 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full top-0 bg-indigo-950 bg-opacity-70 backdrop-blur-sm'>
                      <div className='flex'>
                        {game.submittedCards.map((card, index) =>
                          <Card key={index} card={cardData[card.card]} />
                        )}
                      </div>
                      <p>choose the numbers below to vote</p>
                    </div>
                  }
                  {
                    Object.keys(roundResults).length != 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full top-0 bg-indigo-950 bg-opacity-70 backdrop-blur-sm'>
                      <div className='flex flex-col'>
                        {
                          Object.entries(roundResults).map(([id, score]) =>
                            <div>
                              <div>
                                {(id != game.storyteller && score == 0) && <p>{usersRegistry[id]} : Wrong</p>}
                                {(id != game.storyteller && score == 2) && <p>{usersRegistry[id]} : Right</p>}
                              </div>
                              <div>
                                {(id != game.storyteller && score == 1) && <p>{usersRegistry[id]} : Someone choose your card</p>}
                              </div>
                            </div>
                          )
                        }
                      </div>
                      <button onClick={() => { setRoundResults({}) }}>OK</button>
                    </div>
                  }

                </div>
              </div>
              {
                (player.id == game.storyteller) ?
                  <div className='h-1/2 md:h-3/5 w-full flex flex-col justify-evenly items-center'>
                    <div className='flex h-10 w-full justify-center'>
                      <input type="text" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Story"
                        className='p-2 px-4 w-4/5' />
                      <button onClick={submitStory} className='h-10 w-20  bg-indigo-600 border-2 border-black hover:bg-indigo-700 text-white'>Send</button>
                    </div>
                    <Cards callback={setCard} />
                  </div>
                  :
                  <div className='h-1/2 md:h-3/5 w-full flex flex-col justify-evenly items-center'>
                    <div className='h-max w-full bg-orange-500'>
                      {game.started && <Vote />}
                    </div>
                    <div className='w-full flex justify-center bg-indigo-950'>
                      {(card && game.story != '') && <button onClick={submitCard} className='p-2 rounded-lg border-2 border-black bg-indigo-500 hover:bg-indigo-600 text-white'>Submit Card</button>}
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
