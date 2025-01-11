import React, { useState, useEffect } from 'react';
import { generateCardDeck, getRandomFact } from '../utilities/gameUtils';
import { Card } from '../components/Card';
import { Scoreboard } from '../components/Scoreboard';
import { FactBanner } from '../components/Factbanner';
import ChatInterface from '../components/ChatInterface.Jsx';
import './Game.css';

export const Game = () => {
    const [deck, setDeck] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [players, setPlayers] = useState([
        { name: 'Alice', score: 0 },
        { name: 'Bob', score: 0 },
        { name: 'Charlie', score: 0 },
    ]);
    const [fact, setFact] = useState('');
    const [showTurnPopup, setShowTurnPopup] = useState(false);
    const [showFactPopup, setShowFactPopup] = useState(false);
    const [factMessage, setFactMessage] = useState('');
    const [canClick, setCanClick] = useState(true);

    useEffect(() => {
        if (deck.length === 0) {
            setDeck(generateCardDeck());
        }
        if (!fact) {
            setFact(getRandomFact());
        }
        // Show turn message at the start of the game or after switching turns
        setFactMessage(`${players[currentPlayer].name}'s Turn`);
        setShowTurnPopup(true);
        setCanClick(false);
        setTimeout(() => {
            setShowTurnPopup(false);
            setCanClick(true);
        }, 2000);
    }, [currentPlayer, deck, fact, players]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [firstCard, secondCard] = flippedCards;
            setCanClick(false);
            if (firstCard.icon === secondCard.icon && firstCard.id !== secondCard.id) {
                setMatchedCards([...matchedCards, firstCard.icon]);
                updateScore();
                setFact(getRandomFact());
                setFactMessage(`Great match! ${fact}`);
                setShowFactPopup(true); // Show fact popup when player scores
            } else {
                setTimeout(() => {
                    setFlippedCards([]);
                    setCanClick(true);
                }, 1000);
            }
            setTimeout(() => switchTurn(), 1000);
        }
    }, [flippedCards]);

    const handleCardClick = (clickedCard) => {
        if (!canClick || flippedCards.length === 2 || flippedCards.some(card => card.id === clickedCard.id)) return;
        setFlippedCards([...flippedCards, clickedCard]);
    };

    const updateScore = () => {
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayer].score += 2;
        setPlayers(updatedPlayers);
    };

    const switchTurn = () => {
        setCurrentPlayer((currentPlayer + 1) % players.length);
        setFlippedCards([]);
    };

    const startNewGame = () => {
        // Reset the game state only when a user clicks to start a new game
        setDeck(generateCardDeck());
        setMatchedCards([]);
        setFact(getRandomFact());
        setPlayers(players.map(player => ({ ...player, score: 0 })));
        setCurrentPlayer(0);
        setShowTurnPopup(true);
        setCanClick(false);
        setTimeout(() => {
            setShowTurnPopup(false);
            setCanClick(true);
        }, 2000);
    };

    const closeFactPopup = () => {
        // Close the fact popup and then show the turn message
        setShowFactPopup(false);
        setFactMessage(`${players[currentPlayer].name}'s Turn`);
        setShowTurnPopup(true);
        setTimeout(() => {
            setShowTurnPopup(false);
        }, 2000);
    };

    return (<> 
    <div className="container mx-auto p-4">
      <ChatInterface />
    </div>
        <div className="game">
            {/* Fact Popup (Amazon-related) */}
            {showFactPopup && (
                <div className="popup fact-popup">
                    <button className="close-btn" onClick={closeFactPopup}>×</button>
                    <FactBanner fact={fact}/>
                </div>
            )}

            {/* Turn Popup */}
            {showTurnPopup && !showFactPopup && (
                <div className="popup turn-popup">
                    <p>{`${players[currentPlayer].name}'s Turn`}</p>
                </div>
            )}

            <FactBanner fact={fact} />
            <Scoreboard players={players} />
            <div className="card-grid">
                {deck.map(card => (
                    <Card
                        key={card.id}
                        card={card}
                        onClick={handleCardClick}
                        isFlipped={
                            flippedCards.some(c => c.id === card.id) ||
                            matchedCards.includes(card.icon)
                        }
                    />
                ))}
            </div>
            <button onClick={startNewGame} className="new-game-button">Start New Game</button>
        </div>
        </>
    );
};
