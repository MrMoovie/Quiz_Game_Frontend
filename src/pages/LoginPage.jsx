import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../style/LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        selectedType: 1
    });

    const [errorMessage, setErrorMessage] = useState('Waiting for login...');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("token");
        if (token != null) {
            navigate("/menu");
        }
    }, [navigate]);

    const handleLogin = () => {
        setIsLoading(true);

        axios.get("http://localhost:8080/login", {
            params: {
                username: formData.username,
                password: formData.password,
                selectedType: formData.selectedType
            }
        }).then((response) => {
            if (response.data.success) {
                Cookies.set("token", response.data.token);
                navigate("/menu");
            } else {
                setErrorMessage("Oops! Check your details again." + response.data.errorCode);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setErrorMessage("Connection lost! Try again.");
            setIsLoading(false);
        });
    };

    return (
        <div className="login-container">
            <div className="card">
                <div className="login-title-wrapper">
                    <span><h1>MATH RACERS</h1></span>
                </div>

                <div className="input-group">
                    <label>Who are you?</label>
                    <div className="role-selection">
                        <div
                            className={`role-card ${formData.selectedType === 1 ? 'active' : ''}`}
                            onClick={() => !isLoading && setFormData({...formData, selectedType: 1})}
                        >
                            <span className="icon">🎓</span>
                            <span className="label">Student</span>
                        </div>
                        <div
                            className={`role-card ${formData.selectedType === 2 ? 'active' : ''}`}
                            onClick={() => !isLoading && setFormData({...formData, selectedType: 2})}
                        >
                            <span className="icon">👨‍🏫</span>
                            <span className="label">Teacher</span>
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Choose Username"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, username: e.target.value})}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, password: e.target.value})}
                    />
                </div>

                <div className="error-text">
                    {errorMessage}
                </div>


                <button className="btn" onClick={handleLogin} disabled={isLoading}>
                    Sign in
                </button>

                <button className="btn" onClick={() => navigate("/signup")}>
                    Sign Up Here
                </button>
            </div>
        </div>
    );
};

export default LoginPage;