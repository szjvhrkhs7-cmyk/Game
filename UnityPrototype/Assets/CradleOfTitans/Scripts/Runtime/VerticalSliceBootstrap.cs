using CradleOfTitans.CameraSystem;
using CradleOfTitans.Character;
using CradleOfTitans.Combat;
using CradleOfTitans.Data;
using CradleOfTitans.Enemies;
using CradleOfTitans.Progression;
using CradleOfTitans.Targeting;
using CradleOfTitans.UI;
using CradleOfTitans.World;
using UnityEngine;

namespace CradleOfTitans.Runtime
{
    public static class VerticalSliceBootstrap
    {
        private static readonly Color Metal = new(0.18f, 0.23f, 0.27f);
        private static readonly Color Rust = new(0.48f, 0.23f, 0.12f);
        private static readonly Color Stone = new(0.26f, 0.30f, 0.31f);
        private static readonly Color Energy = new(0.12f, 0.82f, 0.78f);
        private static readonly Color Foliage = new(0.19f, 0.42f, 0.27f);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void BuildIfNeeded()
        {
            if (GameObject.Find("[CradleRuntime]") != null)
                return;

            BuildVerticalSlice();
        }

        private static void BuildVerticalSlice()
        {
            GameObject runtime = new("[CradleRuntime]");
            Object.DontDestroyOnLoad(runtime);

            ConfigureAtmosphere();
            Transform world = new GameObject("Shattered Spire").transform;
            world.SetParent(runtime.transform);

            BuildEnvironment(world);
            PlayerProgression progression = BuildPlayer(runtime.transform, out GameObject player, out PlayerRespawn respawn, out LockOnSystem lockOn, out PlayerMotor motor, out Health playerHealth);
            BuildCamera(runtime.transform, player.transform, progression, lockOn, motor);
            BuildEnemies(world, player.transform);
            BuildProgression(world, progression, respawn);
            BuildBoss(world, progression);
            BuildHUD(runtime.transform, playerHealth, progression);
        }

        private static void ConfigureAtmosphere()
        {
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.055f, 0.08f, 0.10f);
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogDensity = 0.018f;
            RenderSettings.ambientLight = new Color(0.27f, 0.34f, 0.36f);

            Light existing = Object.FindFirstObjectByType<Light>();
            if (existing != null)
                existing.gameObject.SetActive(false);

            GameObject sun = new("Cold Sun");
            Light light = sun.AddComponent<Light>();
            light.type = LightType.Directional;
            light.color = new Color(0.78f, 0.90f, 1f);
            light.intensity = 1.15f;
            sun.transform.rotation = Quaternion.Euler(42f, -35f, 0f);
        }

        private static PlayerProgression BuildPlayer(Transform parent, out GameObject player, out PlayerRespawn respawn, out LockOnSystem lockOn, out PlayerMotor motor, out Health health)
        {
            player = new GameObject("Aster - Archaeologist Golem");
            player.tag = "Player";
            player.transform.SetParent(parent);
            player.transform.position = new Vector3(0f, 1f, -8f);

            CharacterController controller = player.AddComponent<CharacterController>();
            controller.height = 1.8f;
            controller.radius = 0.34f;
            controller.center = new Vector3(0f, 0.9f, 0f);
            controller.stepOffset = 0.32f;
            controller.slopeLimit = 48f;

            GameObject model = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            model.name = "Golem Body";
            model.transform.SetParent(player.transform);
            model.transform.localPosition = new Vector3(0f, 0.9f, 0f);
            model.transform.localScale = new Vector3(0.68f, 0.88f, 0.68f);
            DisablePrimitiveCollider(model);
            model.GetComponent<Renderer>().material.color = new Color(0.69f, 0.78f, 0.76f);

            GameObject core = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            core.name = "Chest Core";
            core.transform.SetParent(player.transform);
            core.transform.localPosition = new Vector3(0f, 1.15f, 0.31f);
            core.transform.localScale = Vector3.one * 0.22f;
            DisablePrimitiveCollider(core);
            core.GetComponent<Renderer>().material.color = Energy;

            PlayerProgression progression = player.AddComponent<PlayerProgression>();
            progression.Unlock(AbilityId.Mantle);
            progression.Unlock(AbilityId.WallJump);

            health = player.AddComponent<Health>();
            health.Configure(100f);
            respawn = player.AddComponent<PlayerRespawn>();
            respawn.Checkpoint = player.transform.position;

            motor = player.AddComponent<PlayerMotor>();
            lockOn = player.AddComponent<LockOnSystem>();
            PlayerCombat combat = player.AddComponent<PlayerCombat>();
            combat.Configure(progression, lockOn, core.transform);
            GrappleController grapple = player.AddComponent<GrappleController>();
            grapple.Configure(motor, progression);
            return progression;
        }

