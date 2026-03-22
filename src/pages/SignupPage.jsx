import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        selectedType: 1
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("token");
        if (token != null) {
            navigate("/menu")
        }
    }, [navigate])

    const handleSignup = () => {
        //validation
        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters long!");
            return; // לעצור את הפונקציה ולא לשלוח לשרת
        }
        if (!formData.fullName.includes(" ")) {
            alert("Please enter your full name (First and Last name)");
            return;
        }
        axios.get("http://localhost:8080/signup", {
            params: {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                selectedType: formData.selectedType
            }
        }).then((response) => {
            if (response.data.success) {
                Cookies.set("token", response.data.token);
                alert("נרשמת בהצלחה!");
                navigate("/menu"); // /מעבר לתפריט
            } else {
                alert("הרשמה נכשלה: " + response.data.errorCode);
            }
        }).catch(err => {
            console.error(err);
            alert("שגיאה בחיבור לשרת");
        });
    };

    return (
        <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Create Account</h2>
            <select value={formData.selectedType} onChange={(e) => setFormData({...formData, selectedType: Number(e.target.value)})} style={{ width: '100%', marginBottom: '10px' }}>
                <option value={1}>Student</option>
                <option value={2}>Teacher</option>
            </select>
            <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
            <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
            <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} />
            <button onClick={handleSignup} style={{ width: '100%' }}>Sign Up</button>
        </div>
    );
};

export default SignupPage;