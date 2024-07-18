// Страница, созданная как делать, основное оружие для режима 

- Обычный код, для основного оружия:
Player.Inventory.Main.Value = true;
Player.Inventory.Main.Value = false;
// Основное оружие, по командам:
BlueTeam.Inventory.Main.Value = true;
BlueTeam.Inventory.Main.Value = false;
RedTeam.Inventory.Main.Value = false;
RedTeam.Inventory.Main.Value = true;
- Основное оружие, по ID:
Player.("ID").Inventory.Main.Value = true;
Player.("ID").Inventory.Main.Value = false;
// Бесконечные патроны, на основное оружие:
Player.Inventory.MainInfinity.Value = true;
Player.Inventory.MainInfinity.Value = false;
} else {
BlueTeam.Inventory.MainInfinity.Value = true;
BlueTeam.Inventory.MainInfinity.Value = false;
RedTeam.Inventory.MainInfinity.Value = false;
RedTeam.Inventory.MainInfinity.Value = true;
// Бесконечные патроны, на основное оружие по ID:
Player.("ID").Inventory.MainInfinity.Value = true;
Player.("ID").Inventory.MainInfinity.Value = false;
{"Main"}
{"MainInfinity"};
