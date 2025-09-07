import { useParams, useNavigate } from "react-router-dom";
import { getLeagueSeasons, Season } from "../api/graphql";
import { useApi } from "../hooks/useApi";

function LeagueSeasonsPage() {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    
    const { data: seasons, loading, error } = useApi<Season[]>(
        () => getLeagueSeasons(leagueId!),
        [leagueId]
    );

    const mockSeasons: Season[] = [
        { id: "1", year_start: 2024, year_end: 2025, sport: "football" },
        { id: "2", year_start: 2023, year_end: 2024, sport: "football" },
    ];

    const displaySeasons = seasons || mockSeasons;

    if (loading) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading seasons...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">Could not load seasons: {error}</p>
                    <p className="text-sm text-yellow-600 mt-1">Using mock data for development...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">League Seasons</h2>
            
            {displaySeasons.length === 0 ? (
                <p className="text-gray-500">No seasons found for this league.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {displaySeasons.map((season) => (
                        <div
                            key={season.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {season.year_start}-{season.year_end}
                                    </h3>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {season.sport} Season
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    Active
                                </span>
                            </div>
                            
                            <button
                                onClick={() => navigate(`/league/${leagueId}/season/${season.id}/picks`)}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                View Picks
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <button
                onClick={() => navigate(-1)}
                className="mt-6 text-blue-600 hover:text-blue-800 underline"
            >
                ← Back to Leagues
            </button>
        </div>
    );
}

export default LeagueSeasonsPage;