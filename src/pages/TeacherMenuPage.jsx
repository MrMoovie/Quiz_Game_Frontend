import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {HOST} from "../Constants.js";

function TeacherMenuPage() {
    const navigate = useNavigate()
    const [students, setStudents] = useState([])

    const handleCreate = () =>{
        const token = Cookies.get("token")
        const listener = new EventSource(HOST + "/subscribe?token=" + token);

        axios.get(HOST+"create-race", {params:{token}})
            .then((res)=>{console.log(res)})

        listener.addEventListener("lobby-update", (event) => {
            const student = JSON.parse(event.data);
            const studentDetails = {
                name:student.studentName,
                trackId:student.trackId
            };
            setStudents((prevStudents) => [...prevStudents, studentDetails]);
            console.log(student)
        });

        return () => {
            listener.close();
        };
    }

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/")
        }
    },[navigate])

    return (
        <>
            <div>
                TEACHER_MENU_PAGE
            </div>

            <button onClick={()=>{handleCreate()}}>
                Create Race
            </button>


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