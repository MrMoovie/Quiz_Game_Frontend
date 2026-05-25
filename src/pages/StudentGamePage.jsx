import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../style/StudentGamePage.css';

const StudentGamePage = () => {
    const initialToken = Cookies.get("token");
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        trackId: 0,
        raceStatus: 0,
        pathChoice: 0,
        currentQuestionId: 0,
        question: '',
        creationDate: null,
        answer: '', // Initialized as empty string for better input handling
        rightAnswer: null, // Null to differentiate from false initially
        score: 0,
        pathChance: 0,
        powerUp: 0,
        position: 0
    });

    // Fetches the student's current track data and initializes local game state
    const getTrackResponse = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/get-track", {
            params: { studentToken: initialToken }
        }).then((response) => {
            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    trackId: response.data.track.id,
                    pathChoice: response.data.track.path,
                    score: response.data.track.score,
                    powerUp: response.data.track.powerUp,
                    position: response.data.track.position,
                    pathChance: response.data.track.pathChance,
                    currentQuestionId: response.data.track.currentQuestionId,
                }));
            } else {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => {
            setIsLoading(false);
        });
    };

    // Persists the current track progress
    const setTrack = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/set-track", {
            params: {
                trackId: formData.trackId,
                path: formData.pathChoice,
                pathChance: formData.pathChance,
                powerUp: formData.powerUp,
                position: formData.position,
                currentQuestionId: formData.currentQuestionId,
            }
        }).then((response) => {
            if (!response.data.success) {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => setIsLoading(false));
    };

    // Updates the student's race status on the server
    const setRaceStatus = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/set-status-for-student", {
            params: {
                trackId: formData.trackId,
                status: 2, // Set to 2 directly since we are finishing
            }
        }).then((response) => {
            if (!response.data.success) {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => setIsLoading(false));
    };

    // Loads a question by ID
    const getQuestion = () => {
        if (!formData.currentQuestionId) return;

        setIsLoading(true);
        axios.get("http://localhost:8080/getQuestion", {
            params: { questionId: formData.currentQuestionId }
        }).then((response) => {
            if (response.data.success) {
                // FIXED: Do not mutate state directly, use setFormData
                setFormData(prev => ({
                    ...prev,
                    answer: response.data.question.answer,
                    currentQuestionId: response.data.question.id,
                    question: response.data.question.question,
                    creationDate: response.data.question.creationDate
                }));
            } else {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => setIsLoading(false));
    };

    // Requests a new question for the current track/path
    const addQuestion = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/getNewQuestion", {
            params: {
                studentToken: initialToken,
                trackId: formData.trackId,
                pathChoice: formData.pathChoice,
            }
        }).then((response) => {
            if (response.data.success) {
                // FIXED: Use setFormData
                setFormData(prev => ({
                    ...prev,
                    currentQuestionId: response.data.question.id,
                    question: response.data.question.question,
                    creationDate: response.data.question.creationDate,
                    rightAnswer: null // Reset previous result message
                }));
                setTrack();
            } else {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => setIsLoading(false));
    };

    // Sends the student's answer for validation
    const submitAnswer = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/submit-answer", {
            params: {
                studentToken: initialToken,
                trackId: formData.trackId,
                questionId: formData.currentQuestionId,
                answer: formData.answer,
            }
        }).then((response) => {
            if (response.data.success) {
                const isCorrect = response.data.rightAnswer;
                // FIXED: Use setFormData
                setFormData(prev => ({
                    ...prev,
                    rightAnswer: isCorrect,
                    score: isCorrect ? prev.score + 10 : prev.score
                }));

                if (isCorrect) {
                    setTrack();
                }
            } else {
                setErrorMessage("Oops! Check your details again. " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
        }).finally(() => setIsLoading(false));
    };

    // 1. Fetch initial track data on component mount ONLY.
    useEffect(() => {
        if (!initialToken) {
            alert("No token found");
            navigate("/");
            return;
        }
        getTrackResponse();
        // Disabling the exhaustive-deps rule here because we strictly only want this to run on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, initialToken]);

    // 2. Fetch the question details whenever the currentQuestionId changes to a valid number.
    useEffect(() => {
        if (formData.currentQuestionId !== 0) {
            getQuestion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.currentQuestionId]);

    const goalScore = 1000;

    return (
        <div className="student-game-page">

            <button
                onClick={addQuestion}
                disabled={isLoading}
                className="student-game-page__btn student-game-page__btn--add"
            >
                (addQuestion)
            </button>

            <div className="student-game-page__question-card">
                <div>
                    <strong>question: </strong>
                    {formData.question || "Request a question."}
                </div>
            </div>

            <input
                type="number"
                placeholder="הכנס תשובה כאן"
                value={formData.answer}
                onChange={(e) => {
                    setFormData(prev => ({
                        ...prev,
                        answer: e.target.value === '' ? '' : Number(e.target.value)
                    }));
                }}
                className="student-game-page__input"
            />

            <button
                onClick={submitAnswer}
                disabled={isLoading || !formData.currentQuestionId}
                className="student-game-page__btn student-game-page__btn--submit"
            >
                שלח תשובה (submitAnswer)
            </button>

            {formData.rightAnswer !== null && (
                <div
                    className={`student-game-page__result ${formData.rightAnswer ? 'student-game-page__result--correct' : 'student-game-page__result--wrong'}`}>
                    {formData.rightAnswer ? 'תשובה נכונה! (+10 נקודות) ✅' : 'תשובה שגויה ❌'}
                </div>
            )}

            <div className="student-game-page__score">
                ניקוד נוכחי: {formData.score} / {goalScore}
            </div>

            <hr className="student-game-page__divider" />

            <button
                onClick={() => {
                    setFormData(prev => ({ ...prev, raceStatus: 2 }));
                    setRaceStatus();
                }}
                disabled={isLoading}
                className="student-game-page__btn student-game-page__btn--finish"
            >
                סיום מרוץ ועדכון סטטוס (Set Status)
            </button>

            {errorMessage && <p className="student-game-page__error">{errorMessage}</p>}
        </div>
    );
}

export default StudentGamePage;