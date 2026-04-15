import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MenuWrapper from './MenuWrapper.jsx'
import GameWrapper from './GameWrapper.jsx'
import LobbyPage from "./pages/LobbyWrapper.jsx";

// TEST
import TeacherTestPage from './TEST/TeacherTestPage.jsx'
import StudentTestPage from './TEST/StudentTestPage.jsx'


import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LobbyWrapper from "./pages/LobbyWrapper.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LoginPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path={"/signup"} element={<SignupPage />}/>
                <Route path={"/menu"} element={<MenuWrapper />}/>
                <Route path={"/game"} element={<GameWrapper />}/>
                <Route path={"/lobby/:raceId"} element={<LobbyWrapper />}/>

                {/*TEST*/}
                <Route path={"/test-tch"} element={<TeacherTestPage />}/>
                <Route path={"/test-std"} element={<StudentTestPage />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App