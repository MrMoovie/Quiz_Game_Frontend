import {useEffect, useRef, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

function TeacherMenuPage({user}) {
    const navigate = useNavigate()
    const [students, setStudents] = useState([])
    const [entryCode, setEntryCode] = useState("");

    const eventSourceRef = useRef(null)

    const handleLogout = () => {//התנתקות
        Cookies.remove("token");
        navigate("/");
    };

    const handleCreate = () => {
        const token = Cookies.get("token");

        axios.get(HOST + "create-race", { params: { token } })
            .then((res) => {
                console.log("Response from server:", res.data);
                if (res.data && res.data.entryCode) {
                    setEntryCode(res.data.entryCode);
                }
            })
            .catch((err) => {
                console.error("Error creating race:", err);
            });

        if (!eventSourceRef.current) {
            listen(token);
        }
    };
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

        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection...");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    },[navigate])

    return (
        <div>
            <h1>ניהול מרוץ</h1>
            <button onClick={handleCreate}>צור מרוץ חדש</button>

            {/* הצגת קוד הכניסה */}
            {entryCode && <h2>קוד כניסה: {entryCode}</h2>}

            <button onClick={handleLogout}>התנתק</button>

            <h3>תלמידים בלובי ({students.length}):</h3>
            <ul>
                {students.map((s, index) => (
                    <li key={index}>{s.name} - מסלול: {s.trackId}</li>
                ))}
            </ul>

            {/* כפתור להתחלת המרוץ בפועל */}
            {students.length > 0 && (
                <button onClick={handleStart}>התחל מרוץ!</button>
            )}
        </div>
    );
}

export default TeacherMenuPage;