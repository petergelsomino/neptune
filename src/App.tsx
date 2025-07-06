import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LeagueDetails from "./components/LeagueDetails";
import PicksPage from "./components/WeeklyPicks";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/league/:leagueId" element={<LeagueDetails />} />
                <Route path="/league/:leagueId/picks" element={<PicksPage />} />
            </Routes>
        </Router>
    );
}

export default App;
