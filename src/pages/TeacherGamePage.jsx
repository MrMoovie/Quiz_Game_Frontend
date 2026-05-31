import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CarProgressBar from "../components/CarProgressBar.jsx";
// Ensure you have your HOST constant imported if you use it!
// import { HOST } from "../Constants.ts";

function TeacherGamePage() {
    const navigate = useNavigate();
    const { raceId } = useParams(); // Destructuring exactly like we fixed in LobbyWrapper!
    const token = Cookies.get("token");

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [goalScore, setGoalScore] = useState(100);
    const HOST_URL = "http://localhost:8080/"; // Change to your HOST constant if needed

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
                setGoalScore(res.data.goalScore)
                // Initialize students with 0 score and position
                const initialStudents = res.data.students.map(s => ({
                    id: s.id,
                    fullName: s.fullName,
                    score: 0,

                }));
                setStudents(initialStudents);
            } else {
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

        // Listen for score updates
        sse.addEventListener("score-update", (event) => {
            const data = JSON.parse(event.data);
            console.log("Score update received:", data);

            setStudents(prevStudents => {
                // Find the student who scored and update their data
                const updatedStudents = prevStudents.map(student =>
                    student.id === data.id
                        ? { ...student, score: data.score, position: data.position }
                        : student
                );

                // Sort the leaderboard so the highest score is at the top
                return updatedStudents.sort((a, b) => b.score - a.score);
            });
        });

        sse.addEventListener("game-finished", (event) => {
            const data = JSON.parse(event.data);
            console.log("The race is over! Winner:", data.winnerName);
            // Direct players to a summary page or activate a modal view
            navigate(`/results/${raceId}`, { state: { winner: data.winnerName } });
        });

        // Clean up the connection when the teacher leaves the page
        return () => {
            console.log("Closing dashboard stream.");
            sse.close();
        };
    }, [token, raceId]);

    if (loading) {
        return <div style={{ padding: "20px", textAlign: "center" }}>Loading Live Dashboard...</div>;
    }

    return (
        <div className="teacher-game-page" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <header style={{ borderBottom: "2px solid #eee", marginBottom: "20px", paddingBottom: "10px" }}>
                <h2>🏁 Live Race Dashboard (Race ID: {raceId})</h2>
                <p style={{ color: "#666" }}>Students are racing to {goalScore} points!</p>
            </header>

            {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

            <main>
                {students.length === 0 ? (
                    <p>No students in this race yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {students.map((student, index) => {
                            // Calculate percentage for the progress bar
                            const progressPercent = Math.min((student.score / goalScore) * 100, 100);

                            return (
                                <div key={student.id} style={{
                                    background: "#f1c40f",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }}>
                                    {/*<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>*/}
                                    {/*    <span>*/}
                                    {/*        {index === 0 && student.score > 0 ? "🥇 " : ""}*/}
                                    {/*        {student.fullName}*/}
                                    {/*    </span>*/}
                                    {/*    <span>{student.score} pts</span>*/}
                                    {/*</div>*/}

                                    {/* The Progress Bar Background */}
                                    {/*<div style={{ width: "100%", height: "20px", background: "#e0e0e0", borderRadius: "10px", overflow: "hidden" }}>*/}
                                    {/*    /!* The Progress Bar Fill (Animates as width changes) *!/*/}
                                    {/*    <div style={{*/}
                                    {/*        width: `${progressPercent}%`,*/}
                                    {/*        height: "100%",*/}
                                    {/*        background: progressPercent >= 100 ? "#4caf50" : "#2196f3",*/}
                                    {/*        transition: "width 0.5s ease-out, background 0.3s"*/}
                                    {/*    }} />*/}
                                    {/*</div>*/}
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>
                                        <span>
                                            {index === 0 && student.score > 0 ? "🥇 " : ""}
                                            {student.fullName}
                                        </span>
                                        <span>{student.score} pts</span>
                                    </div>

                                    {/* ===> INSERT THE REUSABLE CAR COMPONENT HERE <=== */}
                                    <CarProgressBar score={student.score} goalScore={goalScore} />
                                </div>

                            );
                        })}
                        {/* --- טבלת סטטיסטיקת תלמידים --- */}
                        <div style={{ marginTop: "30px" }}>
                            <h3>📊 statistic table of the students</h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "right" }}>
                                    <thead>
                                    <tr style={{ backgroundColor: "#e88d8d", borderBottom: "2px solid #ddd" }}>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>top</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>userName</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>score</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd" }}>percent</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {students.map((student, index) => {
                                        const completionPercent = Math.min((student.score / goalScore) * 100, 100).toFixed(1);
                                        return (
                                            <tr key={student.id} style={{ borderBottom: "1px solid #ddd", background: index % 2 === 0 ? "#842727" : "#0c0808" }}>
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
    );
}

export default TeacherGamePage;