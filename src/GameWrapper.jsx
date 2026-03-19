// if teacher -> TeacherGamePage else -> StudentGamePage
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {HOST} from "./Constants.js";
import TeacherGamePage from "./pages/TeacherGamePage.jsx";
import StudentGamePage from "./pages/StudentGamePage.jsx";

const USER_TYPES={
    NONE:0,
    STUDENT:1,
    TEACHER:2
}

function GameWrapper(){
    const [userType, setUserType] = useState(USER_TYPES.NONE)
    const navigate = useNavigate()

    useEffect(() => {
        const token = Cookies.get("token")
        if(!token){
            navigate("/")
        }else{
            axios.get(HOST + "get-user-type", {params:{token}})
                .then((response) =>{
                    setUserType(response.data.userType)
                })
        }
    },[navigate, userType]);

    if(userType === USER_TYPES.STUDENT){
        return (
            <StudentGamePage/>
        )
    }else if(userType===USER_TYPES.TEACHER){
        return(
            <TeacherGamePage/>
        )
    }else{
        return(
            <div>
                Loading...
            </div>
        )
    }
}

export default GameWrapper;