import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { HOST } from "../Constants.ts";
import LobbyPage from "../pages/LobbyPage.jsx";
import "../style/LobbyWrapper.css";

function LobbyWrapper() {
    const navigate = useNavigate();
    const {raceId} = useParams();
    // FIX 1: Removed the {} around null. Removed the unused 'role' state.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [entryCode, setEntryCode] = useState(null);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
            return;
        }
        console.log(raceId)
        //Authenticate the user and get his default parameters.
        axios.get(`${HOST}get-default-params`, { params: { token, raceId } })
            .then(res => {
                if (res.data.success) {

                    // FIX 2 & 3: Sync the Java data into the format the Lobby expects
                    // Assuming userType 1 is Teacher and 2 is Student.
                    // (Change these numbers if your database uses different ones!)
                    const mappedRole = res.data.userType === 2 ? "teacher" : "student";

                    // Rebuild the user object manually from the flat Java response
                    setUser({
                        id: res.data.userId,
                        fullName: res.data.fullName,
                        role: mappedRole
                    });
                    setEntryCode(res.data.entryCode)

                } else {
                    alert("Failed to authenticate user "+ res.data.errorCode)
                    navigate("/");
                }
            })
            .catch(err => {
                alert("Failed to authenticate user "+ err)
                console.log()
                navigate("/");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate, raceId]);

    if (loading) {
        return <div className="lobby-wrapper__loading">Loading Lobby...</div>;
    }

    // Now 'user' has the exact structure we need, and 'user.role' will be a clean string!
    console.log(user)
    return <LobbyPage user={user} role={user.role} entryCode={entryCode} />;
}

export default LobbyWrapper;