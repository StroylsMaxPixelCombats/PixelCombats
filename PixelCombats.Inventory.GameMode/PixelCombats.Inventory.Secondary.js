// Страница, созданная как делать, пистолет для режима 

- Обычный код, для пистолета:
Player.Inventory.Secondary.Value = true;
Player.Inventory.Secondary.Value = false;
// Основное оружие, по командам:
BlueTeam.Inventory.Secondary.Value = true;
BlueTeam.Inventory.Secondary.Value = false;
RedTeam.Inventory.Secondary.Value = false;
RedTeam.Inventory.Secondary.Value = true;
- пестолет, по ID:
Player.("ID").Inventory.Secondary.Value = true;
Player.("ID").Inventory.Secondary.Value = false;
// Бесконечные патроны, на пистолет:
Player.Inventory.SecondaryInfinity.Value = true;
Player.Inventory.SecondaryInfinity.Value = false;
} else {
BlueTeam.Inventory.SecondaryInfinity.Value = true;
BlueTeam.Inventory.SecondaryInfinity.Value = false;
RedTeam.Inventory.SecondaryInfinity.Value = false;
RedTeam.Inventory.SecondaryInfinity.Value = true;
// Бесконечные патроны, на пистолет по ID:
Player.("ID").Inventory.SecondaryInfinity.Value = true;
Player.("ID").Inventory.SecondaryInfinity.Value = false;
{"Secondary"}
{"SecondaryInfinity"};
