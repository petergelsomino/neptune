import { GraphQLClient } from 'graphql-request';

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
      spread_selection
      spread_result
      points_assigned
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
    spread_selection: number;
    spread_result: number;
    points_assigned: number;
}

export interface NewGamePickInput {
    season_id: string;
    week_id: string;
    selected_team_name: string;
    opponent_team_name: string;
    spread_selection: number; // int32 in backend
    spread_result: number;    // int32 in backend
    points_assigned: number;  // int32 in backend
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
    isCurrentUser: boolean;
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
    const client = createGraphQLClient();
    const response = await client.request<{ GetLeagueSeasonsById: Season[] }>(
        GET_LEAGUE_SEASONS_BY_ID,
        { leagueID: leagueId }
    );
    return response.GetLeagueSeasonsById;
}

export async function getWeeklyGames(): Promise<WeeklyGame[]> {
    const client = createGraphQLClient();
    const response = await client.request<{ GetWeeklyNflGameSpreads: WeeklyGame[] }>(
        GET_WEEKLY_NFL_GAME_SPREADS
    );
    return response.GetWeeklyNflGameSpreads;
}

export async function createGamePicks(input: NewGamePickInput[]): Promise<GamePick[]> {
    const client = createGraphQLClient();
    const response = await client.request<{ CreateGamePicks: GamePick[] }>(
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
    const client = createGraphQLClient();
    const response = await client.request<{ seasonLeaderboard: SeasonLeaderboard }>(
        SEASON_LEADERBOARD,
        { seasonId }
    );
    return response.seasonLeaderboard;
}

export async function getMySeasonPicks(seasonId: string): Promise<UserSeasonPicks> {
    const client = createGraphQLClient();
    const response = await client.request<{ mySeasonPicks: UserSeasonPicks }>(
        MY_SEASON_PICKS,
        { seasonId }
    );
    return response.mySeasonPicks;
}

export async function getSeasonLeaguePicks(seasonId: string): Promise<SeasonLeaguePicks> {
    const client = createGraphQLClient();
    const response = await client.request<{ seasonLeaguePicks: SeasonLeaguePicks }>(
        SEASON_LEAGUE_PICKS,
        { seasonId }
    );
    return response.seasonLeaguePicks;
}

export async function getCurrentSeasonWeek(seasonId: string): Promise<SeasonWeek> {
    const client = createGraphQLClient();
    const response = await client.request<{ getCurrentSeasonWeek: SeasonWeek }>(
        GET_CURRENT_SEASON_WEEK,
        { seasonId }
    );
    return response.getCurrentSeasonWeek;
}