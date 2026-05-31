import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { HOST } from "../Constants.js";
import RaceRow from "../components/RaceRow.jsx";
import '../style/StudentMenuPage.css';

function StudentMenuPage() {
    const navigate = useNavigate();
    const [races, setRaces] = useState([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [invalidCode, setInvalidCode] = useState(false);

    const getRaces = useCallback(() => {
        const token = Cookies.get("token");
        axios.get(`${HOST}/get-all-races`, { params: { token } })
            .then((res) => {
                if (res.data && res.data.races) {
                    setRaces(res.data.races);
                }
            })
            .catch(err => console.error("Error fetching races:", err));
    }, []);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
            return;
        }

        getRaces();

        const listener = new EventSource(`${HOST}subscribe?token=${token}&raceId=0`);
        listener.addEventListener("race-created", () => {
            getRaces();
        });

        return () => {
            listener.close();
        };
    }, [navigate, getRaces]);

    const handleJoin = (raceId, entryCode) => {
        if (invalidCode) setInvalidCode(false);

        const token = Cookies.get("token");
        setIsWaiting(true);

        axios.get(`${HOST}/join-race`, { params: { token, entryCode } })
            .then(res => {
                if (res.data.success) {
                    sessionStorage.setItem(`race_goal_${raceId}`, res.data.goalScore);
                    navigate(`/lobby/${res.data.raceId}`);
                } else {
                    setInvalidCode(true);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsWaiting(false));
    };

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/");
    };

    return (
        <div className="student-menu-page-wrapper">
            <div className="student-menu-card">
                <div className="student-menu-container">

                    <div className="student-menu-header">
                        <span>🏁 <strong>Available Active Races</strong></span>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>

                    <div className="student-menu-scrollable">
                        {races.length > 0 ? (
                            <table className="races-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {races.map((race) => (
                                    <RaceRow
                                        key={race.id}
                                        race={race}
                                        isWaiting={isWaiting}
                                        invalidCode={invalidCode}
                                        onJoin={handleJoin}
                                    />
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state-container">
                                <span className="empty-state-icon">🏎️</span>
                                <div className="empty-state-text">
                                    <strong className="empty-state-title">No races are found.</strong>
                                    <span className="empty-state-subtitle">Please wait for a teacher to open a race room...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentMenuPage;