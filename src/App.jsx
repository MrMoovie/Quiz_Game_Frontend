import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css'

function App() {
    return (
        <Router>
            <div className="App">
                <h1>Quiz Game Project</h1>
                <Routes>
                    {/* דף הבית יהיה הלוגין */}
                    <Route path="/" element={<LoginPage />} />

                    {/* נתיב להרשמה */}
                    <Route path="/signup" element={<SignupPage />} />

                    {/* נתיב ל-Dashboard (אחרי התחברות מוצלחת) */}
                    <Route path="/dashboard" element={<div>בwelcome to the game (Dashboard)</div>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;