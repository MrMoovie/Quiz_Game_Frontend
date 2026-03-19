import {useEffect} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";

function StudentTestPage(){
    const navigate = useNavigate()
    useEffect(() => {
        Cookies.set('token', 'tok_std_001')
        navigate("/")
    }, [navigate]);
}
export default StudentTestPage;