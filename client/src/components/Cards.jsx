import React, { useEffect, useState } from "react";
import { deckState, gameState, playerState } from "../state/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import socket from "../socket";
import { cardData } from "../assets/cardData";
import Card from "./Card";
const Cards = ({ callback }) => {
    
    const game = useRecoilValue(gameState);
    const [deck, setDeck] = useRecoilState(deckState);
    const [player] = useRecoilState(playerState);
    const [card, setCard] = useState(null);
    const type = 'characters';

    useEffect(()=> setCard(null), [game.storyteller])
    
   
    socket.on('dealCards', (cards) => {
        setDeck([...cards[player.id]]);
    });

    function chooseCard(card){
        setCard(card);
        callback(card);
    }

    return (
        <div className="z-0 h-full w-full bg-cover rounded-md bg-black bg-opacity-45 backdrop-blur-sm text-white flex flex-col items-center">
            {card && 
            <div className="absolute flex justify-center rounded-br-3xl items-start z-10 h-24 w-20 left-0 top-0 bg-gradient-to-b from-indigo-950 to-indigo-900 backdrop-blur-sm shadow-lg shadow-indigo-950">
                <div className="absolute -rotate-3 -left-8 -top-10 md:-top-16 z-10 scale-[40%]"><Card type={type} card={card}/></div>
            </div>}
            <div className="h-full w-full px-5 md:w-3/4 flex bg-indigo-800 justify-start items-end overflow-x-auto scroll-blue-sharp">
                {
                    deck.map((card, index) =>
                        <button key={index} onClick={() => chooseCard(card)} ><Card type={type} card={card}/></button>
                    )
                }
            </div>
            
        </div>
    )
}

export default Cards;