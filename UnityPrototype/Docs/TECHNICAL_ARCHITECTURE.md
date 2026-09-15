# Техническая архитектура Unity

## Границы систем

Код разделён по ответственности. `PlayerMotor` знает только о перемещении и спрашивает у `PlayerProgression`, доступен ли навык. Данные предметов и способностей живут в ScriptableObject. Runtime-инвентарь хранит ссылки на definitions, но не изменяет сами assets. `LockOnSystem` отвечает только за поиск/ведение цели; конкретное оружие получает от него aim point.

Рекомендуемая структура production-проекта:

```text
Assets/CradleOfTitans/
  Art/
  Audio/
  Prefabs/
  Scenes/
    Bootstrap
    World/
      Spire
      Greenhouse
      Hydroponics
      Forge
      Garden
  Scripts/
    Character/
    Combat/
    Data/
    Inventory/
    Progression/
    Targeting/
    World/
  Tests/
```

## PlayerMotor

Базовый прототип использует `CharacterController`. Это сознательный выбор: для Metroidvania важнее точный и повторяемый контроль, чем физически корректное тело Rigidbody.

Порядок кадра:

1. ground state;
2. camera-relative input;
3. wall detection;
4. jump/wall-jump;
5. gravity/wall-slide;
6. `CharacterController.Move`;
7. mantle probe.

В production input нужно вынести в `IPlayerInputSource`, чтобы геймпад, клавиатура и мобильный ввод не жили в моторе. Анимацию следует подключать через отдельный presenter, читающий состояние мотора.

## Mantle

Проверка состоит из трёх запросов:

- луч на уровне груди подтверждает препятствие;
- луч на уровне головы подтверждает свободное пространство;
- луч сверху вниз находит поверхность уступа.

После валидации контроллер временно переводится в короткое управляемое перемещение между стартом и точкой вставания. Для production стоит заменить линейную интерполяцию root-motion анимацией, но оставить геометрическую проверку в коде.

## Ability data и runtime progression

`AbilityDefinition` — неизменяемое описание ядра. `PlayerProgression` формирует runtime-набор `AbilityId` и пересчитывает синергии. Это предотвращает типичную ошибку, когда ScriptableObject случайно используется как save-state и изменения из Play Mode попадают в asset.

Сохранение должно сериализовать стабильные ID, а не прямые Unity references. После загрузки ID резолвятся через каталог definitions.

Для сложной версии рекомендуется:

```text
AbilityCatalog: AbilityId -> AbilityDefinition
SaveData.unlockedAbilities: AbilityId[]
SaveData.equippedCores: AbilityId[]
```

## Inventory

`ItemDefinition` и `WeaponDefinition` описывают тип предмета. `InventoryRuntime` хранит стеки и текущее оружие. Если позже появятся индивидуальные параметры оружия, вводится `ItemInstance { definitionId, instanceId, modifiers }`, не меняя definitions.

## Lock-on

Поиск цели выполняется `Physics.OverlapSphereNonAlloc` по `Target Mask`. Кандидат отбрасывается, если:

- находится за пределами максимального угла камеры;
- закрыт геометрией из `Occlusion Mask`;
- отключён.

Оставшиеся кандидаты оцениваются по сумме нормализованных факторов: угол к forward камеры, дистанция и `PriorityBias` самой цели. Это даёт более естественный выбор, чем просто ближайший враг.

Lock-on не должен напрямую вращать камеру production-уровня. Он публикует текущую цель и aim point, а CameraRig использует их для композиции. В прототипе оставлен мягкий yaw игрока к цели, чтобы систему можно было проверить без Cinemachine.

### Лук и бросок копья

`RangedAimController.ResolveAimPoint` работает одинаково для обоих типов оружия:

1. если есть lock-on, берётся `LockOnTarget.AimPoint`;
2. иначе выпускается ray из центра камеры;
3. при попадании используется hit point;
4. без попадания — точка на заданной дальности.

После этого оружие считает направление **от фактического muzzle/hand origin к aim point**. Это устраняет параллакс, когда камера смотрит в цель, а снаряд стартует сбоку от персонажа.

Для копья после направления добавляется баллистика: solve launch velocity либо небольшая aim-assist коррекция по расстоянию. Для лука можно использовать прямой projectile или hitscan только для very-fast специальных стрел.

## Ability gates

`AbilityGate` — пример локального consumer-а прогрессии. Он не выдаёт способность и не знает, где она получена. Такой же принцип используется для:

- фазовых решёток;
- крюковых точек;
- термальных сенсоров;
- гравитационных механизмов;
- водяных регуляторов.

Каждый gate должен иметь визуальный telegraph способности, чтобы игрок понимал причину недоступности ещё до unlock.

## Мир и streaming

Для бесшовного мира рекомендуется additive scene streaming. Каждый биом делится на несколько chunk-сцен, а постоянные systems живут в `Bootstrap`.

```text
Bootstrap
  GameSession
  SaveService
  AudioService
  SceneStreamingService
  Player

World Chunk
  StaticGeometry
  Encounters
  Gates
  Checkpoints
  ShortcutState
```

Загрузка соседних chunk-сцен запускается volume-триггерами и запасом по вертикали. В шахтах preload должен учитывать не только XZ-дистанцию, но и прогноз падения вниз, иначе игрок может пересечь несколько этажей быстрее обычного горизонтального streaming.

## Save model

Минимальный save:

- checkpoint ID;
- unlocked ability IDs;
- collected permanent upgrades;
- opened shortcuts;
- boss state;
- world-state flags (вода/крупные механизмы только там, где состояние должно переживать перезапуск).

Временное состояние комнаты не нужно сохранять, если его восстановление детерминировано.

## Боссы

Босс строится как state machine из фаз, а не как один монолитный `Update`. Каждая фаза должна явно публиковать разрешённые transitions и условия stagger/death. Механика свежей способности реализуется через отдельный interaction component, чтобы не пришивать проверку конкретной способности внутрь общего health-компонента.

## Производительность

- `OverlapSphereNonAlloc` вместо аллокаций каждый кадр;
- lock-on scan не чаще 8–12 раз/сек при отсутствии цели, ведение текущей цели — каждый кадр;
- object pooling для стрел, копий, VFX и повторяющихся противников;
- LOD/occlusion culling на больших вертикальных видах;
- physics layers для отделения Environment, Target, Projectile, Interactable;
- chunk streaming с ограничением числа одновременно активных биомов.

## Что остаётся за пределами текущего каркаса

В репозитории нет полноценного Unity project metadata и CI с Unity Editor, поэтому этот набор является компилируемым gameplay-каркасом для импорта в Unity, а не готовым билдом сцены. Следующий технический шаг — создать отдельный Unity-проект, настроить Input System, CameraRig/Cinemachine, Animator state machine, prefabs и automated PlayMode tests.
