import { useParams, useNavigate } from "react-router-dom";
import { getLeagueDetails, getLeagueSeasons } from "../api";
import { getLeagueSeasons as getGraphQLSeasons, Season } from "../api/graphql";
import { useApi } from "../hooks/useApi";

interface League {
    id: string;
    league_name: string;
}

function LeagueDetails() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    const { data: league, loading: leagueLoading, error: leagueError } = useApi<League>(
        () => getLeagueDetails(leagueId!),
        [leagueId]
    );

    const { data: seasons, loading: seasonsLoading, error: seasonsError } = useApi<Season[]>(
        () => getGraphQLSeasons(leagueId!),
        [leagueId]
    );

    const mockSeasons: Season[] = [
        { id: "1", year_start: 2024, year_end: 2025, sport: "football" },
        { id: "2", year_start: 2023, year_end: 2024, sport: "football" },
    ];

    const displaySeasons = seasons || mockSeasons;
    const displayLeague = league || { league_name: `League ${leagueId}` };

    if (leagueLoading || seasonsLoading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl mb-6">{displayLeague.league_name}</h2>
            
            {(leagueError || seasonsError) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">Could not load data from server</p>
                    <p className="text-sm text-yellow-600">Using fallback data for development...</p>
                </div>
            )}

            <div className="mb-6">
                <h3 className="font-semibold mb-4">Seasons</h3>
                {displaySeasons.length === 0 ? (
                    <p className="text-gray-500">No seasons found for this league.</p>
                ) : (
                    <div className="space-y-3">
                        {displaySeasons.map((season) => (
                            <div
                                key={season.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {season.year_start}-{season.year_end}
                                        </h4>
                                        <p className="text-sm text-gray-600 capitalize">
                                            {season.sport} Season
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/league/${leagueId}/season/${season.id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                    >
                                        View Season
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

export default LeagueDetails;
