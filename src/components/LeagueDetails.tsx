import { useParams, useNavigate } from "react-router-dom";

function LeagueDetails() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h2 className="text-xl mb-2">League {leagueId}</h2>
            <div className="mb-4">
                <h3 className="font-semibold">Leaderboard</h3>
                <p>1. Alice - 100pts</p>
                <p>2. Bob - 95pts</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">Your Picks</h3>
                <p>Current picks for this week...</p>
            </div>
            <button
                onClick={() => navigate(`/league/${leagueId}/picks`)}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                Select Games
            </button>
        </div>
    );
}

export default LeagueDetails;
