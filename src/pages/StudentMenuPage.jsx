import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HOST } from "../Constants.js";
import '../style/StudentMenuPage.css'

function StudentMenuPage() {
    const navigate = useNavigate();
    const [races, setRaces] = useState([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isRaceFull, setIsRaceFull] = useState(false);
    const [invalidCode, setInvalidCode] = useState(false);

    // State to manage input values for each specific race row
    const [inputs, setInputs] = useState({});

    const handleInputChange = (raceId, value) => {
        if (invalidCode) {
            setInvalidCode(false);
        }
        setInputs(prev => ({
            ...prev,
            [raceId]: value
        }));
    };

    const getRaces = () => {
        const token = Cookies.get("token");
        axios.get(`${HOST}/get-all-races`, { params: { token } })
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

        // Fetch initially
        getRaces();

        // Connect to the "Global Menu" SSE room (raceId = 0)
        const listener = new EventSource(`${HOST}subscribe?token=${token}&raceId=0`);

        // Listen for new race creations
        listener.addEventListener("race-created", () => {
            console.log("New race created! Refreshing student list...");
            getRaces();
        });

        // Cleanup: Disconnect when leaving the menu
        return () => {
            console.log("Closing global SSE connection...");
            listener.close();
        };
    }, [navigate]);

    const handleJoin = (raceId) => {
        const entryCode = inputs[raceId];
        if (!entryCode) return;
        setInputs(prev => ({
            ...prev,
            [raceId]: ""
        }));
        const token = Cookies.get("token");
        setIsWaiting(true);

        axios.get(`${HOST}/join-race`, { params: { token, entryCode } })
            .then(res => {
                if (res.data.success) {
                    navigate(`/lobby/${res.data.raceId}`);
                } else if (res.data.error === 1016) {
                    setIsRaceFull(true);
                } else {
                    setInvalidCode(true)
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsWaiting(false));
    };

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/");
    };


    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return "Open";
            case 1:
                return "Closed";
            case 2:
                return "finished";
            default:
                return "Unknown";
        }
    };


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
                                                backgroundColor: race.status !== 0 ? '#f5f5f5' : '#e8f5e9',
                                                color: race.status !== 0 ? '#616161' : '#2e7d32',
                                                fontWeight: 'bold'
                                            }}>
                                                {getStatusText(race.status)}
                                            </span>
                                        </td>
                                        <td style={{padding: '12px', border: '1px solid #dee2e6'}}>
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <input
                                                    type="text"
                                                    placeholder="Code"
                                                    value={invalidCode? "" : inputs[race.id] || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(race.id, e.target.value)}
                                                    style={{
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #ccc',
                                                        width: '80px'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleJoin(race.id)}
                                                    disabled={isWaiting || !inputs[race.id] || race.status !== 0 || isRaceFull}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: (isWaiting || !inputs[race.id] || race.status === 1 || isRaceFull) ? '#bdc3c7' : '#2ecc71',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    {isWaiting ? "..." : "Join"}
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
                                Please wait for someone to create a race.
                            </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentMenuPage;