import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedType, setSelectedType] = useState(1); // 1 = Student, 2 = Teacher
    const navigate = useNavigate();

    // ALTER THIS
    useEffect(() => {
        const token = Cookies.get("token");
        if (token != null) {
            navigate("/menu")
        }
    }, [navigate])

    const handleLogin = () => {
        axios.get("http://localhost:8080/login", {
            params: { username, password, selectedType }
        }).then(response => {
            if (response.data.success) {
                // שמירה ב-Cookies
                Cookies.set('token', response.data.token);
                navigate("/dashboard");
            } else {
                alert("התחברות נכשלה: " + (response.data.errorCode || "פרטים שגויים"));
            }
        }).catch(err => {
            console.error(err);
            alert("שגיאת תקשורת עם השרת");
        });
    };

    return (
        <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            <select value={selectedType} onChange={(e) => setSelectedType(Number(e.target.value))} style={{ width: '100%', marginBottom: '10px' }}>
                <option value={1}>Student</option>
                <option value={2}>Teacher</option>
            </select>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />

            <button onClick={handleLogin} style={{ width: '100%', marginBottom: '10px' }}>Sign In</button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span>Don't have an account? </span>
                <button
                    onClick={() => navigate("/signup")}
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Sign Up here
                </button>
            </div>
        </div>
    );
};

export default LoginPage;