import React, { useEffect } from "react";
import { cardData } from "../assets/cardData";

const Card = ({card})  => {
    
    return(
        <div className="m-2 p-1 w-28 h-40 md:w-36 md:h-48 border-2 border-black rounded-lg bg-white hover:border-white ">
            {console.log(card)}
            <img src={card} className="w-full h-full rounded-lg"/>
        </div>
    )
}

export default Card;