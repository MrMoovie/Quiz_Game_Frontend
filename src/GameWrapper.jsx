// if teacher -> TeacherGamePage else -> StudentGamePage

// if teacher -> TeacherMenuPage else -> StudentMenuPage

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {HOST} from "./Constants.js";
import TeacherGamePage from "./pages/TeacherGamePage.jsx";
import StudentGamePage from "./pages/StudentGamePage.jsx";

function GameWrapper(){
    const [userType, setUserType] = useState(0)
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
    },[navigate]);

    if(userType === 1){
        return (
            <StudentGamePage/>
        )
    }else if(userType===2){
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