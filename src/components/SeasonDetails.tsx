import { useParams, useNavigate } from "react-router-dom";
import { getLeagueFromUserLeagues } from "../api";
import { 
    getLeagueSeasons, 
    getSeasonLeaderboard, 
    getMySeasonPicks, 
    getSeasonLeaguePicks,
    getCurrentSeasonWeek,
    Season
} from "../api/graphql";
import { useApi } from "../hooks/useApi";

interface League {
    id: string;
    league_name: string;
}

function SeasonDetails() {
    const { leagueId, seasonId } = useParams();
    const navigate = useNavigate();

    const { data: league, loading: leagueLoading, error: leagueError } = useApi<League | null>(
        () => getLeagueFromUserLeagues(leagueId!),
        [leagueId]
    );

    const { data: seasons, loading: seasonsLoading, error: seasonsError } = useApi<Season[]>(
        () => getLeagueSeasons(leagueId!),
        [leagueId]
    );

    const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError } = useApi(
        () => seasonId ? getSeasonLeaderboard(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );

    const { data: myPicks, loading: myPicksLoading, error: myPicksError } = useApi(
        () => seasonId ? getMySeasonPicks(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );

    const { data: leaguePicks, loading: leaguePicksLoading, error: leaguePicksError } = useApi(
        () => seasonId ? getSeasonLeaguePicks(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );

    const { data: currentWeekData, loading: currentWeekLoading, error: currentWeekError } = useApi(
        () => seasonId ? getCurrentSeasonWeek(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );

    const currentSeason = seasons?.find(s => s.id === seasonId) || {
        id: seasonId || "1",
        year_start: 2024,
        year_end: 2025,
        sport: "football"
    };

    const displayLeague = league || { league_name: "League" };
    const currentWeek = currentWeekData?.weekNumber || myPicks?.currentWeek || leaguePicks?.currentWeek || 1;

    const isLoading = leagueLoading || seasonsLoading || leaderboardLoading || myPicksLoading || leaguePicksLoading || currentWeekLoading;

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{displayLeague.league_name}</h1>
                <h2 className="text-lg text-gray-600">
                    {currentSeason.year_start}-{currentSeason.year_end} {currentSeason.sport} Season
                </h2>
                <p className="text-sm text-gray-500 mt-1">Week {currentWeek}</p>
            </div>


            {/* Leaderboard Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Leaderboard</h3>
                {leaderboard?.entries ? (
                    <div className="space-y-3">
                        {leaderboard.entries.map((entry) => (
                            <div
                                key={entry.rank}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    entry.isCurrentUser 
                                        ? 'bg-blue-50 border border-blue-200' 
                                        : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                                        entry.rank === 3 ? 'bg-orange-500 text-white' :
                                        'bg-gray-300 text-gray-700'
                                    }`}>
                                        {entry.rank}
                                    </div>
                                    <span className={`font-medium ${
                                        entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                        {entry.username}
                                    </span>
                                    {entry.isCurrentUser && (
                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                            You
                                        </span>
                                    )}
                                </div>
                                <span className="font-semibold text-gray-900">{entry.points} pts</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No leaderboard data available.</p>
                )}
            </div>

            {/* Your Picks Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Your Picks - Week {currentWeek}</h3>
                    <button
                        onClick={() => navigate(`/league/${leagueId}/season/${seasonId}/picks`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Make Picks
                    </button>
                </div>
                
                {!myPicks?.picks || myPicks.picks.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No picks made for this week yet</p>
                        <button
                            onClick={() => navigate(`/league/${leagueId}/season/${seasonId}/picks`)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Make Your First Pick
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myPicks.picks.map((pick) => (
                            <div key={pick.id} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {pick.awayTeam} @ {pick.homeTeam}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Selected: <span className="font-medium text-blue-600">{pick.selectedTeam}</span>
                                            {pick.spread && (
                                                <span className="ml-2">
                                                    Spread: {pick.spread > 0 ? '+' : ''}{pick.spread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">{pick.points} pts</div>
                                        {pick.result && (
                                            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                                pick.result === 'WIN' ? 'bg-green-100 text-green-800' :
                                                pick.result === 'LOSS' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {pick.result === 'PENDING' ? 'Pending' : pick.result === 'WIN' ? 'Won' : 'Lost'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Other League Members' Picks Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">League Members' Picks - Week {currentWeek}</h3>
                
                {!leaguePicks?.userPicks || leaguePicks.userPicks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No other picks available for this week.</p>
                ) : (
                    <div className="space-y-6">
                        {leaguePicks.userPicks.map((userPicks) => (
                            <div key={userPicks.username} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <h4 className="font-semibold text-gray-900 mb-3">{userPicks.username}</h4>
                                <div className="space-y-2">
                                    {userPicks.picks.map((pick) => (
                                        <div key={pick.id} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {pick.awayTeam} @ {pick.homeTeam}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Selected: <span className="font-medium text-blue-600">{pick.selectedTeam}</span>
                                                        {pick.spread && (
                                                            <span className="ml-2">
                                                                Spread: {pick.spread > 0 ? '+' : ''}{pick.spread}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900 text-sm">{pick.points} pts</div>
                                                    {pick.result && (
                                                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                                            pick.result === 'WIN' ? 'bg-green-100 text-green-800' :
                                                            pick.result === 'LOSS' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {pick.result === 'PENDING' ? 'Pending' : pick.result === 'WIN' ? 'Won' : 'Lost'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeasonDetails;