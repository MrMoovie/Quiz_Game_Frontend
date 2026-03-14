import { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        userType: 1 // ברירת מחדל: 1 (למשל סטודנט)
    });

    const handleRegister = async () => {
        try {
            // יצירת FormData או שליחה כ-Params (תלוי איך ה-Backend מצפה לקבל)
            const response = await axios.post('http://localhost:8080/signup', null, {
                params: {
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    userType: formData.userType
                }
            });

            if (response.data.success) {
                alert("Registration successful! You can now login.");
            } else {
                alert("Registration failed: " + (response.data.errorCode === 1 ? "User already exists" : "Error"));
            }
        } catch (error) {
            console.error("Error during registration", error);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h2>Register</h2>
            <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, fullName: e.target.value})} /><br/>
            <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} /><br/>
            <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} /><br/>

            <select onChange={(e) => setFormData({...formData, userType: parseInt(e.target.value)})}>
                <option value="1">Student</option>
                <option value="2">Teacher</option>
            </select><br/><br/>

            <button onClick={handleRegister}>Sign Up</button>
        </div>
    );
};

export default Register;