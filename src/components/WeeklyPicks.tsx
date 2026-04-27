import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getWeeklyGames as getWeeklyGamesGraphQL, createGamePicks, getCurrentSeasonWeek, getMySeasonPicks, WeeklyGame, NewGamePickInput, UserSeasonPicks } from "../api/graphql";
import { getLeagueFromUserLeagues } from "../api";
import { useApi, useAsyncAction } from "../hooks/useApi";

interface Game {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeSpread: number;
    awaySpread: number;
    gameTime: string;
}

interface UserPick {
    gameId: string;
    points: number;
    selectedTeam: 'home' | 'away';
    selectedSpread: number;
}


function WeeklyPicks() {
    const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId?: string }>();
    const navigate = useNavigate();
    const [selectedPicks, setSelectedPicks] = useState<Record<string, {points: number, team: 'home' | 'away', spread: number}>>({});
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [countdown, setCountdown] = useState(5 * 60);
    
    // Fetch league data
    const { data: league, loading: leagueLoading, error: leagueError } = useApi<{id: string; league_name: string} | null>(
        () => leagueId ? getLeagueFromUserLeagues(leagueId) : Promise.reject("No leagueId"),
        [leagueId]
    );

    // Fetch current season week
    const { data: currentWeekData, loading: weekLoading, error: weekError } = useApi(
        () => seasonId ? getCurrentSeasonWeek(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );

    // Fetch user's existing picks for this season
    const { data: mySeasonPicks, loading: myPicksLoading, error: myPicksError } = useApi<UserSeasonPicks>(
        () => seasonId ? getMySeasonPicks(seasonId) : Promise.reject("No seasonId"),
        [seasonId]
    );
    
    // Fetch games using GraphQL
    const { data: weeklyGames, loading: gamesLoading, error: gamesError } = useApi<WeeklyGame[]>(
        () => getWeeklyGamesGraphQL(),
        []
    );
    
    // Convert GraphQL games to our component format
    const games: Game[] = weeklyGames?.map(game => ({
        id: game.oddsGameId,
        homeTeam: game.homeTeam.name,
        awayTeam: game.awayTeam.name,
        homeSpread: game.homeTeam.spread,
        awaySpread: game.awayTeam.spread,
        gameTime: new Date(game.commenceTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        })
    })) || [];

    // Get current week picks from the fetched data
    const userPicks: UserPick[] = mySeasonPicks?.picks?.map(pick => ({
        gameId: pick.gameId,
        points: pick.points,
        selectedTeam: pick.selectedTeam === pick.homeTeam ? 'home' : 'away',
        selectedSpread: pick.spread
    })) || [];
    
    const { loading: submitting, error: submitError, execute: executeSubmit } = useAsyncAction();

    // Auto-refresh page every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 5 * 60 * 1000); // 5 minutes in milliseconds

        return () => clearInterval(interval);
    }, []);

    // Countdown ticker
    useEffect(() => {
        setCountdown(5 * 60);
        const tick = setInterval(() => {
            setCountdown(prev => (prev <= 1 ? 5 * 60 : prev - 1));
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    const getAvailablePoints = () => {
        const usedPoints = Object.values(selectedPicks).map(pick => pick.points);
        const existingPoints = userPicks.map(pick => pick.points);
        const allUsedPoints = [...usedPoints, ...existingPoints];

        // If user already has 3 picks total, no more points are available
        if (userPicks.length + Object.keys(selectedPicks).length >= 3) {
            return [];
        }

        return [1, 2, 3].filter(point => !allUsedPoints.includes(point));
    };

    const handleTeamSelection = (gameId: string, points: number, team: 'home' | 'away', spread: number) => {
        const newPicks = { ...selectedPicks };
        
        // Remove any existing selection with the same points
        Object.keys(newPicks).forEach(key => {
            if (newPicks[key].points === points) {
                delete newPicks[key];
            }
        });
        
        // If clicking the same selection, remove it (toggle off)
        if (selectedPicks[gameId]?.points === points && selectedPicks[gameId]?.team === team) {
            delete newPicks[gameId];
        } else {
            newPicks[gameId] = { points, team, spread };
        }
        
        setSelectedPicks(newPicks);
    };

    const isGameAlreadyPicked = (gameId: string) => {
        return userPicks.some(pick => pick.gameId === gameId);
    };

    const getExistingPick = (gameId: string) => {
        return userPicks.find(pick => pick.gameId === gameId);
    };

    const handleSubmitPicks = async () => {
        if (Object.keys(selectedPicks).length === 0 || !currentWeekData || !seasonId) return;

        try {
            // Create array of picks to submit all at once using GraphQL mutation
            const picksToSubmit: NewGamePickInput[] = Object.entries(selectedPicks).map(([gameId, pick]) => {
                const game = games.find(g => g.id === gameId);
                if (!game) throw new Error(`Game not found: ${gameId}`);
                
                return {
                    season_id: seasonId,
                    week_id: currentWeekData.weekId,
                    selected_team_name: pick.team === 'home' ? game.homeTeam : game.awayTeam,
                    opponent_team_name: pick.team === 'home' ? game.awayTeam : game.homeTeam,
                    spread_line: Math.round(pick.spread * 10), // Convert spread to integer by multiplying by 10
                    spread_result: 0, // Will be updated when game is completed
                    points_assigned: pick.points,
                    odds_game_id: game.id
                };
            }).filter(Boolean);

            await executeSubmit(() => createGamePicks(picksToSubmit));
            
            // Clear selected picks and show success popup
            setSelectedPicks({});
            setShowSuccessPopup(true);
            
            // Auto-hide popup after 3 seconds and refresh page
            setTimeout(() => {
                setShowSuccessPopup(false);
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error('Failed to submit picks:', error);
        }
    };

    const formatSpread = (spread: number) => {
        if (spread > 0) return `+${spread}`;
        return spread.toString();
    };

    const availablePoints = getAvailablePoints();

    // Loading state
    if (gamesLoading || weekLoading || leagueLoading || myPicksLoading) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (gamesError || weekError || leagueError || myPicksError) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
                    <p className="text-red-600">{gamesError || weekError || leagueError || myPicksError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-full shadow px-3 py-1 text-xs text-gray-500 flex items-center gap-1">
                <span>⟳</span>
                <span>Refreshing in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
            </div>
            <div className="mb-4">
                <button
                    onClick={() => navigate(`/league/${leagueId}/season/${seasonId}`)}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-3 transition-colors"
                >
                    <span className="mr-2">←</span>
                    Back to Season
                </button>
                <h2 className="text-2xl font-bold mb-2">Week {currentWeekData?.weekNumber || 1} Picks - {league?.league_name || 'League'}</h2>
                <p className="text-gray-600 mb-2">Select 3 games and assign 1, 2, or 3 points to each pick</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-blue-800 text-sm">
                    ℹ️ Games will appear 12 hours before they are eligible for selection.
                </p>
            </div>
            
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">Failed to submit picks: {submitError}</p>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">Picks Submitted!</h3>
                        <p className="text-gray-600">Good luck!</p>
                        <button 
                            onClick={() => {
                                setShowSuccessPopup(false);
                                window.location.reload();
                            }}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
            
            {games.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No games available for this week.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game) => {
                    const alreadyPicked = isGameAlreadyPicked(game.id);
                    const existingPick = getExistingPick(game.id);
                    const selectedPick = selectedPicks[game.id];
                    
                    return (
                        <div 
                            key={game.id} 
                            className={`bg-white border rounded-lg shadow-sm p-4 ${alreadyPicked ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-500 font-medium">{game.gameTime}</div>
                                {alreadyPicked && (
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                        {existingPick?.points}pt - {existingPick?.selectedTeam === 'away' ? game.awayTeam : game.homeTeam} {formatSpread(existingPick?.selectedSpread || 0)}
                                    </div>
                                )}
                            </div>
                            
                            {!alreadyPicked ? (
                                <div className="space-y-3">
                                    {/* Away Team Option */}
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-900">{game.awayTeam}</div>
                                            <div className="font-bold text-lg text-blue-600">{formatSpread(game.awaySpread)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(points => {
                                                const isSelected = selectedPick?.points === points && selectedPick?.team === 'away';
                                                const isAvailable = availablePoints.includes(points) || isSelected;
                                                
                                                return (
                                                    <button
                                                        key={points}
                                                        onClick={() => handleTeamSelection(game.id, points, 'away', game.awaySpread)}
                                                        disabled={!isAvailable}
                                                        className={`px-3 py-1 rounded-md font-semibold text-sm transition-colors ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white'
                                                                : isAvailable
                                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {points}pt
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Home Team Option */}
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-900">{game.homeTeam}</div>
                                            <div className="font-bold text-lg text-red-600">{formatSpread(game.homeSpread)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(points => {
                                                const isSelected = selectedPick?.points === points && selectedPick?.team === 'home';
                                                const isAvailable = availablePoints.includes(points) || isSelected;
                                                
                                                return (
                                                    <button
                                                        key={points}
                                                        onClick={() => handleTeamSelection(game.id, points, 'home', game.homeSpread)}
                                                        disabled={!isAvailable}
                                                        className={`px-3 py-1 rounded-md font-semibold text-sm transition-colors ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white'
                                                                : isAvailable
                                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {points}pt
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {existingPick?.selectedTeam === 'away' ? game.awayTeam : game.homeTeam}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatSpread(existingPick?.selectedSpread || 0)} • {existingPick?.points} points
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    })}
                </div>
            )}
            
            {games.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Picks made: {Object.keys(selectedPicks).length + userPicks.length}/3
                    </div>
                    
                    <button 
                        onClick={handleSubmitPicks}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={Object.keys(selectedPicks).length === 0 || submitting}
                    >
                        {submitting ? 'Submitting...' : `Submit Picks (${Object.keys(selectedPicks).length})`}
                    </button>
                </div>
            )}
        </div>
    );
}

export default WeeklyPicks;
