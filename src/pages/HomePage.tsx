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
        </div>
    );
}

export default HomePage;
