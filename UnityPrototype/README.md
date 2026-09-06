# Колыбель Титанов — Unity prototype

Этот каталог содержит независимый Unity-каркас 3D Metroidvania. Он не заменяет существующую WebGL/PWA-игру «Просёлок» в корне репозитория.

## Что уже заложено

- third-person `CharacterController`: ходьба, спринт, прыжок, unlockable double jump, wall slide, wall jump и mantle;
- ScriptableObject-модель предметов, оружия и ядер способностей;
- runtime-прогрессия без изменения asset-данных;
- lock-on с выбором цели по углу к камере, дистанции, приоритету и line-of-sight;
- единая точка вычисления aim point для лука и броска копья;
- ability-gates для дверей, лифтов и других препятствий;
- подробный GDD и техническая архитектура в `Docs/`.

## Быстрый запуск в Unity

1. Создайте пустой 3D-проект Unity и скопируйте папку `Assets/CradleOfTitans` из этого каталога в `Assets/` проекта.
2. На объект игрока добавьте `CharacterController`, `PlayerProgression`, `PlayerMotor` и `LockOnSystem`.
3. В `PlayerMotor` укажите `Camera Reference` и слой окружения в `Environment Mask`.
4. Для целей добавьте `LockOnTarget` и выделите их в отдельный физический слой, указанный в `Target Mask` у `LockOnSystem`.
5. Создавайте данные через `Create > Cradle of Titans`: Item, Weapon и Ability Core.
6. Mantle включён как базовое движение. Double Jump и Wall Jump активируются через соответствующие `AbilityDefinition` в `PlayerProgression`.

Контроллер использует legacy `Input` (`Horizontal`, `Vertical`, `Jump`) и `Left Shift` для спринта, чтобы не требовать внешних пакетов. Lock-on по умолчанию переключается `Q`, смена цели — колесом мыши. В production-проекте ввод рекомендуется завернуть в отдельный input-adapter и подключить Unity Input System.
