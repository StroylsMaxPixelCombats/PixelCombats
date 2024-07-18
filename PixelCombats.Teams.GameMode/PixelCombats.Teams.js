// Библиотека, созданная как по КОМАНДАМ, для режима

//Новые, команды:
const  BlueTeam  =  Команды.create_Team_Blue ( ) ;​​
const  RedTeam  =  Teams.create_Team_Red ( ) ;​​
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue ;​​​​​​​​  
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red ;​​​​​​​​  
// Новые, лидерБорды:
LeaderBoard . PlayerLeaderBoardValues  ​​=  [
	new DisplayValueHeader ( KILLS_PROP_NAME ,  "Статистика/Убийства" ,  "Статистика/УбийстваShort" ) ,
	new DisplayValueHeader ( "Смерти" ,  "Статистика/Смерти" ,  "Статистика/СмертиКраткая" ) ,
	new DisplayValueHeader ( "Spawns" ,  "Statistics/Spawns" ,  "Statistics/SpawnsShort" ) ,
	new DisplayValueHeader ( SCORES_PROP_NAME ,  "Статистика/Результаты" ,  "Статистика/РезультатыКраткая информация" )
] ;
// Конст = var.GetContext();
[ "Const" ]  -  "Константа" ;
[ "Вар" ]  -  "Вар" ;


// Команды, в другом файле 
// Библиотека, созданная как КОМАНДЫ
import { Color } from 'pixel_combats/basic';
import { Teams } from 'pixel_combats/room';

export const RED_TEAM_NAME = "Red";
export const BLUE_TEAM_NAME = "Blue";
export const RED_TEAM_DISPLAY_NAME = "Teams/Red";
export const BLUE_TEAM_DISPLAY_NAME = "Teams/Blue";
export const BLUE_TEAM_SPAWN_POINTS_GROUP = 1;
export const RED_TEAM_SPAWN_POINTS_GROUP = 2;
export const BLUE_TEAM_COLOR = new Color(0, 0, 1, 0);
export const RED_TEAM_COLOR = new Color(1, 0, 0, 0);

export function create_team_blue() {
    Teams.Add(BLUE_TEAM_NAME, BLUE_TEAM_DISPLAY_NAME, BLUE_TEAM_COLOR);
    const team = Teams.Get(BLUE_TEAM_NAME);
    team.Spawns.SpawnPointsGroups.Add(BLUE_TEAM_SPAWN_POINTS_GROUP);
    return team;
}

export function create_team_red() {
    Teams.Add(RED_TEAM_NAME, RED_TEAM_DISPLAY_NAME, RED_TEAM_COLOR);
    const team = Teams.Get(RED_TEAM_NAME);
    team.Spawns.SpawnPointsGroups.Add(RED_TEAM_SPAWN_POINTS_GROUP);
    return team;
}
