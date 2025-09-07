import { useParams } from "react-router-dom";
import { useState } from "react";
import { getWeeklyGames as getWeeklyGamesGraphQL, createGamePick, WeeklyGame, NewGamePickInput } from "../api/graphql";
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

const mockGames: Game[] = [
    { 
        id: "game1", 
        homeTeam: "Buffalo Bills", 
        awayTeam: "Miami Dolphins", 
        homeSpread: -3.5,
        awaySpread: 3.5,
        gameTime: "1:00 PM ET" 
    },
    { 
        id: "game2", 
        homeTeam: "Kansas City Chiefs", 
        awayTeam: "Las Vegas Raiders", 
        homeSpread: -7,
        awaySpread: 7,
        gameTime: "4:25 PM ET" 
    },
    { 
        id: "game3", 
        homeTeam: "Dallas Cowboys", 
        awayTeam: "Philadelphia Eagles", 
        homeSpread: 2.5,
        awaySpread: -2.5,
        gameTime: "8:20 PM ET" 
    },
];

function WeeklyPicks() {
    const { leagueId, seasonId } = useParams<{ leagueId: string; seasonId?: string }>();
    const [selectedPicks, setSelectedPicks] = useState<Record<string, {points: number, team: 'home' | 'away', spread: number}>>({});
    const [currentWeek] = useState("f4860615-9e98-450a-86df-b0f6b3d856ea");
    const currentSeason = seasonId || "0c879d89-99b4-4e9f-9b61-fedb37d31c85";
    
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
    
    // Mock existing user picks for now
    const userPicks: UserPick[] = [{ gameId: "game1", points: 2, selectedTeam: 'away', selectedSpread: 3.5 }];
    
    const { loading: submitting, error: submitError, execute: executeSubmit } = useAsyncAction();

    // Fallback to mock data if API fails
    const displayGames = games.length > 0 ? games : mockGames;

    const getAvailablePoints = () => {
        const usedPoints = Object.values(selectedPicks).map(pick => pick.points);
        const existingPoints = userPicks.map(pick => pick.points);
        const allUsedPoints = [...usedPoints, ...existingPoints];
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
        if (Object.keys(selectedPicks).length === 0) return;

        try {
            // Submit each pick individually using GraphQL mutation
            const pickPromises = Object.entries(selectedPicks).map(([gameId, pick]) => {
                const game = displayGames.find(g => g.id === gameId);
                if (!game) return Promise.resolve();
                
                const input: NewGamePickInput = {
                    season_id: currentSeason,
                    week_id: currentWeek,
                    selected_team_name: pick.team === 'home' ? game.homeTeam : game.awayTeam,
                    opponent_team_name: pick.team === 'home' ? game.awayTeam : game.homeTeam,
                    spread_selection: pick.spread,
                    spread_result: 0, // Will be updated when game is completed
                    points_assigned: pick.points
                };

                return createGamePick(input);
            });

            await executeSubmit(() => Promise.all(pickPromises));
            
            // Clear selected picks and refetch user picks
            setSelectedPicks({});
            // TODO: Refetch user picks or update local state
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
    if (gamesLoading) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading games...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (gamesError) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
                    <p className="text-red-600">{gamesError}</p>
                    <p className="text-sm text-red-600 mt-2">Using mock data for development...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Week 1 Picks - League {leagueId}</h2>
            <p className="text-gray-600 mb-6">Select 3 games and assign 1, 2, or 3 points to each pick</p>
            
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">Failed to submit picks: {submitError}</p>
                </div>
            )}
            
            <div className="grid gap-4">
                {displayGames.map((game) => {
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
        </div>
    );
}

export default WeeklyPicks;
