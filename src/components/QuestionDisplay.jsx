import React from 'react';

const QuestionDisplay = ({ text, pathChoice }) => {
    // Determine the path label and specific badge colors based on the path ID
    let pathLabel = 'Regular Road';
    let badgeColor = '#ffffff';
    let badgeBg = '#2c3e50';

    if (pathChoice === 1) {
        pathLabel = '🚜 Dirt Road';
        badgeColor = '#ffffff';
        badgeBg = '#d35400';
    } else if (pathChoice === 2) {
        pathLabel = '🛣️ Highway';
        badgeColor = '#ffffff';
        badgeBg = '#27ae60';
    }

    return (
        <div style={{
            padding: '30px 20px',
            backgroundColor: '#f1c40f', // Solid yellow background
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centers content horizontally
            justifyContent: 'center',
            textAlign: 'center', // Aligns internal text blocks centrally
            direction: 'ltr' // Explicitly sets left-to-right text flowing direction
        }}>
            {/* The Question Text (No "Question:" prefix anymore) */}
            <div style={{
                fontSize: '1.4em',
                lineHeight: '1.5',
                color: '#000000', // Black text for high contrast readability against yellow
                fontWeight: '600',
                marginBottom: '16px',
                width: '100%'
            }}>
                {text || "Waiting for question..."}
            </div>

            {/* Path Status Badge placed below the question text */}
            <div>
                <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85em',
                    fontWeight: '700',
                    color: badgeColor,
                    backgroundColor: badgeBg,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    Current Path: {pathLabel}
                </span>
            </div>
        </div>
    );
};

export default QuestionDisplay;