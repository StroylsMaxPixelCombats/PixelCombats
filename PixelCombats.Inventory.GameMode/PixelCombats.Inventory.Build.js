// Страница, созданная как делать, блоки для режима 

- Обычный код, для блоков:
Player.Inventory.Build.Value = true;
Player.Inventory.Build.Value = false;
// блоки, по командам:
BlueTeam.Inventory.Build.Value = true;
BlueTeam.Inventory.Build.Value = false;
RedTeam.Inventory.Build.Value = false;
RedTeam.Inventory.Build.Value = true;
- Блоки, по ID:
Player.("ID").Inventory.Build.Value = true;
Player.("ID").Inventory.Build.Value = false;
// Бесконечные патроны, на блоки:
Player.Inventory.BuildInfinity.Value = true;
Player.Inventory.BuildInfinity.Value = false;
} else {
BlueTeam.Inventory.BuildInfinity.Value = true;
BlueTeam.Inventory.BuildInfinity.Value = false;
RedTeam.Inventory.BuildInfinity.Value = false;
RedTeam.Inventory.BuildInfinity.Value = true;
// Бесконечные патроны, на блоки по ID:
Player.("ID").Inventory.BuildInfinity.Value = true;
Player.("ID").Inventory.BuildInfinity.Value = false;
{"Build"}
{"BuildInfinity"};
