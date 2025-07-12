import React from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'
const Votes = ({ vote, handleVote }) => {
    return (
        <div className="flex flex-col items-center justify-start pt-2 text-gray-600">
            <button onClick={() => handleVote("up")}>
                <FaArrowUp className="hover:text-green-600" />
            </button>
            <p className="font-semibold text-lg">{vote}</p>
            <button onClick={() => handleVote("down")}>
                <FaArrowDown className="hover:text-red-600" />
            </button>
        </div>
    )
}

export default Votes