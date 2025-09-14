import { useNavigate } from "react-router-dom";
import { getUserLeagues } from "../api";
import { useApi } from "../hooks/useApi";

interface League {
    id: string;
    league_name: string;
}

function LeagueList() {
    const navigate = useNavigate();
    
    const { data: leagues, loading, error } = useApi<League[]>(
        () => getUserLeagues(),
        []
    );

    if (loading) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading leagues...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Leagues</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-xl mb-6">Your Pick Leagues</h2>
            
            <div className="mb-6">
                <h3 className="font-semibold mb-4">Leagues</h3>
                {!leagues || leagues.length === 0 ? (
                    <p className="text-gray-500">No leagues found. Contact your administrator to join a league.</p>
                ) : (
                    <div className="space-y-3">
                        {leagues.map((league) => (
                            <div
                                key={league.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {league.league_name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Click to view seasons and make picks
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/league/${league.id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        View League
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeagueList;
