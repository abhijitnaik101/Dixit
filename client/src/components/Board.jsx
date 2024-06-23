import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameState, userRegistryState } from "../state/atoms";
import Card from "./Card";
import socket from "../socket";
import { IoCheckbox, IoCheckmarkCircle, IoCloseCircle, IoPerson } from "react-icons/io5";

const Board = () => {

    const game = useRecoilValue(gameState);
    const [roundResults, setRoundResults] = useState({});
    const [storyteller, setStoryteller] = useState("");
    const usersRegistry = useRecoilValue(userRegistryState);
    const type = 'characters';
    useEffect(() => {
        if(game.storyteller && !storyteller)
        setStoryteller(game.storyteller);
    }, [game.storyteller]);

    function OKbutton() {
        setRoundResults({});
        setStoryteller(game.storyteller);
    }


    socket.on('roundResults', (scores) => {
        setRoundResults(scores);
        console.log(scores);
    });
    //bg-[url('./assets/vectorSpace2.jpeg')]
    //from-[#553CCE] via-[#3F2BB6] to-[#2C2AA0]
    //bg-gradient-to-b from-[#131974] to-violet-900
    //bg-center bg-cover bg-[url('./assets/desertDay1.jpeg')] contain-content
    return (
        <div className="z-10 relative h-3/5 w-full bg-gradient-to-b from-indigo-500 to-purple-500 overflow-clip flex flex-col justify-center items-center text-white">
            <p className='w-4/5 text-center text-white'>Score board</p>
            <div className="w-4/5 h-3/5 p-5 bg-cover bg-indigo-900 rounded-md text-black overflow-y-scroll no-scroll">
                {Object.entries(game.playersData).map(([id, score]) =>
                    <div key={id} className='flex justify-between mb-1'>
                        <span className='w-2/3 text-center mr-1 bg-indigo-500 text-white'>{usersRegistry[id]}</span><span className='w-1/3 text-center bg-indigo-500 text-white'>{score}</span>
                    </div>)
                }
            </div>

            <div className='flex flex-col items-center'>
                <h2 className='text-base font-bold text-white underline'>riddle </h2>
                {game.story && <p className='px-2 rounded-md text-base text-black italic bg-purple-300'>{game.story}</p>}

                {/* game res modal */}
                {game.submittedCards.length != 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full z-20 top-0 bg-indigo-950 bg-opacity-70 backdrop-blur-sm'>
                        <div className='flex justify-start w-full overflow-x-scroll no-scroll'>
                            {game.submittedCards.map((card, index) =>
                                <div><Card key={index} type={type} card={card.card} /></div>
                            )}
                        </div>
                        {socket.id == game.storyteller ? <p>Waiting for guessers</p>: <p>choose the numbers below to vote</p>}
                        
                    </div>
                }
                {
                    Object.keys(roundResults).length !== 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full top-0 bg-indigo-950 bg-opacity-85 backdrop-blur-sm'>
                        <div className='flex flex-col h-3/5 w-3/4 items-start overflow-y-scroll no-scroll'>
                            {
                                Object.entries(roundResults).map(([id, obj]) =>
                                    <div key={id} className="w-max">
                                        {
                                            (!obj.storyteller && obj.score === 0) &&
                                            <p>{usersRegistry[id]} :<IoCloseCircle className="inline text-3xl text-red-500" /><span className="text-xl font-bold text-white"> 0 </span></p>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 2) &&
                                            <p>{usersRegistry[id]} :<IoCheckmarkCircle className="inline text-3xl text-green-500" /><span className="text-xl font-bold text-white"> +2 </span></p>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 1) &&
                                            <div className="flex flex-col items-center">
                                                <p>{usersRegistry[id]} : 
                                                 <IoCloseCircle className="inline text-3xl text-red-500" />
                                                 <IoCheckbox className="inline text-3xl text-yellow-400" />
                                                 <span className="text-xl font-bold text-white"> +1 </span></p>
                                            </div>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 3) &&
                                            <div className="flex flex-col items-center">
                                                <p>{usersRegistry[id]} : 
                                                 <IoCheckmarkCircle className="inline text-3xl text-green-500" />
                                                 <IoCheckbox className="inline text-3xl text-yellow-400" />
                                                 <span className="text-xl font-bold text-white"> +3 </span></p>
                                            </div>
                                        }
                                    </div>
                                )
                            }
                            
                            <div>
                                {roundResults[storyteller] && <p>{usersRegistry[storyteller]} : +{roundResults[storyteller].score}</p>}
                            </div>
                        </div>
                        
                        <button onClick={OKbutton} className="m-2 border-2 border-white py-1 px-3 rounded-lg hover:bg-white hover:bg-opacity-25">OK</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default Board;