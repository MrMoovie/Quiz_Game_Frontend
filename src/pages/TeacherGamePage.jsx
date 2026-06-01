import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CarProgressBar from "../components/CarProgressBar.jsx";

function TeacherGamePage() {
    const navigate = useNavigate();
    const { raceId } = useParams();
    const token = Cookies.get("token");

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [goalScore, setGoalScore] = useState(100);

    const HOST_URL = "http://localhost:8080/";

    // 1. Fetch the initial list of students in the race
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        axios.get(`${HOST_URL}get-all-students-in-race`, {
            params: {
                teacherToken: token,
                raceId: raceId
            }
        }).then(res => {
            if (res.data.success) {
                setGoalScore(res.data.goalScore);
                const initialStudents = res.data.students.map(s => ({
                    id: s.id,
                    fullName: s.fullName || s.fullname, // תמיכה בשני הסגנונות
                    score: 0,
                }));
                setStudents(initialStudents);
            } else {
                alert(res.data.message);
                setError("Failed to load students. " + res.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            setError("Connection lost.");
        }).finally(() => {
            setLoading(false);
        });
    }, [navigate, token, raceId]);

    // 2. Connect to the SSE Stream for real-time updates
    useEffect(() => {
        if (!token || !raceId) return;

        console.log("Connecting to live dashboard stream...");
        const sse = new EventSource(`${HOST_URL}subscribe?token=${token}&raceId=${raceId}`);

        sse.addEventListener("score-update", (event) => {
            const data = JSON.parse(event.data);
            console.log("Score update received:", data);

            setStudents(prevStudents => {
                const updatedStudents = prevStudents.map(student =>
                    student.id === data.id
                        ? { ...student, score: data.score, position: data.position }
                        : student
                );
                return updatedStudents.sort((a, b) => b.score - a.score);
            });
        });

        sse.addEventListener("game-finished", (event) => {
            const data = JSON.parse(event.data);
            console.log("The race is over! Winner:", data.winnerName);
            navigate(`/results/${raceId}`, { state: { winner: data.winnerName } });
        });

        return () => {
            console.log("Closing dashboard stream.");
            sse.close();
        };
    }, [token, raceId, navigate]);

    if (loading) {
        return <div style={{ padding: "20px", textAlign: "center" }}>Loading Live Dashboard...</div>;
    }

    return (
        <div className="card card-dashboard">
            <div className="teacher-game-page" style={{ width: "100%", fontFamily: "sans-serif" }}>
                <header style={{ borderBottom: "2px solid #eee", marginBottom: "25px", paddingBottom: "10px" }}>
                    <h2>🏁 Live Race Dashboard (Race ID: {raceId})</h2>
                    <p style={{ color: "#fff" }}>Students are racing to {goalScore} points!</p>
                </header>

            {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

            <main>
                {students.length === 0 ? (
                    <p>No students in this race yet.</p>
                ) : (
                    /* קונטיינר מרכזי שמציב את שני החלקים אחד ליד השני */
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "30px",
                        alignItems: "flex-start",
                        justifyContent: "space-between"
                    }}>

                        {/* טור שמאלי: מסלול המכוניות (Car Progress Bars) עם גלילה עצמאית */}
                        <div style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            paddingRight: "10px"
                        }}>
                            {students.map((student, index) => (
                                <div key={student.id} style={{
                                    background: "#f1c40f",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    flexShrink: 0 // מונע מהכרטיסיות להתכווץ בגלילה
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>
                                        <span>
                                            {index === 0 && student.score > 0 ? "🥇 " : ""}
                                            {student.fullName}
                                        </span>
                                        <span>{student.score} pts</span>
                                    </div>
                                    <CarProgressBar score={student.score} goalScore={goalScore} />
                                </div>
                            ))}
                        </div>

                        {/* טור ימני: טבלת הסטטיסטיקה עם גלילה עצמאית */}
                        <div style={{
                            flex: "1",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            background: "#1e1e1e", // רקע כהה שיתאים לעיצוב השורות שלך
                            padding: "15px",
                            borderRadius: "8px"
                        }}>
                            <h3 style={{ marginTop: 0, color: "#fff" }}>📊 Statistic Table of the Students</h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "right" }}>
                                    <thead>
                                    <tr style={{ backgroundColor: "#e88d8d", borderBottom: "2px solid #ddd" }}>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", color: "#000" }}>Top</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", color: "#000" }}>Username</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", color: "#000" }}>Score</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", color: "#000" }}>Percent</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.map((student, index) => {
                                        const completionPercent = Math.min((student.score / goalScore) * 100, 100).toFixed(1);
                                        return (
                                            <tr key={student.id} style={{ borderBottom: "1px solid #ddd", background: index % 2 === 0 ? "#842727" : "#0c0808", color: "#fff" }}>
                                                <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>
                                                    {index + 1}
                                                </td>
                                                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                                    {student.fullName}
                                                </td>
                                                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                                    {student.score} / {goalScore}
                                                </td>
                                                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                                                    {completionPercent}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
        </div>
    );
}

export default TeacherGamePage;