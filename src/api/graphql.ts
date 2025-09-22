import { GraphQLClient } from 'graphql-request';
import { logout } from './index';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8080/query';

// Create GraphQL client with auth headers
export function createGraphQLClient() {
    const token = localStorage.getItem('token');
    
    return new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}

// Wrapper function to handle GraphQL requests with unauthorized error handling
export async function graphQLRequest<T>(query: string, variables?: any): Promise<T> {
    const client = createGraphQLClient();
    try {
        return await client.request<T>(query, variables);
    } catch (error: any) {
        // Check if it's an unauthorized error
        if (error?.response?.status === 401 || error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
            logout();
            window.location.href = '/';
        }
        throw error;
    }
}

// GraphQL Queries
export const GET_LEAGUE_SEASONS_BY_ID = `
  query GetLeagueSeasonsById($leagueID: ID!) {
    GetLeagueSeasonsById(leagueID: $leagueID) {
      id
      year_start
      year_end
      sport
    }
  }
`;

export const GET_WEEKLY_NFL_GAME_SPREADS = `
  query {
    GetWeeklyNflGameSpreads {
      homeTeam {
        name
        spread
      }
      awayTeam {
        name
        spread
      }
      commenceTime
      isSelectable
      oddsGameId
    }
  }
`;

export const CREATE_GAME_PICKS = `
  mutation CreateGamePicks($input: [NewGamePickInput!]!) {
    CreateGamePicks(input: $input) {
      id
      season_id
      week_id
      selected_team_name
      opponent_team_name
      spread_line
      spread_result
      points_assigned
      oddsGameId
    }
  }
`;

export const SEASON_LEADERBOARD = `
  query seasonLeaderboard($seasonId: ID!) {
    seasonLeaderboard(seasonId: $seasonId) {
      entries {
        rank
        username
        points
        isCurrentUser
        winningPicks
        winRate
      }
    }
  }
`;

export const MY_SEASON_PICKS = `
  query mySeasonPicks($seasonId: ID!) {
    mySeasonPicks(seasonId: $seasonId) {
      currentWeek
      picks {
        id
        gameId
        homeTeam
        awayTeam
        selectedTeam
        spread
        points
        result
      }
    }
  }
`;

export const SEASON_LEAGUE_PICKS = `
  query seasonLeaguePicks($seasonId: ID!) {
    seasonLeaguePicks(seasonId: $seasonId) {
      currentWeek
      userPicks {
        username
        picks {
          id
          gameId
          homeTeam
          awayTeam
          selectedTeam
          spread
          points
          result
        }
      }
    }
  }
`;

export const GET_CURRENT_SEASON_WEEK = `
  query getCurrentSeasonWeek($seasonId: ID!) {
    getCurrentSeasonWeek(seasonId: $seasonId) {
      weekId
      weekNumber
    }
  }
`;

// TypeScript interfaces for GraphQL responses
export interface Season {
    id: string;
    year_start: number;
    year_end: number;
    sport: string;
}

export interface Team {
    name: string;
    spread: number;
}

export interface WeeklyGame {
    homeTeam: Team;
    awayTeam: Team;
    commenceTime: string;
    isSelectable: boolean;
    oddsGameId: string;
}

export interface GamePick {
    id: string;
    season_id: string;
    week_id: string;
    selected_team_name: string;
    opponent_team_name: string;
    spread_line: number;
    spread_result: number;
    points_assigned: number;
}

export interface NewGamePickInput {
    season_id: string;
    week_id: string;
    selected_team_name: string;
    opponent_team_name: string;
    spread_line: number; // int32 in backend
    spread_result: number;    // int32 in backend
    points_assigned: number;  // int32 in backend
    odds_game_id: string;
}

// TODO: Update this interface when backend GraphQL schema is updated to include new fields:
// userID, firstName, lastName, email, totalPoints, totalPicks, winningPicks, winRate
export interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
    isCurrentUser: boolean;
    winningPicks: number;
    winRate: number;
}

export interface SeasonLeaderboard {
    entries: LeaderboardEntry[];
}

export type PickResult = 'WIN' | 'LOSS' | 'PENDING';

export interface Pick {
    id: string;
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    selectedTeam: string;
    spread: number;
    points: number;
    result?: PickResult;
}

export interface UserSeasonPicks {
    currentWeek: number;
    picks: Pick[];
}

export interface UserPicks {
    username: string;
    picks: Pick[];
}

export interface SeasonLeaguePicks {
    currentWeek: number;
    userPicks: UserPicks[];
}

export interface SeasonWeek {
    weekId: string;
    weekNumber: number;
}

// GraphQL API functions
export async function getLeagueSeasons(leagueId: string): Promise<Season[]> {
    const response = await graphQLRequest<{ GetLeagueSeasonsById: Season[] }>(
        GET_LEAGUE_SEASONS_BY_ID,
        { leagueID: leagueId }
    );
    return response.GetLeagueSeasonsById;
}

export async function getWeeklyGames(): Promise<WeeklyGame[]> {
    const response = await graphQLRequest<{ GetWeeklyNflGameSpreads: WeeklyGame[] }>(
        GET_WEEKLY_NFL_GAME_SPREADS
    );
    return response.GetWeeklyNflGameSpreads;
}

export async function createGamePicks(input: NewGamePickInput[]): Promise<GamePick[]> {
    const response = await graphQLRequest<{ CreateGamePicks: GamePick[] }>(
        CREATE_GAME_PICKS,
        { input }
    );
    return response.CreateGamePicks;
}

// Keep the singular version for backward compatibility
export async function createGamePick(input: NewGamePickInput): Promise<GamePick> {
    const picks = await createGamePicks([input]);
    return picks[0];
}

export async function getSeasonLeaderboard(seasonId: string): Promise<SeasonLeaderboard> {
    const response = await graphQLRequest<{ seasonLeaderboard: SeasonLeaderboard }>(
        SEASON_LEADERBOARD,
        { seasonId }
    );
    return response.seasonLeaderboard;
}

export async function getMySeasonPicks(seasonId: string): Promise<UserSeasonPicks> {
    const response = await graphQLRequest<{ mySeasonPicks: UserSeasonPicks }>(
        MY_SEASON_PICKS,
        { seasonId }
    );
    return response.mySeasonPicks;
}

export async function getSeasonLeaguePicks(seasonId: string): Promise<SeasonLeaguePicks> {
    const response = await graphQLRequest<{ seasonLeaguePicks: SeasonLeaguePicks }>(
        SEASON_LEAGUE_PICKS,
        { seasonId }
    );
    return response.seasonLeaguePicks;
}

export async function getCurrentSeasonWeek(seasonId: string): Promise<SeasonWeek> {
    const response = await graphQLRequest<{ getCurrentSeasonWeek: SeasonWeek }>(
        GET_CURRENT_SEASON_WEEK,
        { seasonId }
    );
    return response.getCurrentSeasonWeek;
}