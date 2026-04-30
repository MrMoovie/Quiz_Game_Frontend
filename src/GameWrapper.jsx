// if teacher -> TeacherGamePage else -> StudentGamePage
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {HOST} from "./Constants.js";
import TeacherGamePage from "./pages/TeacherGamePage.jsx";
import StudentGamePage from "./pages/StudentGamePage.jsx";
import StudentGamePageTest from "./pages/StudentGamePageTest.jsx";

const USER_TYPES={
    NONE:0,
    STUDENT:1,
    TEACHER:2
}

function GameWrapper(){
    const navigate = useNavigate()
    const [user, setUser] = useState(null);


    const {raceId} = useParams();

    useEffect(() => {
        const token = Cookies.get("token")
        if(!token){
            navigate("/")
        }else{
            axios.get(HOST + "get-default-params", {params:{token, raceId}})
                .then((res) =>{
                    if (res.data.success) {

                        // FIX 2 & 3: Sync the Java data into the format the Lobby expects
                        // Assuming userType 1 is Teacher and 2 is Student.
                        // (Change these numbers if your database uses different ones!)
                        

                        // Rebuild the user object manually from the flat Java response
                        setUser({
                            id: res.data.userId,
                            fullName: res.data.fullName,
                            role: res.data.userType
                        });

                    } else {
                        alert("Failed to authenticate user "+ res.data.errorCode)
                        navigate("/");
                    }
                })
        }
    },[navigate, raceId]);
    if(user){
        if(user.role === USER_TYPES.STUDENT){
            return (
                <StudentGamePage/>
            )
        }else if(user.role===USER_TYPES.TEACHER){
            return(
                <TeacherGamePage/>
            )
        }
    }else{
        return(
            <div>
                Loading...
            </div>
        )
    }
}

export default GameWrapper;