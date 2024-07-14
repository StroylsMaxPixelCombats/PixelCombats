//var System = importNamespace('System');
import { DisplayValueHeader, Color } from 'pixel_combats/basic';
import { Game, GameMode, Properties, Teams, Damage, BreackGraph, Inventory, Ui, Spawns, LeaderBoard, AreaPlayerTriggerService, AreaViewService } from 'pixel_combats/room';

// Временные, константы
var EndOfMatchTime = 10;

// Константы, имён
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var EndAreaTag = "parcourend"; 	// Тэг зоны конца, паркура
var SpawnAreasTag = "spawn";	// Тэг зон промежуточных, спавнов
var EndTriggerPoints = 1000;	// Сколько дается очков, за завершение маршрута
var CurSpawnPropName = "CurSpawn"; // Свойство, отвечающее за индекс текущего спавна, 0 - дефолтный спавн
var ViewSpawnsParameterName = "ViewSpawns";	// Параметр создания комнаты, отвечающий за визуализацию, спавнов
var ViewEndParameterName = "ViewEnd";	// Параметр создания комнаты, отвечающий за визуализацию конца, маршрута
var MaxSpawnsByArea = 25;	// Макс спавнов, на зону
var LeaderBoardProp = "Leader"; // Свойство для, лидерборда

// Постоянные, переменные
var mainTimer = Timers.GetContext().Get("Main"); 		// Таймер конца, игры
var endAreas = AreaService.GetByTag(EndAreaTag);		// Зоны конца, игры
var SpawnAreas = AreaService.GetByTag(SpawnAreasTag);	// Зоны, спавнов
var stateProp = Properties.GetContext().Get("State");	// Свойство, состояния
var Inventory = Inventory.GetContext();					// Контекст, инвентаря
var BlueColor = new Color(0, 0, 1, 0);           // Цвет зоны, конца паркура
var WhiteColor = new Color(1, 1, 1, 1);                   // Цвет зоны, спавна паркура 

// Настройка, игрового режима 
Properties.GetContext().GameModeName.Value = "GameModes/Parcour";
// Параметры
BreackGraph.OnlyPlayerBlocksDmg.Value = true;
BreackGraph.WeakBlocks.Value = false;
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
Damage.GetContext().DamageOut.Value = false;
Damage.GetContext().FriendlyFire.Value = false;

// Запрет, инвентаря
Inventory.Main.Value = false;
Inventory.Secondary.Value = false;
Inventory.Melee.Value = false;
Inventory.Explosive.Value = false;
Inventory.Build.Value = false;

// Создаём, команду
Teams.Add("Blue", "Teams/Blue", new Color(0, 0, 1, 0));
var blueTeam = Teams.Get("Blue");
blueTeam.Spawns.SpawnPointsGroups.Add(1);
blueTeam.Spawns.RespawnTime.Value = 0;

// Задаём, подсказку
Ui.GetContext().Hint.Value = "!Пройдите паркур, первым!";

// Настраиваем игровые, состояния
stateProp.OnValue.Add(OnState);
function OnState() {
	switch (stateProp.Value) {
		case GameStateValue:
			var Spawns = Spawns.GetContext();
			Spawns.GetContext().Enable = true;
			break;
		case EndOfMatchStateValue:
			// Деспавн, зоны конца паркура
			var Spawns = Spawns.GetContext();
			Spawns.GetContext().Enable = false;
			Spawns.GetContext().Despawn();
			Game.GameOver(LeaderBoard.GetPlayers());
			mainTimer.Restart(EndOfMatchTime);
			// Говорим, кто победил 
			break;
	}
}

// Визуализируем конец, маршрута
if (GameMode.Parameters.GetBool(ViewEndParameterName)) {
	var endView = AreaViewService.GetContext().Get("EndView");
	endView.Color = BlueColor;
	endView.Tags = [EndAreaTag];
	endView.Enable = true;
}
// Визуализируем спавны, чикпоинтов
if (GameMode.Parameters.GetBool(ViewSpawnsParameterName)) {
	var SpawnsView = AreaViewService.GetContext().Get("SpawnsView");
	SpawnsView.Color = WhiteColor;
	SpawnsView.Tags = [SpawnAreasTag];
	SpawnsView.Enable = true;
}

