// Библиотека, созданная как по КОМАНДАМ, для режима

-  Новые ,  команды :
const  BlueTeam  =  Команды.create_Team_Blue ( ) ;​​
const  RedTeam  =  Teams.create_Team_Red ( ) ;​​
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue ;​​​​​​​​  
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red ;​​​​​​​​  
// Новые, лидерБорды:
LeaderBoard . PlayerLeaderBoardValues  ​​=  [
	новый  DisplayValueHeader ( KILLS_PROP_NAME ,  "Статистика/Убийства" ,  "Статистика/УбийстваShort" ) ,
	новый  DisplayValueHeader ( "Смерти" ,  "Статистика/Смерти" ,  "Статистика/СмертиКраткая" ) ,
	новый  DisplayValueHeader ( "Spawns" ,  "Statistics/Spawns" ,  "Statistics/SpawnsShort" ) ,
	новый  DisplayValueHeader ( SCORES_PROP_NAME ,  "Статистика/Результаты" ,  "Статистика/РезультатыКраткая информация" )
] ;
// Конст = var.GetContext();
[ "Const" ]  -  "Константа" ;
[ "Вар" ]  -  "Вар" ;
