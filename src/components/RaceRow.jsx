import React, { useState } from 'react';
import '../style/RaceRow.css';

const RaceRow = ({ race, isWaiting, onJoin, invalidCode }) => {
    const [entryCode, setEntryCode] = useState('');

    const getStatusText = (status) => {
        switch (status) {
            case 0: return "Open";
            case 1: return "Closed";
            case 2: return "Finished";
            default: return "Unknown";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return "race-row__status--open";
            case 1: return "race-row__status--closed";
            case 2: return "race-row__status--finished";
            default: return "race-row__status--unknown";
        }
    };

    const handleJoinClick = () => {
        if (!entryCode.trim()) return;
        onJoin(race.id, entryCode);
        setEntryCode('');
    };

    return (
        <tr>
            <td>{race.id}</td>
            <td>
                <span className={`race-row__status ${getStatusClass(race.status)}`}>
                    {getStatusText(race.status)}
                </span>
            </td>
            <td>
                <div className="race-row__action-container">
                    <input
                        type="text"
                        placeholder="Code"
                        className="race-row__input"
                        value={invalidCode ? "" : entryCode}
                        onChange={(e) => setEntryCode(e.target.value)}
                    />
                    <button
                        onClick={handleJoinClick}
                        className="race-row__button"
                        disabled={isWaiting || !entryCode || race.status !== 0}
                    >
                        {isWaiting ? "..." : "Join"}
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default RaceRow;