import React from 'react';

const CarProgressBar = ({ score, goalScore = 100 }) => {
    // Calculate progress percentage
    const progressPercent = Math.min((score / goalScore) * 100, 100);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '32px', // Made slightly taller to fit the car cleanly
            background: '#e0e0e0',
            borderRadius: '16px',
            margin: '10px 0',
            border: '2px solid #bdc3c7',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {/* The Progress Bar Fill */}
            <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: progressPercent >= 100
                    ? 'linear-gradient(90deg, #2ecc71, #27ae60)' // Green gradient when finished
                    : 'linear-gradient(90deg, #3498db, #2980b9)', // Blue gradient while racing
                borderRadius: '14px',
                transition: 'width 0.5s ease-out',
                position: 'relative'
            }} />

            {/* The Floating Moving Car */}
            <div style={{
                position: 'absolute',
                top: '50%',
                // Left tracks the exact percentage but offsets itself slightly backwards
                // so the car doesn't slide off the right edge at 100%
                left: `calc(${progressPercent}% - 18px)`,
                // scaleX(-1) mirrors the car horizontally to face the right direction (forward)
                transform: 'translateY(-50%) scaleX(-1)',
                fontSize: '24px',
                transition: 'left 0.5s ease-out',
                zIndex: 2,
                pointerEvents: 'none',
                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))',
                // Keep the car bounded at the very start of the race track
                visibility: progressPercent === 0 && score === 0 ? 'hidden' : 'visible'
            }}>
                🏎️
            </div>

            {/* Subtle Starting Line indicator if car is hidden at 0% */}
            {progressPercent === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '8px',
                    transform: 'translateY(-50%)',
                    fontSize: '20px',
                    opacity: 0.6
                }}>
                    🏁
                </div>
            )}
        </div>
    );
};

export default CarProgressBar;