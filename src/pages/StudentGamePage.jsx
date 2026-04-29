import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../style/StudentGamePage.css';

// Student game screen: loads track/question state and handles answer submission flow.
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
        answer: 0,
        rightAnswer: false,
        score: 0,
        pathChance: 0,
        powerUp: 0,
        position: 0
    });

    // Fetches the student's current track data and initializes local game state from the server.
    let getTrackResponse;
    getTrackResponse = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/get-track", {
            params: {
                studentToken: initialToken
            }
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
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };




    // Persists the current track progress (score, path, position, and current question) to the backend.
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
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }

            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
};

    // Updates the student's race status on the server (for example, when finishing the race).
    const setRaceStatus = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/set-status-for-student", {
            params: {
                trackId: formData.trackId,
                status: formData.raceStatus,
            }
        }).then((response) => {
            if (!response.data.success) {
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };
    // Loads a question by ID and updates the current question details shown to the student.
    let getQuestion;
    getQuestion = () => {
        setIsLoading(true);

        axios.get("http://localhost:8080/getQuestion", {
            params: {
                questionId: formData.currentQuestionId
            }
        }).then((response) => {
            if (response.data.success) {
                formData.answer = response.data.question.answer;
                formData.currentQuestionId = response.data.question.id;
                formData.question = response.data.question.question;
                formData.creationDate = response.data.question.creationDate;
            } else {
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };

    // Requests a new question for the current track/path and stores its ID for future submissions.
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
                formData.currentQuestionId = response.data.question.id;
                formData.question = response.data.question.question;
                formData.creationDate = response.data.question.creationDate;
                setTrack();
            } else {
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };

    // Sends the student's answer for validation, updates score on success, and persists progress.
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
                formData.rightAnswer = response.data.rightAnswer;
                if (formData.rightAnswer) {
                    setFormData(prev => {
                        return {
                            ...prev,
                            rightAnswer: true,
                            score: prev.score + 10
                        };
                    });
                    setTrack();
                }
            } else {
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };
    // On first load, verifies token presence and fetches the student's track state.
    useEffect(() => {
        if (initialToken == null) {
            alert("no token found");
        }
        getTrackResponse();
    },[]);
    // After a valid question ID exists, fetches that question's full content from the server.
    useEffect(() => {
        // ברגע ש-getTrackResponse יסיים וה-ID יתעדכן לערך שונה מ-0
        if (formData.currentQuestionId !== 0) {
            getQuestion();
        }
    }, []); // ירוץ כל פעם שה-ID משתנה

    const goalScore = 1000;

    return (
        <div className="student-game-page">

            {/* 1. כפתור getTrackResponse */}
            {/*<button*/}
            {/*    onClick={getTrackResponse}*/}
            {/*    disabled={isLoading}*/}
            {/*    style={{*/}
            {/*        width: '100%',*/}
            {/*        padding: '15px',*/}
            {/*        marginBottom: '10px',*/}
            {/*        cursor: 'pointer',*/}
            {/*        backgroundColor: '#e3f2fd',*/}
            {/*        border: '1px solid #2196f3',*/}
            {/*        borderRadius: '5px'*/}
            {/*    }}*/}
            {/*>*/}
            {/*    טען נתוני מסלול (getTrackResponse)*/}
            {/*</button>*/}

            {/* 2. כפתור addQuestion */}

            <button
                onClick={addQuestion}
                disabled={isLoading}
                className="student-game-page__btn student-game-page__btn--add"
            >
                (addQuestion)
            </button>

            {/* 3. הצגת השאלה */}
            {/* 3. הצגת השאלה או הודעת "אין שאלות" */}
            <div className="student-game-page__question-card">
                {/*{formData.currentQuestionId !== 0 ? (*/}
                    <div>
                        <strong>question: </strong>
                        {formData.question}
                    </div>
                {/*) : (*/}
                {/*    <div style={{ color: '#666', fontStyle: 'italic' }}>*/}
                {/*         request a question.*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>


            {/* 4. מקום לשים תשובה */}
            <input
                type="number"
                placeholder="הכנס תשובה כאן"
                value={formData.answer || ''}
                onChange={(e) => setFormData(
                    prev => ({...prev, answer: e.target.value === '' ? '' : Number(e.target.value)}))}
                className="student-game-page__input"
            />

            {/* 5. כפתור submitAnswer */}
            <button
                onClick={submitAnswer}
                disabled={isLoading || !formData.currentQuestionId}
                className="student-game-page__btn student-game-page__btn--submit"
            >
                שלח תשובה (submitAnswer)
            </button>

            {/* 6. האם עניתי נכון או לא */}
            {formData.rightAnswer !== null && (
                <div className={`student-game-page__result ${formData.rightAnswer ? 'student-game-page__result--correct' : 'student-game-page__result--wrong'}`}>
                    {formData.rightAnswer ? (
                        <>
                            תשובה נכונה! (+10 נקודות) ✅
                            {/* קריאה לפונקציה רק אם התשובה נכונה */}
                        </>
                    ) : (
                        'תשובה שגויה ❌'
                    )}
                </div>
            )}

            {/* תצוגת הניקוד הנוכחי מתוך היעד (1000) */}
            <div className="student-game-page__score">
                ניקוד נוכחי: {formData.score} / {goalScore}
            </div>

            <hr className="student-game-page__divider"/>

            {/* כפתור סיום מרוץ (Status 2) */}
            <button
                onClick={() => {
                    setFormData(prev => ({...prev, raceStatus: 2}));
                    setRaceStatus(); // פונקציה ששולחת לשרת את הסטטוס המעודכן
                }}
                disabled={isLoading}
                className="student-game-page__btn student-game-page__btn--finish"
            >
                סיום מרוץ ועדכון סטטוס (Set Status )
            </button>

            {errorMessage && <p className="student-game-page__error">{errorMessage}</p>}
        </div>
    );
}

export default StudentGamePage;