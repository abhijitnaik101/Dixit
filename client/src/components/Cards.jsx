import React, { useEffect, useState } from "react";
import { deckState, playerState } from "../state/atoms";
import { useRecoilState } from "recoil";
import socket from "../socket";
import { cardData } from "../assets/cardData";
import Card from "./Card";
const Cards = ({ callback }) => {
    const [deck, setDeck] = useRecoilState(deckState);
    const [player] = useRecoilState(playerState);
    const [card, setCard] = useState('');
    
   
    socket.on('dealCards', (cards) => {
        console.log(cards);
        setDeck([...cards[player.id]]);
    });

    function chooseCard(card){
        setCard(card);
        callback(card);
    }

    return (
        <div className="h-full w-full bg-cover bg-white bg-opacity-15 backdrop-blur-sm text-white flex flex-col items-center">
            {card && <div className="absolute -top-12 z-10 scale-[40%]"><Card card={cardData[card]}/></div>}
            <p className="p-5 w-full">Your Card: </p>
            <div className="h-full w-11/12  md:w-3/4 flex justify-start items-end overflow-x-auto scroll-blue-sharp">
                {
                    deck.map((card, index) =>
                        <button key={index} onClick={() => chooseCard(card)} ><Card card={cardData[card]}/></button>
                    )
                }
            </div>
            
        </div>
    )
}

export default Cards;