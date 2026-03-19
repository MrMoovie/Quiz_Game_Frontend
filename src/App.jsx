import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MenuWrapper from './MenuWrapper.jsx'
import GameWrapper from './GameWrapper.jsx'

// TEST
import TeacherTestPage from './TEST/TeacherTestPage.jsx'
import StudentTestPage from './TEST/StudentTestPage.jsx'


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

                {/*TEST*/}
                <Route path={"/test-tch"} element={<TeacherTestPage />}/>
                <Route path={"/test-std"} element={<StudentTestPage />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App