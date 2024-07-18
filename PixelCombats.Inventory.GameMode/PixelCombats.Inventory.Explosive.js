// Страница, созданная как делать, гранаты для режима 

- Обычный код, для гранат:
Player.Inventory.Explosive.Value = true;
Player.Inventory.Explosive.Value = false;
// Основное оружие, по командам:
BlueTeam.Inventory.Explosive.Value = true;
BlueTeam.Inventory.Explosive.Value = false;
RedTeam.Inventory.Explosive.Value = false;
RedTeam.Inventory.Explosive.Value = true;
- Гранаты, по ID:
Player.("ID").Inventory.Explosive.Value = true;
Player.("ID").Inventory.Explosive.Value = false;
// Бесконечные патроны, на гранаты:
Player.Inventory.ExplosiveInfinity.Value = true;
Player.Inventory.ExplosiveInfinity.Value = false;
} else {
BlueTeam.Inventory.ExplosiveInfinity.Value = true;
BlueTeam.Inventory.ExplosiveInfinity.Value = false;
RedTeam.Inventory.ExplosiveInfinity.Value = false;
RedTeam.Inventory.ExplosiveInfinity.Value = true;
// Бесконечные патроны, на гранаты по ID:
Player.("ID").Inventory.ExplosiveInfinity.Value = true;
Player.("ID").Inventory.ExplosiveInfinity.Value = false;
{"Explosive"}
{"ExplosiveInfinity"};
