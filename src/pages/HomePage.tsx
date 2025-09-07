import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserLeagues } from "../api";
import { useApi } from "../hooks/useApi";

interface League {
    id: string;
    league_name: string;
}

const mockLeagues = [
    { id: "8328ccf8-5660-444e-9ab7-19a1191adc79", league_name: "Home Dudes" },
    { id: "2", league_name: "Mock League 2" },
];

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
    const displayLeagues = leagues?.length ? leagues : mockLeagues;

    if (!hasToken) {
        return null; // Will redirect to login
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading your leagues...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="text-yellow-800 font-semibold mb-2">Could not load leagues from server</h3>
                    <p className="text-yellow-700 text-sm mb-2">Error: {error}</p>
                    <p className="text-sm text-yellow-600">Using mock data for development...</p>
                </div>
                <div className="mb-4">
                    <h2 className="text-xl mb-4">Your Leagues</h2>
                    {displayLeagues.length === 0 ? (
                        <p className="text-gray-500">No leagues found. Join a league to get started!</p>
                    ) : (
                        <ul className="space-y-2">
                            {displayLeagues.map((league) => (
                                <li key={league.id}>
                                    <button
                                        className="text-blue-500 underline hover:text-blue-700"
                                        onClick={() => navigate(`/league/${league.id}`)}
                                    >
                                        {league.league_name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Your Leagues</h2>
            {displayLeagues.length === 0 ? (
                <p className="text-gray-500">No leagues found. Join a league to get started!</p>
            ) : (
                <ul className="space-y-2">
                    {displayLeagues.map((league) => (
                        <li key={league.id}>
                            <button
                                className="text-blue-500 underline hover:text-blue-700"
                                onClick={() => navigate(`/league/${league.id}`)}
                            >
                                {league.league_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default HomePage;
