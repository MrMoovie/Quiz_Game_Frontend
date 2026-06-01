import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { HOST } from "../Constants.js";
import "../style/LobbyPage.css";

function LobbyPage({ user, role, entryCode }) {
    const { raceId } = useParams();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [teacherName, setTeacherName] = useState("Loading...");
    const [copied, setCopied] = useState(false); // Clipboard feedback tracker
    const eventSourceRef = useRef(null);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
            return;
        }

        axios.get(`${HOST}lobby-info`, { params: { token, raceId } })
            .then((res) => {
                if (res.data.success) {
                    setTeacherName(res.data.teacherName);
                    setStudents(res.data.students || []);
                }else{
                    if(res.data.errorCode === 1003){
                        navigate("/menu")
                    }
                }
            })
            .catch(err => console.error("Failed to fetch lobby info", err));
    }, [raceId, navigate]);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token || !raceId) return;

        const listener = new EventSource(`${HOST}subscribe?token=${token}&raceId=${raceId}`);

        listener.addEventListener("lobby-update", (event) => {
            const student = JSON.parse(event.data);
            setStudents((prev) => {
                return [...prev, { name: student.studentName, trackId: student.trackId }];
            });
        });

        listener.addEventListener("game-started", () => {
            navigate(`/game/${raceId}`);
        });

        eventSourceRef.current = listener;

        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection for lobby...");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [raceId, navigate]);

    const handleStartGame = () => {
        const token = Cookies.get("token");
        axios.get(`${HOST}start-race`, { params: { token, raceId } })
            .then((res) => {
                if (!res.data.success) {
                    alert("Failed to start the game.");
                }
            })
            .catch(err => console.error("Failed to start race", err));
    };

    // Clipboard Copy Handler Action
    const handleCopyCode = () => {
        if (!entryCode) return;

        navigator.clipboard.writeText(entryCode)
            .then(() => {
                setCopied(true);
                // Flash the status text back to default after 2 seconds
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => console.error("Failed to write to clipboard:", err));
    };

    return (
        <div className="lobby-page">
            <h1>{teacherName}'s Lobby</h1>

            <div className="lobby-page__panel">
                <h3>Joined Students ({students.length})</h3>
                <ul className="lobby-page__students-list">
                    {students.map((std, idx) => (
                        <li key={idx} className="lobby-page__student-item">
                            {std.name} {std.name === user?.fullName ? "(You)" : ""}
                        </li>
                    ))}
                </ul>
                {students.length === 0 && <p className="lobby-page__waiting-text">Waiting for students to join...</p>}
            </div>

            {/* Interactive Entry Code Panel Small Yellow Block */}
            {entryCode && (
                <div
                    onClick={handleCopyCode}
                    className="lobby-page__code-container"
                    title="Click to copy code"
                >
                    <span className="lobby-page__code-label">ENTRY CODE</span>
                    <h2 className="lobby-page__code-text">{entryCode}</h2>
                    <span className={`lobby-page__copy-toast ${copied ? "visible" : ""}`}>
                {copied ? "📋 Copied!" : "💡 Click to Copy"}
            </span>
                </div>
            )}

            {role === "teacher" ? (
                <button
                    onClick={handleStartGame}
                    className="lobby-page__start-button"
                >
                    Start Game
                </button>
            ) : (
                <p className="lobby-page__teacher-waiting-text">Waiting for the teacher to start the race...</p>
            )}
        </div>
    );
}

export default LobbyPage;