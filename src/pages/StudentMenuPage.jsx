import {useEffect, useRef, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

function StudentMenuPage({user}) {
    const navigate = useNavigate()
    const [races, setRaces] = useState([])
    const [isStarted, setStarted] = useState(false)
    const [isWaiting, setIsWaiting] = useState(false);

    const eventSourceRef = useRef(null)

    // התנתקות
    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/"); //  חזרה לדף הכניסה
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getRaces = () => {
        const token = Cookies.get("token")
        axios.get(HOST + "/get-all-races", {params: {token}})
            .then((res) => {
                setRaces(res.data.races)
                console.log("got and saved all races: " + races)
            })
    }

    useEffect(() => {
        //add maintaining connection...


        const token = Cookies.get("token");
        if (!token) {
            navigate("/")
            // }else if(){
            //    //is in race?
            //
        } else {
            getRaces()
        }


    }, [navigate])

    useEffect(() => {
        if (isStarted) {
            navigate("/game");
        }
    }, [isStarted, navigate]);

    const handleJoin = (entryCode) => {
        const token = Cookies.get("token");
        setIsWaiting(true);

        axios.get(`${HOST}join-race`, { params: { token, entryCode } })
            .then(res => {
                if (res.data.success) {
                    // Assuming the backend returns the actual raceId upon joining
                    const joinedRaceId = res.data.raceId;
                    navigate(`/lobby/${joinedRaceId}`);
                } else {
                    alert("Error joining: " + res.data.errorCode);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsWaiting(false));
    };





    return (
        <>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px'}}>

                <span> welcome{user?.fullName} (student)</span>
                <button onClick={handleLogout}>התנתק</button>
            </div>

            <div>
                STUDENT_MENU_PAGE
            </div>
            {isWaiting && !isStarted && (
                <div style={{ backgroundColor: '#fff3cd', padding: '15px', textAlign: 'center' }}>
                    <h3>הצטרפת בהצלחה! ממתין למורה שיתחיל את המרוץ... </h3>
                </div>
            )}
            <div>
                <h1>Races List</h1>
                <ul>
                    {races.map((race, index) => (
                        // Always add a unique 'key' to list items in React
                        <li key={race.id || index}>

                            {/* Option 1: Print specific fields */}
                            Race ID: {race.id} | Entry Code: {race.entryCode} | Status: {race.status}
                            <button onClick={() => handleJoin(race.entryCode)}> join race</button>
                            {/* Option 2: Print the raw JSON object for debugging */}
                            {/* {JSON.stringify(race)} */}

                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default StudentMenuPage;