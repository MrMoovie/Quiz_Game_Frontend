import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { HOST } from "./Constants.js";
import Lobby from "./pages/Lobby.jsx"; // Adjust the path if your Lobby is in a different folder

function LobbyWrapper() {
    const navigate = useNavigate();
    const { raceId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Fetch the user's details using their token
        // (Replace "get-user" with whatever endpoint you currently use in your MenuWrapper)
        axios.get(`${HOST}get-user`, { params: { token } })
            .then(res => {
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    navigate("/");
                }
            })
            .catch(err => {
                console.error("Failed to authenticate user", err);
                navigate("/");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Lobby...</div>;
    }

    // Here is where we fulfill your function Lobby({ user, role }) signature!
    // We pass the user object, and extract the role (assuming your user object has a role property).
    // If your backend doesn't send a 'role' property, you might need to determine it based on the user object.
    return <Lobby user={user} role={user.role} />;
}

export default LobbyWrapper;