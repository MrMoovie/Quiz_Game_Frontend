import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MenuWrapper from './MenuWrapper.jsx'
import GameWrapper from './GameWrapper.jsx'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LoginPage />}/>
                <Route path={"/register"} element={<SignupPage />}/>
                <Route path={"/menu"} element={<MenuWrapper />}/>
                <Route path={"/game"} element={<GameWrapper />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App