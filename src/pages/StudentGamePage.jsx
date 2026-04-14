import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

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




    const setTrack = () => {
        setIsLoading(true);
        axios.get("http://localhost:8080/set-track", {
            params: {
                trackId: formData.trackId,
                score: formData.score,
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
    useEffect(() => {
        if (initialToken == null) {
            alert("no token found");
        }
        getTrackResponse();
    },[]);
    useEffect(() => {
        // ברגע ש-getTrackResponse יסיים וה-ID יתעדכן לערך שונה מ-0
        if (formData.currentQuestionId !== 0) {
            getQuestion();
        }
    }, []); // ירוץ כל פעם שה-ID משתנה

    const goalScore = 1000;

    return (
        <div style={{padding: '20px', direction: 'rtl', fontFamily: 'sans-serif', maxWidth: '500px', margin: 'auto'}}>

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
                style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    backgroundColor: '#f1f8e9',
                    border: '1px solid #4caf50',
                    borderRadius: '5px'
                }}
            >
                (addQuestion)
            </button>

            {/* 3. הצגת השאלה */}
            {/* 3. הצגת השאלה או הודעת "אין שאלות" */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    boxSizing: 'border-box',
                    border: '1px solid #ccc',
                    borderRadius: '5px'
                }}
            />

            {/* 5. כפתור submitAnswer */}
            <button
                onClick={submitAnswer}
                disabled={isLoading || !formData.currentQuestionId}
                style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ff9800',
                    borderRadius: '5px'
                }}
            >
                שלח תשובה (submitAnswer)
            </button>

            {/* 6. האם עניתי נכון או לא */}
            {formData.rightAnswer !== null && (
                <div style={{
                    padding: '15px',
                    textAlign: 'center',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    backgroundColor: formData.rightAnswer ? '#c8e6c9' : '#ffcdd2',
                    color: formData.rightAnswer ? '#2e7d32' : '#c62828'
                }}>
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
            <div style={{textAlign: 'center', marginTop: '15px', fontSize: '20px', fontWeight: 'bold', color: '#333'}}>
                ניקוד נוכחי: {formData.score} / {goalScore}
            </div>

            <hr style={{margin: '30px 0', border: '0', borderTop: '1px solid #eee'}}/>

            {/* כפתור סיום מרוץ (Status 2) */}
            <button
                onClick={() => {
                    setFormData(prev => ({...prev, raceStatus: 2}));
                    setRaceStatus(); // פונקציה ששולחת לשרת את הסטטוס המעודכן
                }}
                disabled={isLoading}
                style={{
                    width: '100%',
                    padding: '15px',
                    cursor: 'pointer',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}
            >
                סיום מרוץ ועדכון סטטוס (Set Status )
            </button>

            {errorMessage && <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{errorMessage}</p>}
        </div>
    );
}

export default StudentGamePage;