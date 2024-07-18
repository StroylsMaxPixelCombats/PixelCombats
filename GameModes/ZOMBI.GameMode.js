//var System = importNamespace('System');
import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, Players, Inventory, LeaderBoard, BuildBlocksSet, Teams, Damage, BreackGraph, Ui, Properties, GameMode, Spawns, Timers, TeamsBalancer, AreaPlayerTriggerService } from 'pixel_combats/room';
import * as default_timer from './default_timer.js';

// Константы
var WaitingPlayersTime = 20;
var BuildBaseTime = 20;
var GameModeTime = default_timer.game_mode_length_seconds();
var EndOfMatchTime = 15;

// Константы, имён
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";

// Постоянные, переменны
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");

// Применяем параметры создания, комнаты
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// Блок игрока всегда, усилен
BreackGraph.PlayerBlockBoost = true;

// Параметры игры
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// Создаём команды
Teams.Add("Blue", "<b>ЛЮДИ</b>", new Color(0, 0, 1, 0));
Teams.Add("Red", "<b>ЗОМБИ</b>", new Color(0, 1, 0, 0));
var BlueTeam = Teams.Get("Blue");
var RedTeam = Teams.Get("Red");
BlueTeam.Spawns.SpawnPointsGroups.Add(1);
RedTeam.Spawns.SpawnPointsGroups.Add(2);
RedTeam.ContextedProperties.SkinType.Value = 1;
RedTeam.ContextedProperties.InventoryType.Value = true;
BlueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RedTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;
// Задаём макс смертей, команд
var maxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = maxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = maxDeaths;
// Задаём что выводить, в лидербордах
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "У",
		ShortDisplayName: "У"
	},
	{
		Value: "Deaths",
		DisplayName: "С",
		ShortDisplayName: "С"
	},
	{
		Value: "Spawns",
		DisplayName: "С",
		ShortDisplayName: "С"
	},
	{
		Value: "Scores",
		DisplayName: "О",
		ShortDisplayName: "О"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "С",
	ShortDisplayName: "С"
};
// У людей, только 1 жизнь
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Kills" };

var weaponTrigger = AreaPlayerTriggerService.Get("WeaponTrigger");
weaponTrigger.Tags = [WeaponAreasTag];
weaponTrigger.Enable = true;
weaponTrigger.OnEnter.Add(function (player) {
	if (player.Inventory.Melee.Value)
  {
    player.Ui.Hint.Value = "!ВЫ, ЗОМБИ!";
  }
  else
  {
    myWpTimer.Restart(180);
    weaponTrigger.Enable = false;
    spawnsView.Enable = false;
    player.Inventory.Main.Value = false;
    player.Inventory.Main.Value = true;
  }
});

// Вес команды, в лидерборде
LeaderBoard.TeamWeightGetter.Set(function(team) {
	return team.Properties.Get("Deaths").Value;
});
// Вес игрока, в лидерборде
LeaderBoard.PlayersWeightGetter.Set(function(player) {
	return player.Properties.Get("Kills").Value;
});

// Задаём, что выводить вверху
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// Разрешаем вход в команды, по запросу
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// Спавн, по входу в команду
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// Делаем игроков неуязвимыми, после спавна
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(player){
	Player.Properties.Immortality.Value=true;
	timer=Player.Timers.Get(immortalityTimerName).Restart(7);
});
Timers.OnPlayerTimer.Add(function(timer){
	if(timer.Id!=immortalityTimerName) return;
	timer.Player.Properties.Immortality.Value=false;
});

// После каждой смерти игрока, отнимаем одну смерть в команде
Properties.OnPlayerProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (context.Player.Team == null) return;
	context.Player.Team.Properties.Get("Deaths").Value--;
});
// Если в команде количество смертей занулилось, то завершаем игру
Properties.OnTeamProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) SetEndOfMatchMode();
});

// Счётчик, спавнов
Spawns.OnSpawn.Add(function(player) {
	++player.Properties.Spawns.Value;
});
// Счётчик, смертей
Damage.OnDeath.Add(function(player) {
	++player.Properties.Deaths.Value;
});
// Счётчик, убийств
Damage.OnKill.Add(function(player, killed) {
	if (killed.Team != null && killed.Team != player.Team) {
		++player.Properties.Kills.Value;
		player.Properties.Scores.Value += 100;
	}
});

// Настройка переключения, режимов
mainTimer.OnTimer.Add(function() {
	switch (stateProp.Value) {
	case WaitingStateValue:
		SetBuildMode();
		break;
	case BuildModeStateValue:
		SetGameMode();
		break;
	case GameStateValue:
		SetEndOfMatchMode();
		break;
	case EndOfMatchStateValue:
		RestartGame();
		break;
	}
});

//  Задаём первое игровое, состояние
SetWaitingMode();

// Состояние игры
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Ожидание, игроков...";
	Spawns.GetContext().Enable = false;
	mainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	stateProp.Value = BuildModeStateValue;
	BlueTeam.Ui.Hint.Value = "!Застраивайте, базу!";
  RedTeam.Ui.Hint.Value = "!Ждём, когда люди: ПОДГОТОВЯТСЯ!";
	var Inventory = Inventory.GetContext();
	Inventory.Main.Value = false;
	Inventory.Secondary.Value = false;
	Inventory.Melee.Value = true;
	Inventory.Explosive.Value = false;
	Inventory.Build.Value = true;  
} else {
  Inventory.Main.Value = false;
	Inventory.Secondary.Value = false;
	Inventory.Melee.Value = false;
	Inventory.Explosive.Value = false;
	Inventory.Build.Value = false;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	BlueTeam.Ui.Hint.Value = "!Защищайтесь, от ЗОМБИ!";
  RedTeam.Ui.Hint.Value = "!Атакуйте, людей";

	var Inventory = Inventory.GetContext();
		Inventory.Main.Value = true;
		Inventory.Secondary.Value = true;
		Inventory.Melee.Value = true;
		Inventory.Explosive.Value = true;
		Inventory.Build.Value = true;
	} else {
		Inventory.Main.Value = false;
		Inventory.Secondary.Value = false;
		Inventory.Melee.Value = true;
		Inventory.Explosive.Value = true;
		Inventory.Build.Value = true;
	}

	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Spawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	stateProp.Value = EndOfMatchStateValue;
	Spawns.GetContext().Enable = true;
	Spawns.GetContext().Despawn();
	Ui.GetContext().Hint.Value = "!Время, ВЫШЛО!";
	Game.GameOver(LeaderBoard.GetTeams());
	mainTimer.Restart(EndOfMatchTime);
  
  var Inventory = Inventory.GetContext();
  Inventory.Main.Value = false;
	Inventory.Secondary.Value = false;
	Inventory.Melee.Value = false;
	Inventory.Explosive.Value = false;
	Inventory.Build.Value = false;
} else {
  Inventory.Main.Value = false;
	Inventory.Secondary.Value = false;
	Inventory.Melee.Value = false;
	Inventory.Explosive.Value = false;
	Inventory.Build.Value = false;

}
function RestartGame() {
  Game.RestartGame();
}

function SpawnTeams() {
var Spawns = Teams.Spawn();
  Spawns.GetContext().Spawn();
    }

