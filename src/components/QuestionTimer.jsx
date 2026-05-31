import React from 'react';

const QuestionTimer = ({ timeLeft, initialTime = 5 }) => {
    // Calculate percentage remaining for the visual progress circle
    const percentage = (timeLeft / initialTime) * 100;

    // Determine the color theme based on urgency
    let timerColor = '#2196f3'; // Blue for normal state
    if (timeLeft <= initialTime * 0.4) {
        timerColor = '#ff9800'; // Orange for warning state (40% time left)
    }
    if (timeLeft <= initialTime * 0.2) {
        timerColor = '#f44336'; // Red for critical state (20% time left)
    }

    // SVG Configuration settings for the circle radius
    const radius = 24;
    const strokeDasharray = 2 * Math.PI * radius;
    const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '30px',
            border: `1px solid ${timeLeft <= initialTime * 0.2 ? '#ffcdd2' : '#e0e0e0'}`,
            width: 'fit-content',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'border-color 0.3s ease'
        }}>
            {/* Animated Progress Ring */}
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle track */}
                <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke="#e0e0e0"
                    strokeWidth="4"
                />
                {/* Colored active countdown segment */}
                <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke={timerColor}
                    strokeWidth="4"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                />
            </svg>

            {/* Numeric Timer Label */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85em', color: '#666', fontWeight: '500', textTransform: 'uppercase' }}>
                    Time Remaining
                </span>
                <span style={{
                    fontSize: '1.4em',
                    fontWeight: '800',
                    color: timerColor,
                    fontFamily: 'monospace',
                    transition: 'color 0.3s ease'
                }}>
                    {timeLeft}s
                </span>
            </div>
        </div>
    );
};

export default QuestionTimer;