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
        setStoryteller(game.storyteller);
    }, []);

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
    return (
        <div className="h-1/2 w-11/12 mb-2 lg: bg-center bg-cover bg-[url('./assets/desertDay1.jpeg')]  rounded-md contain-content border-2 border-white overflow-clip flex flex-col justify-center items-center text-white">
            <p className='w-4/5 text-center text-white'>Score board</p>
            <div className="w-4/5 h-3/5 p-5 bg-gradient-to-b bg-violet-950 rounded-md text-black overflow-y-scroll no-scroll">
                {Object.entries(game.playersData).map(([id, score]) =>
                    <div className='flex justify-between mb-1'>
                        <span className='w-2/3 text-center mr-1 bg-white'>{usersRegistry[id]}</span><span className='w-1/3 text-center bg-white'>{score}</span>
                    </div>)
                }
            </div>

            <div className='flex flex-col items-center'>
                <h2 className='text-base font-bold text-white underline'>riddle </h2>
                {game.story && <p className='px-2 rounded-md text-base text-black italic bg-yellow-400'>{game.story}</p>}

                {/* game res modal */}
                {game.submittedCards.length != 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full top-0 bg-indigo-950 bg-opacity-70 backdrop-blur-sm'>
                        <div className='flex'>
                            {game.submittedCards.map((card, index) =>
                                <Card key={index} type={type} card={card.card} />
                            )}
                        </div>
                        <p>choose the numbers below to vote</p>
                    </div>
                }
                {
                    Object.keys(roundResults).length != 0 &&
                    <div className='absolute flex flex-col justify-center items-center h-full w-full top-0 bg-indigo-950 bg-opacity-85 backdrop-blur-sm'>
                        <div className='flex flex-col w-3/4 items-center'>
                            {
                                Object.entries(roundResults).map(([id, obj]) =>
                                    <div className="w-max">
                                        {
                                            (!obj.storyteller && obj.score === 0) &&
                                            <p><IoPerson className="pb-1 inline text-xl text-indigo-500" />{usersRegistry[id]} : <IoCloseCircle className="inline text-3xl text-red-500" /> <span className="text-xl font-bold text-white">+{obj.score}</span></p>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 2) &&
                                            <p><IoPerson className="pb-1 inline text-xl text-indigo-500" />{usersRegistry[id]} : <IoCheckmarkCircle className="inline text-3xl text-green-500" /> <span className="text-xl font-bold text-white">+{obj.score}</span></p>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 1) &&
                                            <div>
                                                <p><IoPerson className="pb-1 inline text-xl text-indigo-500" />{usersRegistry[id]} : <IoCloseCircle className="inline text-3xl text-red-500" /></p>
                                                <p><IoPerson className="pb-1 placeholder:inline text-xl text-indigo-500" />{usersRegistry[id]} : your card was choosen <IoCheckbox className="inline text-3xl text-yellow-400" /><span className="text-xl font-bold text-white">+{obj.score}</span></p>
                                            </div>
                                        }

                                        {
                                            (!obj.storyteller && obj.score === 3) &&
                                            <div>
                                                <p><IoPerson className="pb-1 inline text-xl text-indigo-500" />{usersRegistry[id]} : <IoCheckmarkCircle className="inline text-3xl text-green-500" /></p>
                                                <p><IoPerson className="pb-1 inline text-xl text-indigo-500" />{usersRegistry[id]} : your card was choosen <IoCheckbox className="inline text-3xl text-yellow-400" /><span className="text-xl font-bold text-white">+{obj.score}</span></p>
                                            </div>
                                        }


                                    </div>
                                )
                            }
                            <div className="m-2">Story teller scored : +{roundResults[storyteller].score}</div>
                        </div>
                        
                        <button onClick={OKbutton} className="border-2 border-white py-1 px-3 rounded-lg hover:bg-white hover:bg-opacity-25">OK</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default Board;