import { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            // הקריאה לשרת שלך (Backend רץ בדרך כלל על פורט 8080)
            const response = await axios.post('http://localhost:8080/signin', null, {
                params: { username, password }
            });

            if (response.data.success) {
                console.log("Login success! Token:", response.data.token);
                // כאן נשמור את הטוקן ב-LocalStorage
                localStorage.setItem('token', response.data.token);
            } else {
                alert("Login failed: " + response.data.errorCode);
            }
        } catch (error) {
            console.error("Error connecting to server", error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Sign In</button>
        </div>
    );
};

export default Login;