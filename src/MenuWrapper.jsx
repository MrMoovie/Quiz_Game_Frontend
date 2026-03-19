// if teacher -> TeacherMenuPage else -> StudentMenuPage

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {HOST} from "./Constants.js";
import StudentMenuPage from "./pages/StudentMenuPage.jsx";
import TeacherMenuPage from "./pages/TeacherMenuPage.jsx";

const USER_TYPES={
    NONE:0,
    STUDENT:1,
    TEACHER:2
}

function MenuWrapper(){
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
    },[navigate]);

    if(userType === USER_TYPES.STUDENT){
        return (
            <StudentMenuPage/>
        )
    }else if(userType===USER_TYPES.TEACHER){
        return(
            <TeacherMenuPage/>
        )
    }else{
        return(
            <div>
                Loading...
            </div>
        )
    }
}

export default MenuWrapper;