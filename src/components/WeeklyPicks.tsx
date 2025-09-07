import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

interface Game {
    id: string;
    homeTeam: string;
    awayTeam: string;
    spread: number;
    gameTime: string;
}

interface UserPick {
    gameId: string;
    points: number;
    selectedTeam: 'home' | 'away';
    selectedSpread: number;
}

const mockGames: Game[] = [
    { id: "game1", homeTeam: "Buffalo Bills", awayTeam: "Miami Dolphins", spread: -3.5, gameTime: "1:00 PM ET" },
    { id: "game2", homeTeam: "Kansas City Chiefs", awayTeam: "Las Vegas Raiders", spread: -7, gameTime: "4:25 PM ET" },
    { id: "game3", homeTeam: "Dallas Cowboys", awayTeam: "Philadelphia Eagles", spread: 2.5, gameTime: "8:20 PM ET" },
    { id: "game4", homeTeam: "Green Bay Packers", awayTeam: "Chicago Bears", spread: -4, gameTime: "1:00 PM ET" },
    { id: "game5", homeTeam: "San Francisco 49ers", awayTeam: "Los Angeles Rams", spread: -1.5, gameTime: "4:25 PM ET" },
];

function WeeklyPicks() {
    const { leagueId } = useParams();
    const [games, setGames] = useState<Game[]>([]);
    const [userPicks, setUserPicks] = useState<UserPick[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<Record<string, {points: number, team: 'home' | 'away', spread: number}>>({});

    useEffect(() => {
        // TODO: Replace with actual API calls
        setGames(mockGames);
        // Mock existing user picks - user already assigned 2pt to game1, took Miami +3.5
        setUserPicks([{ gameId: "game1", points: 2, selectedTeam: 'away', selectedSpread: 3.5 }]);
    }, []);

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

    const formatSpread = (spread: number) => {
        if (spread > 0) return `+${spread}`;
        return spread.toString();
    };

    const availablePoints = getAvailablePoints();

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Week 1 Picks - League {leagueId}</h2>
            <p className="text-gray-600 mb-6">Select 3 games and assign 1, 2, or 3 points to each pick</p>
            
            <div className="grid gap-4">
                {games.map((game) => {
                    const alreadyPicked = isGameAlreadyPicked(game.id);
                    const existingPick = getExistingPick(game.id);
                    const selectedPick = selectedPicks[game.id];
                    
                    const awaySpread = game.spread > 0 ? game.spread : -game.spread;
                    const homeSpread = game.spread < 0 ? -game.spread : game.spread;
                    
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
                                            <div className="font-bold text-lg text-blue-600">{formatSpread(awaySpread)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(points => {
                                                const isSelected = selectedPick?.points === points && selectedPick?.team === 'away';
                                                const isAvailable = availablePoints.includes(points) || isSelected;
                                                
                                                return (
                                                    <button
                                                        key={points}
                                                        onClick={() => handleTeamSelection(game.id, points, 'away', awaySpread)}
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
                                            <div className="font-bold text-lg text-red-600">{formatSpread(-homeSpread)}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(points => {
                                                const isSelected = selectedPick?.points === points && selectedPick?.team === 'home';
                                                const isAvailable = availablePoints.includes(points) || isSelected;
                                                
                                                return (
                                                    <button
                                                        key={points}
                                                        onClick={() => handleTeamSelection(game.id, points, 'home', homeSpread)}
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
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={Object.keys(selectedPicks).length === 0}
                >
                    Submit Picks ({Object.keys(selectedPicks).length})
                </button>
            </div>
        </div>
    );
}

export default WeeklyPicks;
