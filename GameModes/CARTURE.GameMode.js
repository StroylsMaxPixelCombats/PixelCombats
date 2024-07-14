//var System = importNamespace('System');
import { DisplayValueHeader, Color } from 'pixel_combats
import { Game, GameMode, Inventory, Spawns, LeaderBoard, Properties, Damage, BreackGraph, Teams, Ui, AreaPlayerTriggerService, AreaViewService } from 'pixel_combats/room';

// Константы
var WaitingPlayersTime = 10;
var BuildBaseTime = 60;
var GameModeTime = 300;
var DefPoints = GameModeTime * 0.2;
var EndOfMatchTime = 10;
var DefPointsMaxCount = 30;
var DefTimerTickInderval = 1;
var SavePointsCount = 10;
var RepairPointsBySecond = 0.5;
var CapturePoints = 10;		// Сколько очков нужно, для захвата
var MaxCapturePoints = 15;	// Сколько макс, очков
var RedCaptureW = 1;		// Вес красных при захвате, спавна
var BlueCaptureW = 2;		// Вес синих при захвате, спавна
var CaptureRestoreW = 1;	// Сколько очков отнимается, если нет красных в зоне для, захвата
var UnCapturedColor = new Color(1, 1, 1, 1);            // Цвет, свободной зоны
var FakeCapturedColor = new Color(1, 1, 1, 1); // К какому цвету стремится зона, при её захвате
var CapturedColor = new Color(1, 0, 0, 0);          // Цвет захватченой зоны, красными
var ProtectiveZonaColor = new Color(0, 0, 1, 0);           // Цвет зоны, защиты
var MaxSpawnsByArea = 25;	// Макс спавнов, на зону

// Константы, имён
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";
var DefAreaTag = "def";
var CaptureAreaTag = "capture";
var HoldPositionHint = "GameModeHint/HoldPosition";
var RunToBliePointHint = "GameModeHint/RunToBliePoint";
var DefBlueAreaHint = "GameModeHint/DefBlueArea";
var DefThisAreaHint = "GameModeHint/DefThisArea";
var WaitingForBlueBuildHint = "GameModeHint/WaitingForBlueBuild";
var ChangeTeamHint = "GameModeHint/ChangeTeam";
var YourAreaIsCapturing = "GameModeHint/YourAreaIsCapturing";
var PrepareToDefBlueArea = "GameModeHint/PrepareToDefBlueArea";

// Постоянные, переменные
var mainTimer = Timers.GetContext().Get("Main");
var defTickTimer = Timers.getContext().Get("DefTimer");
var stateProp = Properties.GetContext().Get("State");
var defAreas = AreaService.GetByTag(DefAreaTag);
var captureAreas = AreaService.GetByTag(CaptureAreaTag);
var captureTriggers = [];
var captureViews = [];
var captureProperties = [];
var capturedAreaIndexProp = Properties.GetContext().Get("RedCaptiredIndex");

// Задаём цвет всем зонам, для захвата
Map.OnLoad.Add(function() {
	InitializeDefAreas();
});

function InitializeDefAreas() {
	defAreas = AreaService.GetByTag(DefAreaTag);
	captureAreas = AreaService.GetByTag(CaptureAreaTag);
	// Ограничитель
	if (captureAreas == null) return;
	if (captureAreas.length == 0) return;
	captureTriggers = [];
	captureViews = [];
	captureProperties = [];

	// Сортировка, зон
	captureAreas.sort(function(a, b) {
		if (a.Name > b.Name) return 1;
		if (a.Name < b.Name) return -1;
		return 0;
	});

	// Инициализация, переменных
	for (var i = 0; i < captureAreas.length; ++i) {
		// Создаём, визуализатор
		var view = AreaViewService.GetContext().Get(captureAreas[i].Name + "View");
		captureViews.push(view);
		// Создаём, триггер
		var trigger = AreaPlayerTriggerService.Get(captureAreas[i].Name + "Trigger");
		captureTriggers.push(trigger);
		// Создаём свойство, для захвата
		var prop = Properties.GetContext().Get(captureAreas[i].Name + "Property");
		prop.OnValue.Add(CapturePropOnValue);
		captureProperties.push(prop);
	}
}
InitializeDefAreas();
//function LogTrigger(player, trigger) {
//	log.debug("вошли в " + trigger);
//}
function CapturePropOnValue(prop) {
	// Берём индекс, зоны
	var index = -1;
	for (var i = 0; i < captureProperties.length; ++i)
		if (captureProperties[i] == prop) {
			index = i;
			break;
		}
	// Отмачаем зону, захваченой/незахваченой
	if (prop.Value >= CapturePoints) CaptureArea(index);
	else {
		// Красим в фейковую, закраску
		var d = prop.Value / MaxCapturePoints;
		if (index >= 0) {
			captureViews[index].Color = {
				r: (FakeCapturedColor.r - UnCapturedColor.r) * d + UnCapturedColor.r,
				g: (FakeCapturedColor.g - UnCapturedColor.g) * d + UnCapturedColor.g,
				b: (FakeCapturedColor.b - UnCapturedColor.b) * d + UnCapturedColor.b
			};
		}
		// Снятие, захвата
		UnCaptureArea(index);
	}
	// Задаём индекс захваченой зоны, красными
	SetSpawnIndex();
}

