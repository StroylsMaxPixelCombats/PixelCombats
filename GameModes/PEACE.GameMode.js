//var System = importNamespace(system);
import { Color } from 'pixel_combats/basic';
import { GameMode, Inventory, Build, BuildBlocksSet, Properties, Teams, Damage, BreackGraph, Spawns, Ui } from 'pixel_combats/room'; 

// Игровые, параметры 
Damage.GetContext().DamageOut.Value = GameMode.Parameters.GetBool("Damage");
BreackGraph.OnlyPlayerBlocksDmg = GameMode.Parameters.GetBool("PartialDesruction");
BreackGraph.WeakBlocks = GameMode.Parameters.GetBool("LoosenBlocks");
Build.GetContext().FloodFill.Value = GameMode.Parameters.GetBool("FloodFill");
Build.GetContext().FillQuad.Value = GameMode.Parameters.GetBool("FillQuad");
Build.GetContext().RemoveQuad.Value = GameMode.Parameters.GetBool("RemoveQuad");
Build.GetContext().FlyEnable.Value = GameMode.Parameters.GetBool("Fly");

// Делаем возможным ломать, все блоки 
BreackGraph.BreackAll = true;
// Показываем, количество каводов
Ui.GetContext().QuadsCount.Value = true;
// Строительные, опции 
Build.GetContext().Pipette.Value = true;
Build.GetContext().BalkLenChange.Value = true;
Build.GetContext().SetSkyEnable.Value = true;
Build.GetContext().GenMapEnable.Value = true;
Build.GetContext().ChangeCameraPointsEnable.Value = true;
Build.GetContext().QuadChangeEnable.Value = true;
Build.GetContext().BuildModeEnable.Value = true;
Build.GetContext().CollapseChangeEnable.Value = true;
Build.GetContext().RenameMapEnable.Value = true;
Build.GetContext().ChangeMapAuthorsEnable.Value = true;
Build.GetContext().LoadMapEnable.Value = true;
Build.GetContext().ChangeSpawnsEnable.Value = true;
// Настройка, игрового режима 
Properties.GetContext().GameModeName.Value = "GameModes/Peace";
// Создаём, команды
if (GameMode.Parameters.GetBo("TeamRed")) {
Teams.Add("Red", "Teams/Red", new Color(1, 0, 0, 0));
Teams.Get("Red").Spawns.SpawnPointsGroups.Add(1);
if (GameMode.Parameters.GetBool("TeamBlue")) {
Teams.Add("Blue", "Teams/Blue", new Color(0, 0, 1, 0));
Teams.Get("Blue").Spawns.SpawnPointsGroups.Add(2);
	        if (GameMode.Parameters.GetBool("BlueHasNothing")){
		Teams.Get("Blue").Inventory.Main.Value = false;
		Teams.Get("Blue").Inventory.Secondary.Value = false;
		Teams.Get("Blue").Inventory.Melee.Value = false;
		Teams.Get("Blue").Inventory.Explosive.Value = false;
		Teams.Get("Blue").Inventory.Build.Value = false;
	}
   }
}
	
// Разрешаем вход, в команды
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// Разрешаем спавнися, после входа в команду
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// Задаём, подсказку 
Ui.GetContext().Hint.Value = "!Мирный, режим!";

// Задаём, инвентарь игрокам 
var Inventory = Inventory.GetContext();
Inventory.Main.Value = false;
Inventory.Secondary.Value = false;
Inventory.Melee.Value = true;
Inventory.Explosive.Value = false;
Inventory.Build.Value = true;
Inventory.BuildInfinity.Value = true;

// Задаём, чистые блоки игрокам 
Build.GetContext().BlocksSet.Value = BuildBlocksSet.AllClear;
// Задаём, моментальный спавн игрокам 
Spawns.GetContext().RespawnTime.Value = 0;
