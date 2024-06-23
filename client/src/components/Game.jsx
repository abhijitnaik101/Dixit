// src/components/Game.js
import React, { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { roomState, gameState, playerState, userRegistryState, deckState } from '../state/atoms';
import socket from '../socket';
import Cards from './Cards';
import Vote from './Vote';
import Card from './Card';
import { cardData } from '../assets/cardData';
import Board from './Board';

const Game = () => {
  const [room] = useRecoilState(roomState);
  const [game, setGame] = useRecoilState(gameState);
  const [player] = useRecoilState(playerState);
  const [story, setStory] = useState('');
  const [card, setCard] = useState('');
  const setUsersRegistry = useSetRecoilState(userRegistryState);
  const [deck, setDeck] = useRecoilState(deckState);
  const [submissionStatus, setSubmissionStatus] = useState({storySubmitted:false, cardSubmitted:false});
  const [cardsType, setCardsType] = useState('');

  useEffect(()=>{
    setSubmissionStatus({storySubmitted:false, cardSubmitted:false});
    setStory('');
    setCard('');
  }, [game.round]);
  

 


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
    if(!cardsType){
      alert("Select the category");
      return;
    }
    socket.emit('startGame', room, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  };
  //for story teller only
  const submitStory = () => {
    //logic for submitting cards also
    if(submissionStatus.storySubmitted){
      alert('Story is already submitted.');
      return;
    }
    socket.emit('submitStory', room, story, card, (response) => {
      
      if (!response.success) {
        alert(response.message);
      } else {
        setSubmissionStatus(prevStatus => ({...prevStatus, storySubmitted:true}));
        const newDeck = deck.filter(item => item !== card);
        setDeck([...newDeck]);
        setCard('');
        setStory('');
      }
    });
  };

  //for listeners only
  const submitCard = () => {
    if(submissionStatus.cardSubmitted){
      alert('Already submitted card');
      return;
    }

    socket.emit('submitCard', room, card, (response) => {
      if (!response.success) {
        alert(response.message);
      } else {
        setSubmissionStatus(prevStatus => ({...prevStatus, cardSubmitted:true}));
        const newDeck = deck.filter(item => item !== card);
        setDeck([...newDeck]);
        setCard('');
      }
    });
  };

  return (
    <>
      <div className='h-full w-full flex flex-col justify-between font-mono'>
        <div className='h-full flex flex-col justify-center items-center'>
          {(!game.started) && (
            <div className='w-full flex flex-col items-center'>
              <button onClick={startGame} className='relative m-5 p-2 w-32 text-white border-2 border-black rounded-md bg-indigo-500 hover:bg-indigo-600 font-semibold text-sm sm:text-base animate-bounce'>Start Game</button>
              <div>
                <p className='px-5 text-white font-bold my-3'>{cardsType}</p>
                <button className='py-2 px-5 border-b-2 border-black bg-purple-600 hover:bg-purple-700 rounded-lg text-white' onClick={() => setCardsType('characters')}>characters</button>
              </div>
            </div>
          )}

          {(game.started) &&
            <div className='h-full w-full flex flex-col items-center'>
              
              <Board/> 
              {
                (player.id == game.storyteller) 
                ?
                  <div className='h-2/5 md:h-3/5 w-full flex flex-col justify-evenly items-center'>
                    <div className='flex h-10 w-full justify-center'>
                      <input type="text" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Story"
                        className='p-2 px-4 w-4/5' />
                      <button onClick={submitStory} className='h-10 w-1/5 bg-indigo-600 border-2  hover:bg-indigo-700 text-white'>Send</button>
                    </div>
                    <Cards callback={setCard} />
                  </div>
                  :
                  <div className='relative h-2/5 md:h-3/5 w-full flex flex-col justify-evenly items-center'>
                    <div className='z-10 h-max w-full bg-orange-500 '>
                      {game.started && <Vote />}
                    </div>
                    <div className='absolute top-6 right-0 z-10 flex justify-center'>
                      {(card != '' && game.story != '' && game.submittedCards.length == 0 && !submissionStatus.cardSubmitted) && <button onClick={submitCard} className='h-20 w-20 shadow-lg shadow-black rounded-bl-3xl bg-indigo-900 hover:bg-indigo-950 text-white'>OK</button>}
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
