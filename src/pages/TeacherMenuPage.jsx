import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";
import '../style/StudentMenuPage.css'; // NEED CHANGING

function TeacherMenuPage() {
    const navigate = useNavigate()
    const [isWaiting, setIsWaiting] = useState(false);
    const [races, setRaces] = useState([]);

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/");
    };

    const handleCreate = () => {
        const token = Cookies.get("token")
        setIsWaiting(true);
        axios.get(HOST + "create-race", {params: {token}})
            .then((res) => {
                if (res.data.success) {
                    // const newRaceId = res.data.raceId;
                    // navigate(`/lobby/${newRaceId}`); // Move straight to the lobby
                }
            })
            .catch(err => console.error("Create race failed", err))
            .finally(() => setIsWaiting(false));
    };
    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return "Lobby";
            case 1:
                return "Started";
            case 2:
                return "Finished";
            default:
                return "Unknown";
        }
    };

    const handleManage = (raceId, raceStatus) => {
        if (raceStatus === 1) {
            navigate(`/game/${raceId}`);
        }else {
            navigate(`/lobby/${raceId}`); // Move straight to the lobby
        }
        // setIsWaiting(true);
        // axios.get(HOST + "get-race", {params: {raceId}})
        //     .then((res) => {
        //         if (res.data.success) {
        //
        //         }
        //     })
        //     .catch(err => console.error("Create race failed", err))
        //     .finally(() => setIsWaiting(false));
    };

    const getRaces = () => {
        const token = Cookies.get("token");
        axios.get(`${HOST}//get-all-teacher-races`, {params: {token}})
            .then((res) => {
                if (res.data && res.data.races) {
                    setRaces(res.data.races);
                }
            })
            .catch(err => console.error("Error fetching races:", err));
    };

    const handleEdit = (raceId) => {
        const newName = prompt("Enter new name for the race:");
        if (newName) {
            setRaces(races.map(r => r.id === raceId ? {...r, name: newName} : r));
        }
    };

    const handleDelete = (raceId) => {
        if (window.confirm("Are you sure you want to delete this race?")) {
            // כאן בעתיד תשלח Axios.delete לשרת
            setRaces(races.filter(r => r.id !== raceId));
        }
    };

    const handleStats = (raceId) => {
        navigate(`/stats/${raceId}`); // ניווט לדף סטטיסטיקה עם ה-ID
    };


    const handleStart = () => {
        const token = Cookies.get("token");
        axios.get(HOST + "start-race", {params: {token}})
            .then((res) => {
                if (res.data.success) {
                    navigate("/game");
                } else {
                    alert("שגיאה בהפעלת המשחק");
                }
            })
            .catch(err => console.error("Failed to start race", err));
    }

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
        } else {
            getRaces();
        }
    }, [navigate]);

    return (
        <div className="card" style={{
            width: '500px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // מונע מהכרטיס עצמו לגדול
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                padding: '20px',
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* Header Section - נשאר קבוע למעלה */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '10px',
                    flexShrink: 0 // מונע מהכותרת להתכווץ
                }}>
                    <span><strong>{"Available Races"}</strong></span>

                    <div className="create-race-section">
                        <button onClick={handleCreate} className="create-race-button">
                            Create New Race
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '5px 15px',
                            cursor: 'pointer',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Logout
                    </button>
                </div>



                {/* Scrollable Area - אזור הגלילה */}
                <div style={{overflowY: 'auto', flexGrow: 1, paddingRight: '5px'}}>
                    {races.length > 0 ? (
                        <>
                            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                <thead style={{position: 'sticky', top: 0, zIndex: 1}}>
                                <tr style={{backgroundColor: '#2C3E50', color: 'white'}}>
                                    <th style={{padding: '12px', border: '1px solid #dee2e6'}}>ID</th>
                                    <th style={{padding: '12px', border: '1px solid #dee2e6'}}>Status</th>
                                    <th style={{padding: '12px', border: '1px solid #dee2e6'}}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {races.map((race) => (
                                    <tr key={race.id}>
                                        <td style={{padding: '12px', border: '1px solid #dee2e6'}}>{race.id}</td>
                                        <td style={{padding: '12px', border: '1px solid #dee2e6'}}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.85em',
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                fontWeight: 'bold'
                                            }}>
                                                {getStatusText(race.status)}
                                            </span>
                                        </td>
                                        <td style={{padding: '12px', border: '1px solid #dee2e6'}}>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button
                                                    onClick={() => handleManage(race.id, race.status)}
                                                    disabled={isWaiting}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#2ecc71',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    {isWaiting ? "..." : "Manage"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        /* Empty State - מוצג במרכז אזור הגלילה */
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            padding: '30px',
                            backgroundColor: '#fdfdfe',
                            borderRadius: '12px',
                            border: '1px dashed #cbd5e0',
                            color: '#4a5568',
                            marginTop: '20px'
                        }}>
                            <span style={{fontSize: '1.5rem', opacity: 0.7}}>🏁</span>
                            <div style={{textAlign: 'left'}}>
                                <strong style={{fontSize: '1.1rem', color: '#2d3748', display: 'block'}}>
                                    No races are found.
                                </strong>
                                <span style={{fontSize: '0.9rem', color: '#718096'}}>
                                Waiting for you to create a race.
                            </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherMenuPage;