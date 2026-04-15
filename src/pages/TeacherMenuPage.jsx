import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";
import '../style/TeacherMenuPage.css';

function TeacherMenuPage({user}) {
    const navigate = useNavigate()
    const [students, setStudents] = useState([])
    const [races, setRaces] = useState([]);
    const [entryCode, setEntryCode] = useState("");

    const [openMenuId, setOpenMenuId] = useState(null);

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/");
    };

    const handleCreate = () => {
        const token = Cookies.get("token")
        axios.get(HOST + "create-race", {params:{token}})
            .then((res)=>{
                if (res.data.success) {
                    const newRaceId = res.data.raceId;
                    navigate(`/lobby/${newRaceId}`); // Move straight to the lobby
                }
            })
            .catch(err => console.error("Create race failed", err));
    };

    const handleEdit = (raceId) => {
        const newName = prompt("Enter new name for the race:");
        if (newName) {
            setRaces(races.map(r => r.id === raceId ? { ...r, name: newName } : r));
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
        axios.get(HOST + "start-race", { params: { token } })
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
        //add maintaining connection...

        const token = Cookies.get("token");
        if (!token) {
            navigate("/")
        }

    },[navigate])


    return (
        /* רקע תכלת חלק לכל הדף */
        <div className="teacher-menu-page">

            {/* הקונטיינר המרכזי - תופס 80% מהמסך (2 רבעים אמצעיים + קצת יותר) */}
            <div className="teacher-menu-container">

                {/* Header */}
                <div className="teacher-menu-header">
                    <span>Hello {user?.fullName} (Teacher)</span>
                    <button onClick={handleLogout} className="logout-button">התנתק</button>
                </div>

                {/* Create Race Section */}
                <div className="create-race-section">
                    <button onClick={handleCreate} className="create-race-button">
                        + Create New Race
                    </button>
                </div>

                {/* Content Area - Split Screen */}
                <div className="content-area">

                    {/* עמודת מרוצים */}
                    <div className="races-column">
                        <h3 className="column-header">
                            <span>🏁 Open Races</span>
                            <span className="races-count">{races.length}</span>
                        </h3>
                        <div className="column-content">
                            {races.map((race, index) => (
                                <div key={race.id || index} className="race-item">
                                    <div className="race-details">
                                        <div>{race.name || `Race #${index + 1}`}</div>
                                        <div>Entry Code: {race.entryCode || "N/A"}</div>
                                    </div>

                                    <div className="race-actions">
                                        <button onClick={() => handleStart(race.id)} className="start-race-button">Start</button>

                                        {/* כפתור 3 נקודות */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === race.id ? null : race.id);
                                                }}
                                                className="menu-button"
                                            >
                                                ⋮
                                            </button>

                                            {/* תפריט נפתח (מופיע רק כשה-ID תואם) */}
                                            {openMenuId === race.id && (
                                                <div className="dropdown-menu">
                                                    <button onClick={() => {
                                                        const newName = prompt("שם חדש למרוץ:", race.name);
                                                        if(newName) setRaces(races.map(r => r.id === race.id ? {...r, name: newName} : r));
                                                        setOpenMenuId(null);
                                                    }} className="menu-item">✏️ עריכת שם המירוץ</button>

                                                    <button onClick={() => {
                                                        if(window.confirm("למחוק את המרוץ?")) setRaces(races.filter(r => r.id !== race.id));
                                                        setOpenMenuId(null);
                                                    }} className="menu-item">🗑️ מחיקת המירוץ</button>

                                                    <button onClick={() => {
                                                        navigate(`/stats/${race.id}`);
                                                        setOpenMenuId(null);
                                                    }} className="menu-item">📊 סטטיסטיקות</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {races.length === 0 && <p className="no-items-message">No races created yet.</p>}
                        </div>
                    </div>

                    {/* עמודת סטודנטים */}
                    <div className="students-column">
                        <h3 className="column-header">
                            <span>👤 Students in Lobby</span>
                            <span className="students-count">{students.length}</span>
                        </h3>
                        <div className="column-content">
                            {students.map((std, index) => (
                                <div key={index} className="student-item">
                                    <span className="student-name">{std.name}</span>
                                    <span className="student-track">Track: {std.trackId}</span>
                                </div>
                            ))}
                            {students.length === 0 && <p className="no-items-message">Waiting for students...</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TeacherMenuPage;