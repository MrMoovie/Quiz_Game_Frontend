import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../style/StudentGamePage.css';
import { HOST } from "../Constants.js";

const StudentGamePageTest = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");

    // סטייט המשחק המרכזי
    const [track, setTrack] = useState({ id: 0, score: 0, pathChoice: 0 });
    const [question, setQuestion] = useState({ id: 0, text: '' });

    const [answerInput, setAnswerInput] = useState('');
    const [result, setResult] = useState(null);
    const [showPathChoice, setShowPathChoice] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. טעינת המשחק הראשונית
    const loadInitialGame = useCallback(() => {
        if (!token) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        axios.get(`${HOST}/get-track`, { params: { studentToken: token } })
            .then((res) => {
                if (res.data.success && res.data.track) {
                    const t = res.data.track;

                    setTrack({
                        id: t.id || 0,
                        score: t.score || 0,
                        pathChoice: t.path || 0
                    });

                    // בדיקה בטעינה: אם השחקן ב-40 נקודות ועדיין לא בחר מסלול
                    if (t.score === 40 && t.path === 0) {
                        setShowPathChoice(true);
                    } else if (t.currentQuestionId && t.currentQuestionId !== -1) {
                        axios.get(`${HOST}/getQuestion`, { params: { questionId: t.currentQuestionId } })
                            .then((qRes) => {
                                if (qRes.data.success && qRes.data.question) {
                                    setQuestion({ id: qRes.data.question.id, text: qRes.data.question.question });
                                }
                            });
                    }
                } else {
                    setError("Could not load track data.");
                }
            })
            .catch(() => setError("Connection lost."))
            .finally(() => setIsLoading(false));
    }, [token, navigate]);

    useEffect(() => {
        loadInitialGame();
    }, [loadInitialGame]);

    // 2. בקשת שאלה חדשה
    const handleGetNewQuestion = () => {
        setIsLoading(true);
        setError('');

        axios.get(`${HOST}/getNewQuestion`, {
            params: { studentToken: token, trackId: track.id, pathChoice: track.pathChoice }
        }).then((res) => {
            if (res.data.success && res.data.question) {
                setQuestion({ id: res.data.question.id, text: res.data.question.question });
                setAnswerInput('');
                setResult(null);
            } else {
                setError("Could not get a new question.");
            }
        })
            .catch(() => setError("Connection lost."))
            .finally(() => setIsLoading(false));
    };

    // 3. שליחת תשובה וניהול אופטימי של הניקוד ומסך הבחירה
    const handleSubmitAnswer = () => {
        if (answerInput === '') return;
        setIsLoading(true);

        axios.get(`${HOST}/submit-answer`, {
            params: {
                studentToken: token,
                trackId: track.id,
                questionId: question.id,
                answer: Number(answerInput)
            }
        }).then((res) => {
            if (res.data.success) {
                const isCorrect = res.data.question.answerRight;
                setResult(isCorrect);

                if (isCorrect) {
                    // מקדמים את הניקוד ב-10 נקודות כמקובל
                    let nextScore;
                    if (track.pathChoice === 1) {
                        nextScore = track.score + 5;
                    } else if (track.pathChoice === 2) {
                        nextScore = track.score + 20;
                    } else if (track.pathChoice === 0) {
                        nextScore = track.score + 10;
                    }
                    // חוק א': הגעה ל-40 נקודות בדיוק במסלול הרגיל -> עוצרים ומציגים בחירה
                    if (nextScore === 40 && track.pathChoice === 0) {
                        setTrack(prev => ({ ...prev, score: 40 }));
                        setShowPathChoice(true);
                        setIsLoading(false);
                        return;
                    }

                    // חוק ב': יציאה אוטומטית מהמסלול חזרה לדרך הרגילה (0) אחרי שאלה 8
                    let currentPath = track.pathChoice;
                    if (track.pathChoice === 2 && nextScore >= 80) {
                        currentPath = 0; // סיום Highway
                    } else if (track.pathChoice === 1 && nextScore >= 80) {
                        currentPath = 0; // סיום Dirt Road
                    }

                    // עדכון הסטייט המקומי
                    setTrack(prev => ({
                        ...prev,
                        score: nextScore,
                        pathChoice: currentPath
                    }));

                    // אם חזרנו למסלול הרגיל, נעדכן את השרת ברקע
                    if (currentPath === 0 && track.pathChoice !== 0) {
                        axios.get(`${HOST}/set-track`, {
                            params: { trackId: track.id, path: 0, pathChance: 0, powerUp: 0 }
                        });
                    }
                }
            } else {
                setError("Failed to submit answer.");
            }
        })
            .catch(() => setError("Connection lost."))
            .finally(() => setIsLoading(false));
    };

    // 4. בחירת מסלול ושליפת שאלה מתאימה מיידית
    const handleChoosePath = (choice) => {
        setIsLoading(true);

        // עדכון הפרונט
        setTrack(prev => ({
            ...prev,
            pathChoice: choice,
        }));
        setShowPathChoice(false);

        // עדכון השרת על שינוי המסלול
        axios.get(`${HOST}/set-track`, {
            params: { trackId: track.id, path: choice, pathChance: 0, powerUp: 0 }
        }).then((res) => {
            // שליפת שאלה חדשה מיד מתוך המסלול החדש שנבחר
            axios.get(`${HOST}/getNewQuestion`, {
                params: { studentToken: token, trackId: track.id, pathChoice: choice }
            }).then((qRes) => {
                if (qRes.data.success && qRes.data.question) {
                    setQuestion({ id: qRes.data.question.id, text: qRes.data.question.question });
                    setAnswerInput('');
                    setResult(null);
                }
            });
        })
            .catch(() => setError("Connection lost."))
            .finally(() => setIsLoading(false));
    };

    const GOAL_SCORE = 100; // מותאם לניקוד המקסימלי האפשרי במשחק
    if (isLoading && track.id === 0) return <div>Loading Race...</div>;

    return (
        <div className="student-game-page">
            <header className="student-game-page__header">
                <h2>Current Score: {track.score} / {GOAL_SCORE}</h2>
                {error && <p className="student-game-page__error" style={{ color: 'red' }}>{error}</p>}
            </header>

            <main className="student-game-page__main" style={{ margin: '20px 0' }}>

                {/* חלונית בחירת מסלול חוסמת ב-40 נקודות */}
                {showPathChoice ? (
                    <div className="path-choice-section" style={{ textAlign: 'center', padding: '40px 20px', border: '3px dashed #3f51b5', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                        <h2 style={{ color: '#3f51b5', marginBottom: '10px' }}>🌟 Choose Your Path 🌟</h2>
                        <h3 style={{ marginBottom: '25px' }}>Select your road for the next stages:</h3>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <button
                                onClick={() => handleChoosePath(2)}
                                disabled={isLoading}
                                className="student-game-page__btn"
                                style={{ backgroundColor: '#4CAF50', color: 'white', padding: '15px 30px', fontSize: '1.1em', cursor: 'pointer', borderRadius: '8px', border: 'none' }}
                            >
                                🛣️ High Way (+20 pts)
                            </button>
                            <button
                                onClick={() => handleChoosePath(1)}
                                disabled={isLoading}
                                className="student-game-page__btn"
                                style={{ backgroundColor: '#FF9800', color: 'white', padding: '15px 30px', fontSize: '1.1em', cursor: 'pointer', borderRadius: '8px', border: 'none' }}
                            >
                                🚜 Dirt Road (+5 pts)
                            </button>
                        </div>
                    </div>
                ) : (
                    /* מצב משחק רגיל */
                    <>
                        {question.id === 0 && (
                            <button
                                onClick={handleGetNewQuestion}
                                disabled={isLoading}
                                className="student-game-page__btn student-game-page__btn--add"
                            >
                                {isLoading ? "Loading..." : "Get Next Question"}
                            </button>
                        )}

                        {question.id !== 0 && (
                            <div className="student-game-page__question-card">
                                <div style={{ fontSize: '1.2em', marginBottom: '15px' }}>
                                    <strong>Question Text: </strong> {question.text}
                                    <span style={{ fontSize: '0.8em', marginLeft: '10px', color: '#666' }}>
                                        (Path: {track.pathChoice === 2 ? 'Highway' : track.pathChoice === 1 ? 'Dirt Road' : 'Regular'})
                                    </span>
                                </div>

                                {result === null ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder="Enter your answer"
                                            value={answerInput}
                                            onChange={(e) => setAnswerInput(e.target.value)}
                                            className="student-game-page__input"
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={isLoading || answerInput === ''}
                                            className="student-game-page__btn student-game-page__btn--submit"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`student-game-page__result ${result ? 'student-game-page__result--correct' : 'student-game-page__result--wrong'}`}>
                                        <h3>{result ? "✅ Correct!" : "❌ Incorrect"}</h3>
                                        <button
                                            onClick={handleGetNewQuestion}
                                            disabled={isLoading}
                                            className="student-game-page__btn student-game-page__btn--next"
                                        >
                                            Next Question
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default StudentGamePageTest;