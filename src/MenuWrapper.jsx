// if teacher -> TeacherMenuPage else -> StudentMenuPage

import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {HOST} from "./Constants.js";
import StudentMenuPage from "./pages/StudentMenuPage.jsx";
import TeacherMenuPage from "./pages/TeacherMenuPage.jsx";

function MenuWrapper(){
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
            <StudentMenuPage/>
        )
    }else if(userType===2){
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