// Отмечает зону захваченной, красными
function CaptureArea(index) {
	if (index < 0 || index >= captureAreas.length) return;
	captureViews[index].Color = CapturedColor;
	if (index < captureProperties.length - 1) 
		captureViews[index + 1].Enable = true;
}
// Отмечаем зону не захваченой, красными
function UnCaptureArea(index) {
	if (index < 0 || index >= captureAreas.length) return;
	//captureViews[index].Color = UnCapturedColor
	if (index < captureProperties.length - 1 && captureProperties[index + 1].Value < CapturePoints) 
		captureViews[index + 1].Enable = false;
	if (index > 0 && captureProperties[index - 1].Value < CapturePoints) 
		captureViews[index].Enable = false;
}
// Задаём или снимаем спавнпоинты, захваченой области
function SetSpawnIndex() {
	// Поиск макс захваченной, области
	var maxIndex = -1;
	for (var i = 0; i < captureProperties.length; ++i) {
		if (captureProperties[i].Value >= CapturePoints)
			maxIndex = i;
	}
	capturedAreaIndexProp.Value = maxIndex;
}
// При смене индекса, захвата
capturedAreaIndexProp.OnValue.Add(function(prop) {
	var index = prop.Value;
	var spawns = Spawns.GetContext(redTeam);
	// Очистка, спавнов
	spawns.CustomSpawnPoints.Clear();
	// Если нет захвата, то сброс спавнов
	if (index < 0 || index >= captureAreas.length) return;
	// Задаём, спавны
	var area = captureAreas[index];
	var iter = area.Ranges.GetEnumerator();
	iter.MoveNext();
	var range = iter.Current;
	// Определяем, куда смотреть спавнам
	var lookPoint = {};
	if (index < captureAreas.length - 1) lookPoint = captureAreas[index + 1].Ranges.GetAveragePosition();
	else {
		if (defAreas.length > 0) 
			lookPoint = defAreas[0].Ranges.GetAveragePosition();
	}

	//log.debug("range=" + range);
	var spawnsCount = 0;
	for (var x = range.Start.x; x < range.End.x; x += 2)
		for (var z = range.Start.z; z < range.End.z; z += 2) {
			spawns.CustomSpawnPoints.Add(x, range.Start.y, z, Spawns.GetSpawnRotation(x, z, lookPoint.x, lookPoint.z));
			++spawnsCount;
			if (spawnsCount > MaxSpawnsByArea) return;
		}
});

// Проверка, валидности
//if (defAreas.length == 0) Validate.ReportInvalid("GameMode/Validation/NeedDefTaggedArea");
//else Validate.ReportValid();

// Применяем параметры, создания комнаты
Damage.FriendlyFire = GameMode.Parameters.GetBool("FriendlyFire");
Map.Rotation = GameMode.Parameters.GetBool("MapRotation");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");

// Создаём, визуализацию зон защиты
var defView = AreaViewService.GetContext().Get("DefView");
defView.color = ProtectiveZonaColor;
defView.Tags = [ DefAreaTag ];
defView.Enable = true;

