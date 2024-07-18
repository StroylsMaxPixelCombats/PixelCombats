// Страница, созданная как ПЛЕВОК, для вашего режима
- Обыкновенный, плевок:
Player.ContextedProperties.InventoryType.Value = true;
Player.ContextedProperties.InventoryType.Value = false;
- Плевок, только по командам:
BlueTeam.ContextedProperties.InventoryType.Value = true;
BlueTeam.ContextedProperties.InventoryType.Value = false;
RedTeam.ContextedProperties.InventoryType.Value = false;
RedTeam.ContextedProperties.InventoryType.Value = true;
// Плевок по ID:
Player.("ID").ContextedProperties.InventoryType.Value = true;
Player.("ID").ContextedProperties.InventoryType.Value = false;
({"InventoryType"})