// Настраиваем триггер, конца игры
var endTrigger = AreaPlayerTriggerService.Get("EndTrigger");
endTrigger.Tags = [EndAreaTag];
endTrigger.Enable = true;
endTrigger.OnEnter.Add(function (player) {
	endTrigger.Enable = false;
	player.Properties.Get(LeaderBoardProp).Value += 1000;
	stateProp.Value = EndOfMatchStateValue;
});
// Настраиваем триггер, спавнов
var SpawnTrigger = AreaPlayerTriggerService.Get("SpawnTrigger");
SpawnTrigger.Tags = [SpawnAreasTag];
SpawnTrigger.Enable = true;
SpawnTrigger.OnEnter.Add(function (player, area) {
	if (SpawnAreas == null || SpawnAreas.length == 0) InitializeMap(); // todo костыль изза бага (не всегда прогружает нормально)	
	if (SpawnAreas == null || SpawnAreas.length == 0) return;
	var prop = player.Properties.Get(CurSpawnPropName);
	var startIndex = 0;
	if (prop.Value != null) startIndex = prop.Value;
	for (var i = startIndex; i < SpawnAreas.length; ++i) {
		if (SpawnAreas[i] == area) {
			var prop = player.Properties.Get(CurSpawnPropName);
			if (prop.Value == null || i > prop.Value) {
				prop.Value = i;
				player.Properties.Get(LeaderBoardProp).Value += 1;
			}
			break;
		}
	}
});
// Настройка, конца таймера
mainTimer.OnTimer.Add(function () { Game.RestartGame(); });

// Создаём, лидерборд
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Deaths",
		DisplayName: "С",
		ShortDisplayName: "С"
	},
	{
		Value: LeaderBoardProp,
		DisplayName: "О",
		ShortDisplayName: "О"
	}
];
// сортировка команд
LeaderBoard.TeamLeaderBoardValue = {
	Value: LeaderBoardProp,
	DisplayName: "О",
	ShortDisplayName: "О"
};
// Сортировка игроков, по лидерборду
LeaderBoard.PlayersWeightGetter.Set(function (player) {
	return player.Properties.Get(LeaderBoardProp).Value;
});
// счётчик, смертей
Damage.OnDeath.Add(function (player) {
	++player.Properties.Deaths.Value;
});
// Разрешаем вход, в команду
Teams.OnRequestJoinTeam.Add(function (player, team) { team.Add(player); });
// Разрешаем спавн, по входу в команду
Teams.OnPlayerChangeTeam.Add(function (player) { player.Spawns.Spawn() });

// Счётчик, спавнов
Spawns.OnSpawn.Add(function (player) {
	++player.Properties.Spawns.Value;
});
// Инициализация всего что зависит, от карты
Map.OnLoad.Add(InitializeMap);
function InitializeMap() {
	endAreas = AreaService.GetByTag(EndAreaTag);
	spawnAreas = AreaService.GetByTag(SpawnAreasTag);
	//log.debug("spawnAreas.length=" + SpawnAreas.length);
	// Ограничитель
	if (SpawnAreas == null || SpawnAreas.length == 0) return;
	// Сортировка, всех зон
	SpawnAreas.sort(function (a, b) {
		if (a.Name > b.Name) return 1;
		if (a.Name < b.Name) return -1;
		return 0;
	});
}
InitializeMap();
// При смене свойства индекса спавна, задаём спавн
Properties.OnPlayerProperty.Add(function (context, prop) {
	if (prop.Name != CurSpawnPropName) return;
	//log.debug(context.Player + " spawn point is " + prop.Value);
	SetPlayerSpawn(context.Player, prop.Value);
});

function SetPlayerSpawn(player, index) {
	var Spawns = Spawns.GetContext(player);
	// Очистка, спавнов
	Spawns.CustomSpawnPoints.Clear();
	// Если нет захвата, то сброс спавнов
	if (index < 0 || index >= SpawnAreas.length) return;
	// Задаём, спавны
	var area = SpawnAreas[index];
	var iter = area.Ranges.GetEnumerator();
	iter.MoveNext();
	var range = iter.Current;
	// Определяем, куда смотреть спавнам
	var lookPoint = {};
	if (index < SpawnAreas.length - 1) lookPoint = SpawnAreas[index + 1].Ranges.GetAveragePosition();
	else {
		if (endAreas.length > 0)
			lookPoint = endAreas[0].Ranges.GetAveragePosition();
	}

	//log.debug("range=" + range);
	var SpawnsCount = 0;
	for (var x = range.Start.x; x < range.End.x; x += 2)
		for (var z = range.Start.z; z < range.End.z; z += 2) {
			Spawns.CustomSpawnPoints.Add(x, range.Start.y, z, Spawns.GetSpawnRotation(x, z, lookPoint.x, lookPoint.z));
			++SpawnsCount;
			if (SpawnsCount > MaxSpawnsByArea) return;
		}
}
// Запуск, игры 
stateProp.Value = GameStateValue;
