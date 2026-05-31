import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HOST } from "../Constants.js";
import CreateRaceModal from "../components/CreateRaceModal.jsx";
import '../style/TeacherMenuPage.css';

function TeacherMenuPage() {
    const navigate = useNavigate();
    const [isWaiting, setIsWaiting] = useState(false);
    const [races, setRaces] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/");
    };

    const handleOpenCreateModal = () => {
        setIsModalOpen(true);
    };

    const handleConfirmCreateRace = (goalScore, maxCapacity) => {
        const token = Cookies.get("token");
        setIsWaiting(true);

        axios.get(HOST + "create-race", {
            params: {
                token,
                goalScore,
                maxCapacity
            }
        })
            .then((res) => {
                if (res.data.success) {
                    setIsModalOpen(false);
                    getRaces();
                    if (res.data.raceId) {
                        navigate(`/lobby/${res.data.raceId}`);
                    }
                }
            })
            .catch(err => console.error("Create race failed", err))
            .finally(() => setIsWaiting(false));
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return "Lobby";
            case 1: return "Started";
            case 2: return "Finished";
            default: return "Unknown";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return "status-badge status-badge--lobby";
            case 1: return "status-badge status-badge--started";
            case 2: return "status-badge status-badge--finished";
            default: return "status-badge";
        }
    };

    const handleManage = (raceId, raceStatus) => {
        if (raceStatus === 1) {
            navigate(`/game/${raceId}`);
        } else {
            navigate(`/lobby/${raceId}`);
        }
    };

    const getRaces = () => {
        const token = Cookies.get("token");
        axios.get(`${HOST}/get-all-teacher-races`, { params: { token } })
            .then((res) => {
                if (res.data && res.data.races) {
                    setRaces(res.data.races);
                }
            })
            .catch(err => console.error("Error fetching races:", err));
    };

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
    }, [navigate]);

    return (
        <div className="teacher-menu-page">
            <div className="teacher-menu-container">

                {/* Header Navbar Layout */}
                <header className="teacher-menu-header">
                    <span>Teacher Dashboard Workspace</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </header>

                {/* Top Interactive Banner Unit */}
                <div className="create-race-section">
                    <button onClick={handleOpenCreateModal} className="create-race-button">
                        + Create New Race Room
                    </button>
                </div>

                {/* Main Dashboard Widescreen Content Columns Area */}
                <main className="content-area">

                    {/* Left Column: Races Management Table Container */}
                    <section className="races-column">
                        <div className="column-header">
                            <span>Active Contests</span>
                            <span className="races-count">{races.length} Total</span>
                        </div>
                        <div className="column-content">
                            {races.length > 0 ? (
                                races.map((race) => (
                                    <div key={race.id} className="race-item">
                                        <div className="race-details">
                                            <div>
                                                Race #{race.id}
                                                <span className={getStatusClass(race.status)}>
                                                    {getStatusText(race.status)}
                                                </span>
                                            </div>
                                            <div>Goal Target: {race.goalScore || 100} pts</div>
                                        </div>
                                        <div className="race-actions">
                                            <button
                                                onClick={() => handleManage(race.id, race.status)}
                                                disabled={isWaiting}
                                                className="start-race-button"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-items-message">No hosted races found. Create a room to get started!</div>
                            )}
                        </div>
                    </section>

                    {/*/!* Right Column: Placeholder Context or Room Stats Summary *!/*/}
                    {/*<section className="students-column">*/}
                    {/*    <div className="column-header">*/}
                    {/*        <span>Global Monitor</span>*/}
                    {/*        <span className="students-count">Live</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="column-content">*/}
                    {/*        <div className="no-items-message">Select a race room to inspect connected students and detailed session metrics.</div>*/}
                    {/*    </div>*/}
                    {/*</section>*/}

                </main>
            </div>

            <CreateRaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleConfirmCreateRace}
                isWaiting={isWaiting}
            />
        </div>
    );
}

export default TeacherMenuPage;