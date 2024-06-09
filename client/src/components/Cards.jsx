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
        <div className="h-full w-full backdrop-blur-md text-white flex flex-col items-center">
            <p>card : {card}</p>
            <div className="h-full w-full md:w-3/4 flex justify-start overflow-x-auto scroll-blue-sharp">
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