// Создаём триггер, зон защиты
var defTrigger = AreaPlayerTriggerService.Get("DefTrigger");
defTrigger.Tags = [DefAreaTag];
defTrigger.OnEnter.Add(function(player) {
	if (player.Team == blueTeam) {
		player.Ui.Hint.Value = DefThisAreaHint;
		return;
	}
	if (player.Team == redTeam) {
		if (stateProp.Value == GameStateValue)
			player.Ui.Hint.Value = HoldPositionHint;
		else
			player.Ui.Hint.Reset();
		return;
	}
});
defTrigger.OnExit.Add(function(player) {
	player.Ui.Hint.Reset();
});
defTrigger.Enable = true;
// Задаём обработчик, таймера триггера
defTickTimer.OnTimer.Add(function(timer) {
	DefTriggerUpdate();
	CaptureTriggersUpdate();
});
function DefTriggerUpdate() {
	// Ограничитель игрового, режима
	if (stateProp.Value != GameStateValue) return;
	// Поиск количества синих, и красных в триггере
	var blueCount = 0;
	var redCount = 0;
	players = defTrigger.GetPlayers();
	for (var i = 0; i < players.length; ++i) {
		var p = players[i];
		if (p.Team == blueTeam) ++blueCount;
		if (p.Team == redTeam) ++redCount;
	}
	// Если красных нет в зоне, то восстанавливаются очки
	if (redCount == 0) {
		// Восстанавливаем очки, до несгораемой суммы
		if (blueTeam.Properties.Get("Deaths").Value % SavePointsCount != 0)
			blueTeam.Properties.Get("Deaths").Value += RepairPointsBySecond;
		// Синим идет подсказка, об обороне зоны
		if (stateProp.Value == GameStateValue)
			blueTeam.Ui.Hint.Value = DefBlueAreaHint;
		return;
	}
	// Если есть хоть один красный в зоне защиты, то очки отнимаются очки 
	blueTeam.Properties.Get("Deaths").Value -= redCount;
	// Синим идет подсказка, что зону захватывают
	if (stateProp.Value == GameStateValue)
		blueTeam.Ui.Hint.Value = YourAreaIsCapturing;
}
// Обновление зон, захвата
function CaptureTriggersUpdate() {
	// Ограничитель игрового, режима
	if (stateProp.Value != GameStateValue) return;
	// Ограничитель
	if (captureTriggers == null) return;
	if (captureTriggers.length == 0) return;
	// Обновление
	for (var i = 0; i < captureTriggers.length; ++i) {
		// Берём, триггер
		var trigger = captureTriggers[i];
		// Поиск количества синих и красных, в триггере
		var blueCount = 0;
		var redCount = 0;
		players = trigger.GetPlayers();
		for (var j = 0; j < players.length; ++j) {
			var p = players[j];
			if (p.Team == blueTeam) ++blueCount;
			if (p.Team == redTeam) ++redCount;
		}
		// Берём свойство, захвата
		var index = -1;
		for (var i = 0; i < captureTriggers.length; ++i)
			if (captureTriggers[i] == trigger) {
				index = i;
				break;
			}
		if (index < 0) continue;
		var value = captureProperties[index].Value;
		// Определяем, на сколько очков изменять зону
		// Очки за присутствие, синих
		var changePoints = - blueCount * BlueCaptureW;
		// Очки за присутствие, красных
		if (index == 0 || captureProperties[index - 1].Value >= CapturePoints)
			changePoints += redCount * RedCaptureW;
		// Спад очков захвата, если нет красных
		if (redCount == 0 && value < CapturePoints) changePoints -= CaptureRestoreW;
		// Ограничители
		if (changePoints == 0) continue;
		var newValue = value + changePoints;
		if (newValue > MaxCapturePoints) newValue = MaxCapturePoints;
		if (newValue < 0) newValue = 0;
		// Изменяем очки захвата, зоны
		captureProperties[index].Value = newValue;
	}
}
// Блок игрока, всегда усилен
BreackGraph.PlayerBlockBoost = true;

// Параметры, игры
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// Создаём, команды
Teams.Add("Blue", "Teams/Blue", new Color(0, 0, 1, 0));
Teams.Add("Red", "Teams/Red", new Color(1, 0, 0, 0));
var blueTeam = Teams.Get("Blue");
var redTeam = Teams.Get("Red");
blueTeam.Spawns.SpawnPointsGroups.Add(1);
redTeam.Spawns.SpawnPointsGroups.Add(2);
blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
redTeam.Build.BlocksSet.Value = BuildBlocksSet.Red;

// Делаем спавн, по 5 секунд
Spawns.GetContext().RespawnTime.Value = 5;

