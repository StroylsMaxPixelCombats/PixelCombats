// Страница, созданная как делать, нож для режима 

- Обычный код, для ножа:
Player.Inventory.Melee.Value = true;
Player.Inventory.Melee.Value = false;
// Нож, по командам:
BlueTeam.Inventory.Melee.Value = true;
BlueTeam.Inventory.Melee.Value = false;
RedTeam.Inventory.Melee.Value = false;
RedTeam.Inventory.Melee.Value = true;
// Нож, по ID:
Player.("ID").Inventory.Melee.Value = true;
Player.("ID").Inventory.Melee.Value = false;
{"Melee"}
