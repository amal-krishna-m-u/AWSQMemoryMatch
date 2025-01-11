import React, { useEffect, useState } from 'react';
import './Card.css';

export const Card = ({ card, onClick, isFlipped }) => {
    const [showFront, setShowFront] = useState(isFlipped);

    useEffect(() => {
        let timer;
        if (isFlipped && !showFront) {
            setShowFront(true);
        } else if (!isFlipped && showFront) {
            timer = setTimeout(() => setShowFront(false), 1000); // Delay of 2 seconds
        }
        return () => clearTimeout(timer);
    }, [isFlipped, showFront]);

    return (
        <div className={`card ${showFront ? 'flipped' : ''}`} onClick={() => onClick(card)}>
            {showFront ? <div className="card-icon">{card.icon}</div> : <div className="card-back" />}
        </div>
    );
};