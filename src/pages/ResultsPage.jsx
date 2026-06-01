import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import {HOST} from "../Constants.js";
import '../style/StudentMenuPage.css';

const ResultsPage = () => {
    const navigate = useNavigate();
    const {raceId} = useParams();
    const location = useLocation();
    const token = Cookies.get("token");

    const winnerName = location.state?.winner || "Race Champion";

    // הגדרת שתי רשימות נפרדות בסטייט
    const [studentsBoard, setStudentsBoard] = useState([]);
    const [tracksBoard, setTracksBoard] = useState([]);

    const [goalScore, setGoalScore] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const loadFinalResults = useCallback(() => {
        if (!token || !raceId) return;
        setIsLoading(true);
        setError('');

        axios.get(`${HOST}/get-race-results`, {
            params: {
                token: token,
                raceId: raceId
            }
        })
            .then((res) => {
                // שמירת שתי הרשימות הנפרדות שמגיעות מה-Response של השרת
                if (res.data.success && res.data.students && res.data.tracks) {
                    setStudentsBoard(res.data.students);
                    setTracksBoard(res.data.tracks);

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

    // הפונקציה המקורית שלך לניהול מחיקה וניווט
    const handleDeleteAndNavigate = () => {
        if (!raceId) return;

        setIsDeleting(true);
        setError('');

        axios.post(`${HOST}/get-user-type`, null, {
            params: {
                token: token
            }
        }).then((res) => {
            if (res.data.userType === 2) {
                axios.post(`${HOST}/delete-race`, null, {
                    params: {
                        raceId: raceId
                    }
                }).catch(() => {
                    setError("Network error while trying to delete the race.");
                    setIsDeleting(false);
                });
            }
            navigate('/menu');
        }).catch(() => {
            setError("Failed to authenticate user type.");
            setIsDeleting(false);
        });
    };

    return (
        <div className="card">
            <div className="student-menu-container">

                <div className="student-menu-header"
                     style={{justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: '5px'}}>
                    <span style={{fontSize: '1.4rem'}}>🏆 <strong>{winnerName} Won!</strong> 🏆</span>
                    <span style={{
                        fontSize: '0.9rem',
                        color: '#666'
                    }}>Final Race Standings (Target: {goalScore} pts)</span>
                    {error && <span style={{fontSize: '0.85rem', color: 'red'}}>{error}</span>}
                </div>

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
                        {/* רצים על רשימת הסטודנטים הנפרדת */}
                        {studentsBoard.map((student, index) => {
                            // מושכים את הטרק המתאים לפי אותו אינדקס בדיוק כדי לקבל את ה-score
                            const matchingTrack = tracksBoard[index];
                            const score = matchingTrack ? matchingTrack.score : 0;

                            return (
                                <tr key={student.id}>
                                    <td style={{fontWeight: 'bold'}}>
                                        {index === 0 ? "🥇 1" : index === 1 ? "🥈 2" : index === 2 ? "🥉 3" : index + 1}
                                    </td>
                                    {/* השם נלקח ישירות מאובייקט הסטודנט ללא קשר לטרק */}
                                    <td>{student.fullname || student.fullName}</td>
                                    {/* הניקוד מגיע מהטרק המקביל באותו המיקום */}
                                    <td>{score} / {goalScore}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div style={{marginTop: '20px', flexShrink: 0}}>
                    <button
                        onClick={handleDeleteAndNavigate}
                        disabled={isDeleting || isLoading}
                        className="logout-button"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: isDeleting ? '#7f8c8d' : '#2C3E50',
                            fontWeight: 'bold',
                            cursor: (isDeleting || isLoading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isDeleting ? "Processing..." : "Go to Dashboard"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ResultsPage;