// Задаём макс очков, синей команды
//var maxDeaths = Players.MaxCount * 5;
blueTeam.Properties.Get("Deaths").Value = DefPoints;
//redTeam.Properties.Get("Deaths").Value = maxDeaths;
// Задаём, что выводить в лидербордах
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
// Вес игрока, в лидерборде
LeaderBoard.PlayersWeightGetter.Set(function(player) {
	return player.Properties.Get("Kills").Value;
});

// Задаём, что выводить вверху
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };

// Разрешаем вход, в команды
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// Спавн по входу, в команду
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// Делаем игроков неуязвимыми, после спавна
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(player){
	player.Properties.Immortality.Value=true;
	timer=player.Timers.Get(immortalityTimerName).Restart(7);
});
Timers.OnPlayerTimer.Add(function(timer){
	if(timer.Id!=immortalityTimerName) return;
	timer.Player.Properties.Immortality.Value=false;
});
// Если в команде количество смертей занулилось, то завершаем игру
Properties.OnTeamProperty.Add(function(context, value) {
	if (context.Team != blueTeam) return;
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) RedWin();
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
		BlueWin();
		break;
	case EndOfMatchStateValue:
		RestartGame();
		break;
	}
});

// Задаём, первое игровое состояние
SetWaitingMode();

// Состояния, игры
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "ОЖИДАНИЕ, ИГРОКОВ...";
	Spawns.GetContext().enable = false;
	mainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	// Инициализация, режима
	for (var i = 0; i < captureAreas.length; ++i) {
		// Визуализатор
		var view = captureViews[i];
		view.Area = captureAreas[i];
		view.Color = UnCapturedColor;
		view.Enable = i == 0;
		// Триггер
		var trigger = captureTriggers[i];
		trigger.Area = captureAreas[i];
		trigger.Enable = true;
		//trigger.OnEnter.Add(LogTrigger);
		// Свойство, для захвата
		var prop = captureProperties[i];
		prop.Value = 0;
	}

	stateProp.Value = BuildModeStateValue;
	Ui.GetContext().Hint.Value = "ChangeTeamHint";
	blueTeam.Ui.Hint.Value = "PrepareToDefBlueArea";
	redTeam.Ui.Hint.Value = "WaitingForBlueBuildHint";

	blueTeam.Inventory.Main.Value = false;
	blueTeam.Inventory.Secondary.Value = false;
	blueTeam.Inventory.Melee.Value = true;
	blueTeam.Inventory.Explosive.Value = false;
	blueTeam.Inventory.Build.Value = true;
	blueTeam.Inventory.BuildInfinity.Value = true;

	redTeam.Inventory.Main.Value = false;
	redTeam.Inventory.Secondary.Value = false;
	redTeam.Inventory.Melee.Value = false;
	redTeam.Inventory.Explosive.Value = false;
	redTeam.Inventory.Build.Value = false;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	blueTeam.Ui.Hint.Value = "!Защищайте, синию зону!";
	redTeam.Ui.Hint.Value = "!Захватите, синию зону!";

	blueTeam.Inventory.Main.Value = true;
	blueTeam.Inventory.Secondary.Value = true;
	blueTeam.Inventory.Melee.Value = true;
	blueTeam.Inventory.Explosive.Value = true;
	blueTeam.Inventory.Build.Value = true;

	redTeam.Inventory.Main.Value = true;
	redTeam.Inventory.Secondary.Value = true;
	redTeam.Inventory.Melee.Value = true;
	redTeam.Inventory.Explosive.Value = true;
	redTeam.Inventory.Build.Value = true;

	mainTimer.Restart(GameModeTime);
	defTickTimer.RestartLoop(DefTimerTickInderval);
	Spawns.GetContext().Spawn();
	SpawnTeams();
}
function BlueWin()
{
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "!Конец, МАТЧА!";

	var Spawns = Spawns.GetContext();
	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();
	Game.GameOver(blueTeam);
	mainTimer.Restart(EndOfMatchTime);
}
function RedWin()
{
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "!ЗАХВАТ, ЗОНЫ!";

	var Spawns = Spawns.GetContext();
	Spawns.GetContext().Enable = false;
	Spawns.GetContext().Despawn();
	Game.GameOver(redTeam);
	mainTimer.Restart(EndOfMatchTime);
}
function RestartGame() {
	Game.RestartGame();
}

function SpawnTeams() {
	var Spawns = Teams.Spawn();
    Spawns.GetContext().Spawn();
	}
