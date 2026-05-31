import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { HOST } from "../Constants.js";
import '../style/StudentMenuPage.css'; // Reuses your beautiful, existing menu/table styles!

const ResultsPage = () => {
    const navigate = useNavigate();
    const { raceId } = useParams();
    const location = useLocation();
    const token = Cookies.get("token");

    // Extract the winner name passed from the live event route push
    const winnerName = location.state?.winner || "Race Champion";

    const [scoreboard, setScoreboard] = useState([]);
    const [goalScore, setGoalScore] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadFinalResults = useCallback(() => {
        if (!token || !raceId) return;
        setIsLoading(true);
        setError('');

        // Hits your clean new designated controller endpoint
        axios.get(`${HOST}/get-race-results`, {
            params: {
                token: token,
                raceId: raceId
            }
        })
            .then((res) => {
                if (res.data.success && res.data.students) {
                    setScoreboard(res.data.students); // Already sorted descending by the backend!
                    if (res.data.goalScore) {
                        setGoalScore(res.data.goalScore);
                    }
                } else {
                    setError("Failed to process final leaderboard.");
                }
            })
            .catch(() => setError("Network connection lost."))
            .finally(() => setIsLoading(false));
    }, [token, raceId]);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        loadFinalResults();
    }, [token, navigate, loadFinalResults]);

    return (
        <div className="card">
            <div className="student-menu-container">

                {/* Clean Winner Announcement Header */}
                <div className="student-menu-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🏆 <strong>{winnerName} Won!</strong> 🏆</span>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Final Race Standings (Target: {goalScore} pts)</span>
                    {error && <span style={{ fontSize: '0.85rem', color: 'red' }}>{error}</span>}
                </div>

                {/* Scoreboard Render Area */}
                <div className="student-menu-scrollable">
                    <table className="races-table">
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Student Name</th>
                            <th>Final Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scoreboard.map((student, index) => (
                            <tr key={student.id}>
                                <td style={{ fontWeight: 'bold' }}>
                                    {index === 0 ? "🥇 1" : index === 1 ? "🥈 2" : index === 2 ? "🥉 3" : index + 1}
                                </td>
                                <td>{student.fullname}</td>
                                <td>{student.score} / {goalScore}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Secure Back Navigation Dashboard Route */}
                <div style={{ marginTop: '20px', flexShrink: 0 }}>
                    <button
                        onClick={() => navigate('/menu')}
                        className="logout-button"
                        style={{ width: '100%', padding: '12px', backgroundColor: '#2C3E50', fontWeight: 'bold' }}
                    >
                        Back to Main Dashboard
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ResultsPage;