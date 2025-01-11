import React from 'react';

export const Scoreboard = ({ players }) => {
    return (
        <div className="scoreboard">
            {players.map(player => (
                <div key={player.name} className="player-score">
                    {player.name}: {player.score} points
                </div>
            ))}
        </div>
    );
};
