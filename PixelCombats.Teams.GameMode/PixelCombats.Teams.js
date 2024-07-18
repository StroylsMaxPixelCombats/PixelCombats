// Библиотека, созданная как по КОМАНДАМ, для режима 

- Новые, команды:
const BlueTeam = Teams.create_Team_Blue();
const RedTeam = Teams.create_Team_Red();
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;
// Новые, лидерБорды:
LeaderBoard.PlayerLeaderBoardValues = [
	new DisplayValueHeader(KILLS_PROP_NAME, "Statistics/Kills", "Statistics/KillsShort"),
	new DisplayValueHeader("Deaths", "Statistics/Deaths", "Statistics/DeathsShort"),
	new DisplayValueHeader("Spawns", "Statistics/Spawns", "Statistics/SpawnsShort"),
	new DisplayValueHeader(SCORES_PROP_NAME, "Statistics/Scores", "Statistics/ScoresShort")
];
// Const = var.GetContext();
["Const"] - "Константа";
["Var"] - "Вар";



 
