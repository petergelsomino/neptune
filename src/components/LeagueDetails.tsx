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
            <div className="space-y-2">
                <button
                    onClick={() => navigate(`/league/${leagueId}/seasons`)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                    View Seasons
                </button>
                <button
                    onClick={() => navigate(`/league/${leagueId}/picks`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Quick Picks (Legacy)
                </button>
            </div>
        </div>
    );
}

export default LeagueDetails;
