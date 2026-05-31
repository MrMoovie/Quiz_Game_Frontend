import React, { useState } from 'react';
import '../style/CreateRaceModal.css'; // ===> IMPORTING YOUR NEW STYLESHEET HERE <===

function CreateRaceModal({ isOpen, onClose, onSubmit, isWaiting }) {
    const [goalScore, setGoalScore] = useState(100);
    const [maxCapacity, setMaxCapacity] = useState(8);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(Number(goalScore), Number(maxCapacity));
    };

    return (
        <div className="create-race-modal-overlay">
            <div className="create-race-modal-box">
                <div className="create-race-modal-content">

                    {/* Header Title Title Element */}
                    <div className="create-race-modal-header">
                        <span><strong>🏎️ Setup New Race</strong></span>
                    </div>

                    {/* Configuration Submissions Form */}
                    <form onSubmit={handleSubmit} className="create-race-modal-form">

                        {/* Target Victory Points Threshold */}
                        <div className="create-race-modal-field">
                            <label>Target Goal Score:</label>
                            <input
                                type="number"
                                min="10"
                                max="1000"
                                value={goalScore}
                                onChange={(e) => setGoalScore(e.target.value)}
                                required
                            />
                        </div>

                        {/* Maximum Students Joined Limit Constraint */}
                        <div className="create-race-modal-field" style={{ marginBottom: '10px' }}>
                            <label>Max Capacity (Students):</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(e.target.value)}
                                required
                            />
                        </div>

                        {/* Control Interactivity Layout Row */}
                        <div className="create-race-modal-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isWaiting}
                                className="create-race-modal-btn create-race-modal-btn--cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isWaiting}
                                className="create-race-modal-btn create-race-modal-btn--submit"
                            >
                                {isWaiting ? "Saving..." : "Create"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateRaceModal;