import {useEffect, useRef, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

function TeacherMenuPage({user}) {
    const navigate = useNavigate()
    const [students, setStudents] = useState([])

    const eventSourceRef = useRef(null)

    const handleLogout = () => {//התנתקות
        Cookies.remove("token");
        navigate("/");
    };

    const handleCreate = () =>{
        const token = Cookies.get("token")
        axios.get(HOST+"create-race", {params:{token}})
            .then((res)=>{console.log(res)})

        if(!eventSourceRef.current) {
            listen(token)
        }

    }
    const listen = (token) =>{
        const listener = new EventSource(HOST + "subscribe?token=" + token);
        listener.addEventListener("lobby-update", (event) => {
            const student = JSON.parse(event.data);
            const studentDetails = {
                name:student.studentName,
                trackId:student.trackId
            };
            setStudents((prevStudents) => [...prevStudents, studentDetails]);
            console.log(student)
        });

        eventSourceRef.current = listener
    }

    const handleStart = () => {
        const token = Cookies.get("token");
        axios.get(HOST + "start-race", { params: { token } })
            .then(() => {
                navigate("/game");
            })
            .catch(err => console.error("Failed to start race", err));
    }

    useEffect(() => {
        //add maintaining connection...

        const token = Cookies.get("token");
        if (!token) {
            navigate("/")
        }

        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection...");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    },[navigate])

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
                <span> hello{user?.fullName} (teacher)</span>
                <button onClick={handleLogout}>התנתק</button>
            </div>

            <div>
                TEACHER_MENU_PAGE
            </div>

            <button onClick={()=>{handleCreate()}}>
                Create Race
            </button>
            {/* כפתור התחלה (רק אם יש כבר סטודנטים)*/}
            {students.length > 0 && (
                <button onClick={handleStart} style={{ backgroundColor: 'green', color: 'white', marginLeft: '10px' }}>
                    Start Race!
                </button>
            )}

            <div>
                <h1>Students List</h1>
                <ul>
                    {students.map((std, index) => (
                        // Always add a unique 'key' to list items in React
                        <li key={std || index}>

                            {/* Option 1: Print specific fields */}
                            Std name: {std.name} | Track ID: {std.trackId}

                            {/* Option 2: Print the raw JSON object for debugging */}
                            {/* {JSON.stringify(race)} */}

                        </li>
                    ))}
                </ul>
            </div>
        </>


    )
}

export default TeacherMenuPage;