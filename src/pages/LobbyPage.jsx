import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { HOST } from "../Constants.js";

function LobbyPage({ user, role }) {
    // role should be passed as a prop from your router (e.g., role="teacher" or "student")
    const { raceId } = useParams();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [teacherName, setTeacherName] = useState("Loading...");
    const eventSourceRef = useRef(null);

    // 1. Fetch initial lobby data on mount
    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Fetch the initial state of the lobby (teacher name, already joined students)
        axios.get(`${HOST}lobby-info`, { params: { token, raceId } })
            .then((res) => {
                if (res.data.success) {
                    setTeacherName(res.data.teacherName);
                    setStudents(res.data.students || []);
                }
            })
            .catch(err => console.error("Failed to fetch lobby info", err));
    }, [raceId, navigate]);

    // 2. Establish the SSE Connection securely within the LobbyPage lifecycle
    useEffect(() => {
        const token = Cookies.get("token");
        if (!token || !raceId) return;

        // Subscribe specifically to THIS race
        const listener = new EventSource(`${HOST}subscribe?token=${token}&raceId=${raceId}`);

        // Listen for new students joining
        listener.addEventListener("lobby-update", (event) => {
            const student = JSON.parse(event.data);
            setStudents((prev) => {
                return [...prev, { name: student.studentName, trackId: student.trackId }];
            });
        });

        // Listen for the teacher starting the game
        listener.addEventListener("game-started", () => {
            navigate(`/game/${raceId}`);
        });

        eventSourceRef.current = listener;

        // Cleanup: Disconnect when leaving the lobby
        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection for lobby...");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [raceId, navigate]);

    // Teacher specific action
    const handleStartGame = () => {
        const token = Cookies.get("token");
        axios.get(`${HOST}start-race`, { params: { token, raceId } })
            .then((res) => {
                if (!res.data.success) {
                    alert("Failed to start the game.");
                }
                // We don't navigate here! The SSE 'game-started' event will trigger the navigation for EVERYONE.
            })
            .catch(err => console.error("Failed to start race", err));
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>{teacherName}'s Lobby</h1>

            <div style={{ margin: '20px auto', maxWidth: '400px' , padding: '20px', borderRadius: '10px' }}>
                <h3>Joined Students ({students.length})</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {students.map((std, idx) => (
                        <li key={idx} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            {std.name} {std.name === user?.fullName ? "(You)" : ""}
                        </li>
                    ))}
                </ul>
                {students.length === 0 && <p>Waiting for students to join...</p>}
            </div>

            {role === "teacher" ? (
                <button
                    onClick={handleStartGame}
                    style={{ padding: '10px 30px', fontSize: '18px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Start Game
                </button>
            ) : (
                <p style={{ color: '#555', fontStyle: 'italic' }}>Waiting for the teacher to start the race...</p>
            )}
        </div>
    );
}

export default LobbyPage;