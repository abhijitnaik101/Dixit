import React, { useEffect } from "react";
import { cardData } from "../assets/cardData";

const Card = ({type, card})  => {
    const url = '/'+type+'/card'+card.toString()+'.jpeg';
    return(
        <div className="m-2 p-1 w-28 h-40 md:w-36 md:h-48 rotate-3 hover:rotate-0 shadow-indigo-900 shadow-md border-2 border-black rounded-lg bg-white hover:border-black hover:shadow-sm hover:scale-105 duration-300">
            <img src={url} className="w-full h-full rounded-md object-cover object-center"/>
        </div>
    )
}

export default Card;