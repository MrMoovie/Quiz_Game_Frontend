import {useEffect, useRef, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

function StudentMenuPage({ user }) {
    const navigate = useNavigate()
    const [races, setRaces] = useState([])
    const [isStarted, setStarted] = useState(false)

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
        } else {
            getRaces()
        }

        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection...");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [getRaces, navigate])

    useEffect(() => {
        if (isStarted) {
            navigate("/game");
        }
    }, [isStarted, navigate]);

    const handleJoin = (raceId) => {
        const token = Cookies.get("token")
        //add here the axios request

        if (!eventSourceRef.current) {
            listen(token)
        }
    }

    const listen = (token) => {
        const listener = new EventSource(HOST + "subscribe?token=" + token)
        listener.addEventListener("game-started", (event) => {
            setStarted(JSON.parse(event.data.isStarted))
        });

        eventSourceRef.current = listener;
    }


    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>

                <span> wellcome{user?.fullName} (student)</span>
                <button onClick={handleLogout}>התנתק</button>
            </div>

            <div>
                STUDENT_MENU_PAGE
            </div>
            <div>
                <h1>Races List</h1>
                <ul>
                    {races.map((race, index) => (
                        // Always add a unique 'key' to list items in React
                        <li key={race.id || index}>

                            {/* Option 1: Print specific fields */}
                            Race ID: {race.id} | Entry Code: {race.entryCode} | Status: {race.status}

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