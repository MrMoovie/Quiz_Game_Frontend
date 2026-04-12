import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        selectedType: 1
    });
    const [errorMessage, setErrorMessage] = useState("waiting...");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("token");
        if (token != null) {
            navigate("/menu");
        }
    }, [navigate]);

    const handleSignup = () => {
        setIsLoading(true);
        const signupData = {
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            confirmPassword: formData.confirmPassword,
            selectedType: formData.selectedType
        };

        axios.post("http://localhost:8080/signup", null, {
            params: signupData
        }).then((response) => {
            //backend Error:
            if (response.data.errorCode === 1012){
                setErrorMessage("Please enter your full name (First and Last name)" + response.data.errorCode);
            } else if (response.data.errorCode === 1013) {
                setErrorMessage("Username must have at least one letter or number."+ response.data.errorCode)
            }else if (response.data.errorCode === 1014) {
                setErrorMessage("Password must be at least 6 characters long."+ response.data.errorCode)
            } else if (response.data.errorCode === 1015) {
                setErrorMessage("Passwords do not match!"+ response.data.errorCode)
            } else if (response.data.errorCode === 1004) {
                setErrorMessage("Username already taken! Choose another."+ response.data.errorCode);
            } else if (response.data.success) {
                Cookies.set("token", response.data.token);
                navigate("/menu");
            } else {
                setErrorMessage("Signup failed: " + response.data.errorCode);
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
            <div className="card" style={{width: '450px'}}>
                <div style={{textAlign: 'center'}}>
                    <h1>CREATE ACCOUNT</h1>
                </div>

                <div className="input-group">
                    <label>Join the race as:</label>
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
                        placeholder="Full Name"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, fullName: e.target.value})
                        }
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Choose Username"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, username: e.target.value})
                        }
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, password: e.target.value})
                        }
                    />
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="game-input"
                        disabled={isLoading}
                        onChange={(e) =>
                            setFormData({...formData, confirmPassword: e.target.value})
                        }
                    />
                </div>

                <div className="error-text" style={{color: '#2C3E50'}}>
                    {errorMessage}
                </div>

                <button className="btn" onClick={handleSignup}>
                    Sign up
                </button>

                <button className="btn" onClick={() => navigate("/login")}>
                    Already have an account? Log in
                </button>
            </div>
        </div>
    );
};

export default SignupPage;