        private static void BuildCamera(Transform parent, Transform player, PlayerProgression progression, LockOnSystem lockOn, PlayerMotor motor)
        {
            Camera existingCamera = Camera.main;
            if (existingCamera != null)
                existingCamera.gameObject.SetActive(false);

            GameObject cameraObject = new("Explorer Camera");
            cameraObject.tag = "MainCamera";
            cameraObject.transform.SetParent(parent);
            cameraObject.transform.position = player.position + new Vector3(0f, 3.5f, -6f);
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.fieldOfView = 64f;
            camera.nearClipPlane = 0.08f;
            camera.farClipPlane = 350f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.045f, 0.065f, 0.075f);
            cameraObject.AddComponent<AudioListener>();

            lockOn.Configure(camera, ~0, ~0);
            ThirdPersonCamera cameraRig = cameraObject.AddComponent<ThirdPersonCamera>();
            cameraRig.Configure(player, lockOn);
            motor.Configure(cameraObject.transform, progression);
        }

        private static void BuildEnvironment(Transform parent)
        {
            CreateBox("Start Ledge", new Vector3(0f, 0f, -8f), new Vector3(12f, 1f, 12f), Stone, parent);
            CreateBox("Broken Walkway A", new Vector3(0f, 1.6f, 2f), new Vector3(5.5f, 0.8f, 5f), Metal, parent);
            CreateBox("Broken Walkway B", new Vector3(4.4f, 3.9f, 8f), new Vector3(4.5f, 0.8f, 4.5f), Rust, parent);
            CreateBox("Broken Walkway C", new Vector3(-2.7f, 6.2f, 14f), new Vector3(5f, 0.8f, 4f), Metal, parent);
            CreateBox("Echo Shrine", new Vector3(2.5f, 8.7f, 20f), new Vector3(6f, 0.8f, 5f), Stone, parent);

            CreateBox("Wall Jump Left", new Vector3(-2.4f, 8.5f, 28f), new Vector3(1f, 8f, 4f), Metal, parent);
            CreateBox("Wall Jump Right", new Vector3(2.4f, 10.2f, 28f), new Vector3(1f, 8f, 4f), Metal, parent);
            CreateBox("Gate Landing", new Vector3(0f, 12.6f, 34f), new Vector3(8f, 0.8f, 7f), Stone, parent);
            CreateBox("Upper Bridge", new Vector3(0f, 15.0f, 44f), new Vector3(5f, 0.7f, 9f), Metal, parent);
            CreateBox("Boss Arena", new Vector3(0f, 18f, 58f), new Vector3(18f, 1f, 18f), Stone, parent);

            CreateBox("Boss Branch West", new Vector3(-6f, 20.4f, 58f), new Vector3(4f, 0.65f, 4f), Foliage, parent);
            CreateBox("Boss Branch East", new Vector3(6f, 22.5f, 59f), new Vector3(4f, 0.65f, 4f), Foliage, parent);
            CreateBox("Boss Branch North", new Vector3(0f, 24.6f, 64f), new Vector3(4f, 0.65f, 4f), Foliage, parent);

            CreateDecorativeChain(new Vector3(-5.5f, 2f, 5f), 8f, parent);
            CreateDecorativeChain(new Vector3(6.5f, 9f, 25f), 12f, parent);
            CreateDecorativeChain(new Vector3(-8f, 15f, 49f), 17f, parent);

            for (int i = 0; i < 14; i++)
            {
                float angle = i * 0.91f;
                float radius = 18f + (i % 3) * 5f;
                Vector3 position = new(Mathf.Cos(angle) * radius, 6f + (i % 5) * 4f, 35f + Mathf.Sin(angle) * radius);
                CreateBox($"Distant Ruin {i}", position, new Vector3(2.2f, 9f + (i % 4) * 3f, 2.2f), i % 2 == 0 ? Metal : Rust, parent);
            }
        }

        private static void BuildEnemies(Transform parent, Transform player)
        {
            CreateDrone("Scrap Drone - Lower", new Vector3(2f, 2.5f, 3f), 45f, parent);
            CreateDrone("Scrap Drone - Mid", new Vector3(-1.5f, 7.2f, 14f), 55f, parent);
            CreateDrone("Scrap Drone - Shrine", new Vector3(4f, 9.7f, 21f), 60f, parent);
            CreateDrone("Scrap Drone - Bridge", new Vector3(0f, 16f, 43f), 70f, parent);
        }

        private static void BuildProgression(Transform parent, PlayerProgression progression, PlayerRespawn respawn)
        {
            GameObject pickup = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            pickup.name = "Ability Core - Echo Bow";
            pickup.transform.SetParent(parent);
            pickup.transform.position = new Vector3(2.5f, 10.2f, 20f);
            pickup.transform.localScale = Vector3.one * 0.72f;
            pickup.GetComponent<Renderer>().material.color = Energy;
            pickup.GetComponent<Collider>().isTrigger = true;
            AbilityPickup abilityPickup = pickup.AddComponent<AbilityPickup>();
            abilityPickup.Configure(AbilityId.EchoBow);

            GameObject gateRoot = new("Resonance Gate Trigger");
            gateRoot.transform.SetParent(parent);
            gateRoot.transform.position = new Vector3(0f, 14.2f, 38f);
            BoxCollider trigger = gateRoot.AddComponent<BoxCollider>();
            trigger.isTrigger = true;
            trigger.size = new Vector3(7f, 5f, 4f);

            GameObject door = CreateBox("Resonance Gate", new Vector3(0f, 15.1f, 39.4f), new Vector3(7f, 5f, 0.8f), new Color(0.11f, 0.42f, 0.45f), parent);
            AbilityGate gate = gateRoot.AddComponent<AbilityGate>();
            gate.Configure(AbilityId.EchoBow, door.transform, new Vector3(0f, 6f, 0f), 5f);

            CreateGrapplePoint(new Vector3(-5f, 24f, 52f), parent);
            CreateGrapplePoint(new Vector3(5f, 27f, 58f), parent);
            CreateGrapplePoint(new Vector3(0f, 30f, 65f), parent);
        }

        private static void BuildBoss(Transform parent, PlayerProgression progression)
        {
            GameObject boss = new("Root Sentinel");
            boss.transform.SetParent(parent);
            boss.transform.position = new Vector3(0f, 20.2f, 59f);

            Health health = boss.AddComponent<Health>();
            health.Configure(180f);
            RootSentinelBoss sentinel = boss.AddComponent<RootSentinelBoss>();
            boss.AddComponent<LockOnTarget>();

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            body.name = "Ancient Trunk";
            body.transform.SetParent(boss.transform);
            body.transform.localPosition = Vector3.zero;
            body.transform.localScale = new Vector3(2.3f, 2.3f, 2.3f);
            body.GetComponent<Renderer>().material.color = new Color(0.31f, 0.24f, 0.16f);

            Vector3[] weakPositions =
            {
                new(-1.65f, 0.4f, -1.4f),
                new(1.55f, 1.7f, -0.7f),
                new(0f, 3.2f, 1.1f)
            };

            foreach (Vector3 localPosition in weakPositions)
            {
                GameObject weak = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                weak.name = "Resonant Root Node";
                weak.transform.SetParent(boss.transform);
                weak.transform.localPosition = localPosition;
                weak.transform.localScale = Vector3.one * 0.8f;
                weak.GetComponent<Renderer>().material.color = new Color(1f, 0.38f, 0.12f);
                BossWeakPoint weakPoint = weak.AddComponent<BossWeakPoint>();
                weakPoint.Configure(sentinel, 22f);
                sentinel.RegisterWeakPoint(weakPoint);
            }

            health.Died += () => progression.Unlock(AbilityId.DoubleJump);
            health.Died += () => progression.Unlock(AbilityId.Grapple);
        }

        private static void BuildHUD(Transform parent, Health health, PlayerProgression progression)
        {
            GameObject hud = new("Prototype HUD");
            hud.transform.SetParent(parent);
            PrototypeHUD component = hud.AddComponent<PrototypeHUD>();
            component.Configure(health, progression);
        }

        private static GameObject CreateDrone(string name, Vector3 position, float hitPoints, Transform parent)
        {
            GameObject drone = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            drone.name = name;
            drone.transform.SetParent(parent);
            drone.transform.position = position;
            drone.transform.localScale = new Vector3(1.1f, 0.75f, 1.1f);
            drone.GetComponent<Renderer>().material.color = Rust;
            Health health = drone.AddComponent<Health>();
            health.Configure(hitPoints);
            drone.AddComponent<LockOnTarget>();
            drone.AddComponent<ScrapDrone>();
            return drone;
        }

        private static GameObject CreateBox(string name, Vector3 position, Vector3 scale, Color color, Transform parent)
        {
            GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
            box.name = name;
            box.transform.SetParent(parent);
            box.transform.position = position;
            box.transform.localScale = scale;
            box.GetComponent<Renderer>().material.color = color;
            return box;
        }

        private static void CreateDecorativeChain(Vector3 position, float height, Transform parent)
        {
            GameObject chain = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            chain.name = "Suspension Chain";
            chain.transform.SetParent(parent);
            chain.transform.position = position + Vector3.up * height * 0.5f;
            chain.transform.localScale = new Vector3(0.18f, height * 0.5f, 0.18f);
            chain.GetComponent<Renderer>().material.color = Rust;
        }

        private static void CreateGrapplePoint(Vector3 position, Transform parent)
        {
            GameObject point = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            point.name = "Grapple Anchor";
            point.transform.SetParent(parent);
            point.transform.position = position;
            point.transform.localScale = Vector3.one * 0.55f;
            point.GetComponent<Renderer>().material.color = Energy;
            point.AddComponent<GrapplePoint>();
        }

        private static void DisablePrimitiveCollider(GameObject gameObject)
        {
            Collider collider = gameObject.GetComponent<Collider>();
            if (collider == null)
                return;
            collider.enabled = false;
            Object.Destroy(collider);
        }
    }
}
