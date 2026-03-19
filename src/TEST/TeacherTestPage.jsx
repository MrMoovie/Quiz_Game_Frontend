import {useEffect} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";

function TeacherTestPage(){
    const navigate = useNavigate()
    useEffect(() => {
        Cookies.set("token", "tok_tch_001")
        navigate("/")
    }, [navigate]);
}
export default TeacherTestPage;