import React from 'react';
import './FactBanner.css';

export const FactBanner = ({ fact }) => {
    return (
        <div className="fact-banner">
            <p>{fact}</p>
        </div>
    );
};
