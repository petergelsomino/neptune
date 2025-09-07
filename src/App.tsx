import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LeagueDetails from "./components/LeagueDetails";
import SeasonDetails from "./components/SeasonDetails";
import LeagueSeasonsPage from "./pages/LeagueSeasonsPage";
import PicksPage from "./components/WeeklyPicks";
import Layout from "./components/Layout";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route element={<Layout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/league/:leagueId" element={<LeagueDetails />} />
                    <Route path="/league/:leagueId/season/:seasonId" element={<SeasonDetails />} />
                    <Route path="/league/:leagueId/seasons" element={<LeagueSeasonsPage />} />
                    <Route path="/league/:leagueId/season/:seasonId/picks" element={<PicksPage />} />
                    {/* Legacy route for backward compatibility */}
                    <Route path="/league/:leagueId/picks" element={<PicksPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
