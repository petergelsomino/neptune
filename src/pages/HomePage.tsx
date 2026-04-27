import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserLeagues } from "../api";
import { useApi } from "../hooks/useApi";

interface League {
    id: string;
    league_name: string;
}

function HomePage() {
    const navigate = useNavigate();
    const [hasToken, setHasToken] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        setHasToken(!!token);
        
        // If no token, redirect to login
        if (!token) {
            navigate('/');
            return;
        }
    }, [navigate]);
    
    const { data: leagues, loading, error } = useApi<League[]>(
        () => hasToken ? getUserLeagues() as Promise<League[]> : Promise.resolve([] as League[]), 
        [hasToken]
    );
    
    // Fallback to mock data if API fails
    const displayLeagues = leagues?.length ? leagues : [];

    if (!hasToken) {
        return null; // Will redirect to login
    }

    if (loading) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading your leagues...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">Could not load leagues: {error}</p>
                    <p className="text-sm text-yellow-600 mt-1">Using mock data for development...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Leagues</h2>

            {displayLeagues.length === 0 ? (
                <p className="text-gray-500">No leagues found. Join a league to get started!</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {displayLeagues.map((league) => (
                        <div
                            key={league.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {league.league_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        League
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    Active
                                </span>
                            </div>

                            <button
                                onClick={() => navigate(`/league/${league.id}/seasons`)}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                View League
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* About / How it Works */}
            <div className="mt-10 border border-gray-200 rounded-lg overflow-hidden">
                <button
                    onClick={() => setShowAbout(prev => !prev)}
                    className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                    <span className="text-lg font-semibold text-gray-800">How PicksPool Works</span>
                    <span className="text-gray-500 text-xl">{showAbout ? "−" : "+"}</span>
                </button>

                {showAbout && (
                    <div className="px-6 py-5 bg-white space-y-6 text-gray-700">
                        <p className="text-gray-500 text-sm">
                            PicksPool is a confidence-based football picks pool. Each week you pick games against the spread and stake your confidence points — the better you feel about a pick, the more points you put on it.
                        </p>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-2xl mb-2">1</div>
                                <h4 className="font-semibold text-gray-800 mb-1">Pick 3 Games</h4>
                                <p className="text-sm text-gray-600">Each week, choose 3 NFL games you want to bet on against the spread.</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-2xl mb-2">2</div>
                                <h4 className="font-semibold text-gray-800 mb-1">Assign Points</h4>
                                <p className="text-sm text-gray-600">Assign 1, 2, or 3 confidence points to each pick — 3 for your most confident game.</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-2xl mb-2">3</div>
                                <h4 className="font-semibold text-gray-800 mb-1">Earn Points</h4>
                                <p className="text-sm text-gray-600">If your pick wins against the spread, you earn the points you assigned. Most points at the end of the season wins.</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">The Spread</h4>
                            <p className="text-sm text-gray-600">
                                Each game has a point spread — the favorite must win by more than the spread, and the underdog must lose by less (or win outright) for your pick to count. Spreads make every game competitive to bet on.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Leagues & Seasons</h4>
                            <p className="text-sm text-gray-600">
                                Leagues are private groups you play with your friends. Each season runs through the NFL schedule. Your picks and standings are tracked within your league — compete to top the leaderboard by the end of the season.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
