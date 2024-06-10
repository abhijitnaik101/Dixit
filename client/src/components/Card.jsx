import React, { useEffect } from "react";
import { cardData } from "../assets/cardData";

const Card = ({card})  => {
    
    return(
        <div className="m-2 p-1 w-28 h-40 md:w-36 md:h-48 shadow-indigo-900 shadow-md border-2 border-black rounded-lg bg-white hover:border-black hover:shadow-sm hover:scale-105 duration-300 ">
            <img src={card} className="w-full h-full rounded-md"/>
        </div>
    )
}

export default Card;