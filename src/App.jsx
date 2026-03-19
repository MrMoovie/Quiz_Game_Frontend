import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import MenuWrapper from './MenuWrapper.jsx'
import GameWrapper from './GameWrapper.jsx'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LoginPage />}/>
                <Route path={"/register"} element={<RegisterPage />}/>
                <Route path={"/menu"} element={<MenuWrapper />}/>
                <Route path={"/game"} element={<GameWrapper />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App