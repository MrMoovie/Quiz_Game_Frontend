import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

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

    // const handleCreate = () =>{
    //     const token = Cookies.get("token")
    //     axios.get(HOST+"create-race", {params:{token}})
    //         .then((res)=>{
    //             if (res.data.success) {
    //                 // 2. הוספת המרוץ החדש לרשימה (בהנחה שהשרת מחזיר אובייקט מרוץ)
    //                 // אם השרת מחזיר רק הצלחה, אפשר להוסיף אובייקט זמני לצרכי תצוגה
    //                 const newRace = res.data.race || { id: res.data.raceId, entryCode: res.data.entryCode };
    //                 setRaces((prevRaces) => [...prevRaces, newRace]);
    //                 console.log("Race created:", newRace);
    //             }
    //         })
    //         .catch(err => console.error("Create race failed", err));
    //
    //
    // };
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

    const menuItemStyle = {
        width: '100%',
        padding: '10px 15px',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#333',
        display: 'block',
        transition: 'background 0.2s'
    };

    return (
        /* רקע תכלת חלק לכל הדף */
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center', // מרכוז התוכן באמצע
            backgroundColor: '#80d4ff', // צבע תכלת חלק בקצוות
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            overflow: 'hidden'
        }}>

            {/* הקונטיינר המרכזי - תופס 80% מהמסך (2 רבעים אמצעיים + קצת יותר) */}
            <div style={{
                width: '70%',
                maxWidth: '1400px',
                backgroundColor: '#f4f7f9',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 40px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #ddd'
                }}>
                    <span style={{ fontWeight: '600', color: '#333' }}>Hello {user?.fullName} (Teacher)</span>
                    <button onClick={handleLogout} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>התנתק</button>
                </div>

                {/* Create Race Section */}
                <div style={{ textAlign: 'center', padding: '25px' }}>
                    <button onClick={handleCreate} style={{
                        padding: '12px 40px',
                        fontSize: '18px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)'
                    }}>
                        + Create New Race
                    </button>
                </div>

                {/* Content Area - Split Screen */}
                <div style={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    padding: '0 30px 30px 30px',
                    gap: '25px'
                }}>

                    {/* עמודת מרוצים */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        <h3 style={{ padding: '15px 20px', margin: 0, backgroundColor: '#f8f9fa', color: '#333', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>🏁 Open Races</span>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{races.length}</span>
                        </h3>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            {races.map((race, index) => (
                                <div key={race.id || index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: '#fff',
                                    position: 'relative' // חשוב עבור מיקום התפריט הנפתח
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{race.name || `Race #${index + 1}`}</div>
                                        <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Entry Code: {race.entryCode || "N/A"}</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button onClick={() => handleStart(race.id)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer' }}>Start</button>

                                        {/* כפתור 3 נקודות */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === race.id ? null : race.id);
                                                }}
                                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#7f8c8d', padding: '0 5px' }}
                                            >
                                                ⋮
                                            </button>

                                            {/* תפריט נפתח (מופיע רק כשה-ID תואם) */}
                                            {openMenuId === race.id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '0',
                                                    top: '30px',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    zIndex: 100,
                                                    width: '160px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <button onClick={() => {
                                                        const newName = prompt("שם חדש למרוץ:", race.name);
                                                        if(newName) setRaces(races.map(r => r.id === race.id ? {...r, name: newName} : r));
                                                        setOpenMenuId(null);
                                                    }} style={menuItemStyle}>✏️ עריכת שם המירוץ</button>

                                                    <button onClick={() => {
                                                        if(window.confirm("למחוק את המרוץ?")) setRaces(races.filter(r => r.id !== race.id));
                                                        setOpenMenuId(null);
                                                    }} style={menuItemStyle}>🗑️ מחיקת המירוץ</button>

                                                    <button onClick={() => {
                                                        navigate(`/stats/${race.id}`);
                                                        setOpenMenuId(null);
                                                    }} style={{...menuItemStyle, borderBottom: 'none'}}>📊 סטטיסטיקות</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {races.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>No races created yet.</p>}
                        </div>
                    </div>

                    {/* עמודת סטודנטים */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        <h3 style={{ padding: '15px 20px', margin: 0, backgroundColor: '#f8f9fa', color: '#333', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>👤 Students in Lobby</span>
                            <span style={{ color: '#007bff', fontWeight: 'bold' }}>{students.length}</span>
                        </h3>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                            {students.map((std, index) => (
                                <div key={index} style={{
                                    padding: '12px 15px',
                                    borderBottom: '1px solid #f1f1f1',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: '500', color: '#34495e' }}>{std.name}</span>
                                    <span style={{ fontSize: '12px', color: '#95a5a6', backgroundColor: '#ecf0f1', padding: '3px 10px', borderRadius: '15px' }}>Track: {std.trackId}</span>
                                </div>
                            ))}
                            {students.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>Waiting for students...</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TeacherMenuPage;