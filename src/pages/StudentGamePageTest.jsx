import {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../style/StudentGamePage.css';
import {HOST} from "../Constants.js";


const StudentGamePageTest = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");

    // ==========================================
    // 1. CLEAN STATE BUCKETS
    // ==========================================

    // UI State: Controls loading spinners and errors
    const [ui, setUi] = useState({isLoading: true, error: ''});

    // Track State: The player's progress and stats
    const [track, setTrack] = useState({id: 0, score: 0, position: 0, pathChoice: 0, currentQuestionId: -1});

    // Question State: The current hurdle
    const [question, setQuestion] = useState({id: 0, text: ''});

    // Interaction State: What the user is doing right now
    const [interaction, setInteraction] = useState({
        answerInput: '',
        result: null // null = waiting to answer, true = correct, false = wrong
    });

    // Fetch the specific text of a question if we have an ID
    const fetchQuestionText = useCallback((questionId) => {
        axios.get(`${HOST}/getQuestion`, {params: {questionId}})
            .then((res) => {
                if (res.data.success) {
                    setQuestion({ id: res.data.question.id, text: res.data.question.question });
                    setInteraction(prev => ({ ...prev, result: res.data.question.answerRight}));
                } else {
                    setUi({isLoading: false, error: ''});
                }
            })
            .catch(() => setUi({isLoading: false, error: "Failed to load question text."}));
    }, []);

    // Initial Load: Get the track, and if there's an active question, load it.
    const loadInitialGame = useCallback(() => {

        if (!token) {
            navigate("/");
            return;
        }

        setUi(prev => ({...prev, isLoading: true}));

        axios.get(`${HOST}/get-track`, {params: {studentToken: token}})
            .then((res) => {
                if (res.data.success) {
                    const t = res.data.track;
                    setTrack({
                        id: t.id,
                        score: t.score,
                        position: t.position,
                        pathChoice: t.path,
                        currentQuestionId: t.currentQuestionId
                    });
                    if (t.currentQuestionId !== -1) {
                        fetchQuestionText(t.currentQuestionId);
                        setUi({isLoading: false, error: ''});
                    }
                } else {
                    setUi({isLoading: false, error: "Could not load track data."});
                }
            })
            .catch(() => setUi({isLoading: false, error: "Connection lost."}));
    }, [token, navigate, fetchQuestionText]);

    // Triggers on page load
    useEffect(() => {
        loadInitialGame();
    }, [loadInitialGame]);

    // Request a new question from the server
    const handleGetNewQuestion = () => {
        setUi({isLoading: true, error: ''});

        axios.get(`${HOST}/getNewQuestion`, {
            params: {studentToken: token, trackId: track.id, pathChoice: track.pathChoice}
        }).then((res) => {
            if (res.data.success) {
                setQuestion({id: res.data.question.id, text: res.data.question.question});
                setInteraction({answerInput: '', result: null}); // Reset inputs
                setUi({isLoading: false, error: ''});
            } else {
                setUi({isLoading: false, error: "Could not get a new question."});
            }
        }).catch(() => setUi({isLoading: false, error: "Connection lost."}));
    };

    // Submit the typed answer
    const handleSubmitAnswer = () => {
        if (interaction.answerInput === '') return;

        setUi({isLoading: true, error: ''});

        axios.get(`${HOST}/submit-answer`, {
            params: {
                studentToken: token,
                trackId: track.id,
                questionId: question.id,
                answer: Number(interaction.answerInput)
            }
        }).then((res) => {
            if (res.data.success) {
                const isCorrect = res.data.question.answerRight;

                // Update interaction state to show the result UI
                setInteraction(prev => ({...prev, result: isCorrect}));

                // If correct, update the local score (Server is already updated via backend)
                if (isCorrect) {
                    setTrack(prev => ({...prev, score: prev.score + 10}));
                }

                setUi({isLoading: false, error: ''});
            } else {
                setUi({isLoading: false, error: "Failed to submit answer."});
            }
        }).catch(() => setUi({isLoading: false, error: "Connection lost."}));
    };


    // ==========================================
    // 3. RENDER UI
    // ==========================================

    const GOAL_SCORE = 100;

    if (ui.isLoading && track.id === 0) return <div>Loading Race...</div>;

    return (
        <div className="student-game-page">
            <header className="student-game-page__header">
                <h2>Current Score: {track.score} / {GOAL_SCORE}</h2>
                {ui.error && <p className="student-game-page__error" style={{color: 'red'}}>{ui.error}</p>}
            </header>

            <main className="student-game-page__main" style={{margin: '20px 0'}}>

                {/* SCENARIO A: No active question */}
                {question.id === 0 && (
                    <button
                        onClick={handleGetNewQuestion}
                        disabled={ui.isLoading}
                        className="student-game-page__btn student-game-page__btn--add"
                    >
                        {ui.isLoading ? "Loading..." : "Get Next Question"}
                    </button>
                )}

                {/* SCENARIO B: Has an active question */}
                {question.id !== 0 && (
                    <div className="student-game-page__question-card">
                        <div style={{fontSize: '1.2em', marginBottom: '15px'}}>
                            <strong>Question: </strong> {question.text}
                        </div>

                        {/* If they haven't answered yet, show the input form */}
                        {interaction.result === null ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Enter your answer"
                                    value={interaction.answerInput}
                                    onChange={(e) => setInteraction(prev => ({...prev, answerInput: e.target.value}))}
                                    className="student-game-page__input"
                                    disabled={ui.isLoading}
                                />
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={ui.isLoading || interaction.answerInput === ''}
                                    className="student-game-page__btn student-game-page__btn--submit"
                                >
                                    Submit
                                </button>
                            </div>
                        ) : (
                            /* If they DID answer, show the result and the "Next" button */
                            <div
                                className={`student-game-page__result ${interaction.result ? 'student-game-page__result--correct' : 'student-game-page__result--wrong'}`}>
                                <h3>{interaction.result ? "✅ Correct! (+10 pts)" : "❌ Incorrect"}</h3>
                                <button
                                    onClick={handleGetNewQuestion}
                                    disabled={ui.isLoading}
                                    className="student-game-page__btn student-game-page__btn--next"
                                >
                                    Next Question
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentGamePageTest;