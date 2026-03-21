import {useEffect} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";

function TeacherGamePage() {
    const navigate = useNavigate()

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/")
        }

    },[navigate])
    return (
        <>
            <div>
                TEACHER_GAME_PAGE
            </div>

        </>
    )
}

export default TeacherGamePage;