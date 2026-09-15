using System.Collections;
using CradleOfTitans.World;
using UnityEngine;

namespace CradleOfTitans.Runtime
{
    public static class SpirePolish
    {
        private static readonly Color DarkMetal = new(0.095f, 0.13f, 0.15f);
        private static readonly Color ColdMetal = new(0.22f, 0.30f, 0.32f);
        private static readonly Color Rust = new(0.50f, 0.24f, 0.10f);
        private static readonly Color Energy = new(0.08f, 0.90f, 0.82f);
        private static readonly Color WarmEnergy = new(1.00f, 0.34f, 0.10f);
        private static readonly Color Foliage = new(0.13f, 0.35f, 0.22f);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (GameObject.Find("[SpirePolish]") != null)
                return;

            GameObject root = new("[SpirePolish]");
            Object.DontDestroyOnLoad(root);
            root.AddComponent<SpirePolishRuntime>();
        }

        private sealed class SpirePolishRuntime : MonoBehaviour
        {
            private IEnumerator Start()
            {
                // VerticalSliceBootstrap is also installed AfterSceneLoad. Waiting one frame makes
                // this layer independent from Unity's callback ordering.
                yield return null;

                GameObject worldObject = GameObject.Find("Shattered Spire");
                GameObject playerObject = GameObject.FindGameObjectWithTag("Player");
                if (worldObject == null || playerObject == null)
                    yield break;

                Transform world = worldObject.transform;
                BuildStartVista(world);
                BuildRouteLanguage(world);
                BuildEchoShrine(world);
                BuildResonanceGate(world);
                BuildBossApproach(world);
                BuildBossArena(world);
                BuildDistantSilhouette(world);
                BuildCheckpoints(world, playerObject.GetComponent<PlayerRespawn>());
            }
        }

        private static void BuildStartVista(Transform parent)
        {
            CreateArch("Collapsed Entry Arch", new Vector3(0f, 2.3f, -2.2f), 7.5f, 5.5f, parent);
            CreateBeacon("Start Beacon", new Vector3(-4.4f, 2.3f, -3.2f), Energy, parent);
            CreateBeacon("Route Beacon A", new Vector3(2.7f, 4.7f, 8.5f), Energy, parent);

            CreateBeam("Broken Crane", new Vector3(-5.7f, 4.2f, -5f), new Vector3(-10f, 11f, 5f), 0.36f, Rust, parent, false);
            CreateBeam("Hanging Brace", new Vector3(5.8f, 5.2f, 0f), new Vector3(9.5f, 12.5f, 10f), 0.28f, DarkMetal, parent, false);

            CreateDebrisCluster(new Vector3(-5.2f, 0.9f, -0.5f), 5, parent);
            CreateDebrisCluster(new Vector3(5.2f, 2.2f, 4.5f), 4, parent);
        }

        private static void BuildRouteLanguage(Transform parent)
        {
            // Turquoise edge markers are deliberately sparse: they pull the eye toward the critical path
            // without turning the level into a glowing race track.
            CreateMarker(new Vector3(0f, 2.05f, 4f), new Vector3(3.5f, 0.10f, 0.20f), parent);
            CreateMarker(new Vector3(4.4f, 4.35f, 9.8f), new Vector3(2.6f, 0.10f, 0.20f), parent);
            CreateMarker(new Vector3(-2.7f, 6.65f, 15.7f), new Vector3(2.8f, 0.10f, 0.20f), parent);

            CreateBeam("Support Rib A", new Vector3(-4f, 0f, 12f), new Vector3(-6f, 9f, 20f), 0.32f, ColdMetal, parent, false);
            CreateBeam("Support Rib B", new Vector3(5f, 2f, 18f), new Vector3(8f, 14f, 28f), 0.32f, ColdMetal, parent, false);

            for (int i = 0; i < 5; i++)
            {
                float y = 7.8f + i * 1.8f;
                CreateBox($"Wall Shaft Rib {i}", new Vector3(0f, y, 29.8f), new Vector3(6.3f, 0.18f, 0.28f), i % 2 == 0 ? Rust : DarkMetal, parent, false);
            }

            CreateBeacon("Wall Shaft Beacon", new Vector3(0f, 13.8f, 31f), Energy, parent);
        }

        private static void BuildEchoShrine(Transform parent)
        {
            Vector3 center = new(2.5f, 9.35f, 20f);
            CreateBox("Echo Shrine Plinth", center, new Vector3(2.8f, 0.35f, 2.8f), DarkMetal, parent, true);
            CreateBox("Echo Shrine Step", center + new Vector3(0f, -0.35f, -1.6f), new Vector3(3.8f, 0.35f, 1.2f), ColdMetal, parent, true);

            for (int i = 0; i < 4; i++)
            {
                float angle = i * Mathf.PI * 0.5f;
                Vector3 pillar = center + new Vector3(Mathf.Cos(angle) * 2.15f, 1.4f, Mathf.Sin(angle) * 2.15f);
                CreateBox($"Echo Shrine Pillar {i}", pillar, new Vector3(0.32f, 2.9f, 0.32f), ColdMetal, parent, false);
                CreateLight($"Echo Shrine Light {i}", pillar + Vector3.up * 1.35f, Energy, 2.4f, 5.2f, parent);
            }

            CreateBeam("Shrine Root A", center + new Vector3(-2.3f, -0.2f, -1.9f), center + new Vector3(-3.9f, 2.7f, 1.6f), 0.25f, Foliage, parent, false);
            CreateBeam("Shrine Root B", center + new Vector3(2.2f, -0.2f, 1.7f), center + new Vector3(4.1f, 3.4f, 0.1f), 0.23f, Foliage, parent, false);
        }

        private static void BuildResonanceGate(Transform parent)
        {
            CreateBox("Gate Pylon Left", new Vector3(-4.1f, 15.2f, 39.4f), new Vector3(1.0f, 6.2f, 1.4f), DarkMetal, parent, true);
            CreateBox("Gate Pylon Right", new Vector3(4.1f, 15.2f, 39.4f), new Vector3(1.0f, 6.2f, 1.4f), DarkMetal, parent, true);
            CreateBox("Gate Crown", new Vector3(0f, 18.3f, 39.4f), new Vector3(9.2f, 0.65f, 1.4f), Rust, parent, true);
            CreateMarker(new Vector3(-4.1f, 16.5f, 38.65f), new Vector3(0.18f, 2.8f, 0.12f), parent);
            CreateMarker(new Vector3(4.1f, 16.5f, 38.65f), new Vector3(0.18f, 2.8f, 0.12f), parent);
            CreateLight("Gate Cold Light L", new Vector3(-3.2f, 16.4f, 37.8f), Energy, 3.1f, 7.5f, parent);
            CreateLight("Gate Cold Light R", new Vector3(3.2f, 16.4f, 37.8f), Energy, 3.1f, 7.5f, parent);
        }

        private static void BuildBossApproach(Transform parent)
        {
            CreateArch("Upper Bridge Arch", new Vector3(0f, 18.1f, 49.5f), 8f, 7f, parent);
            CreateBeacon("Boss Approach Beacon", new Vector3(0f, 19.1f, 51.5f), WarmEnergy, parent);

            CreateBox("Upper Bridge Side L", new Vector3(-3.1f, 16.0f, 46f), new Vector3(0.35f, 1.2f, 8f), Rust, parent, false);
            CreateBox("Upper Bridge Side R", new Vector3(3.1f, 16.0f, 46f), new Vector3(0.35f, 1.2f, 8f), Rust, parent, false);
            CreateBeam("Arena Root Foreshadow A", new Vector3(-5f, 17.8f, 51f), new Vector3(-9f, 25f, 60f), 0.42f, Foliage, parent, false);
            CreateBeam("Arena Root Foreshadow B", new Vector3(5f, 17.8f, 51f), new Vector3(9f, 27f, 62f), 0.42f, Foliage, parent, false);
        }

        private static void BuildBossArena(Transform parent)
        {
            // Three readable height bands mirror the three resonant nodes on the boss.
            CreateBox("Arena Perch Southwest", new Vector3(-7.3f, 20.2f, 54f), new Vector3(3.2f, 0.55f, 3.2f), Foliage, parent, true);
            CreateBox("Arena Perch Northeast", new Vector3(7.2f, 22.1f, 63f), new Vector3(3.0f, 0.55f, 3.0f), Foliage, parent, true);
            CreateBox("Arena High Perch", new Vector3(-3.5f, 24.3f, 66f), new Vector3(3.0f, 0.55f, 3.0f), Foliage, parent, true);

            CreateBeam("Ancient Root West", new Vector3(-8f, 18.4f, 54f), new Vector3(-5.2f, 26f, 61f), 0.55f, Foliage, parent, false);
            CreateBeam("Ancient Root East", new Vector3(8f, 18.4f, 56f), new Vector3(5.5f, 28f, 64f), 0.55f, Foliage, parent, false);
            CreateBeam("Ancient Root Crown", new Vector3(-5.5f, 25f, 63f), new Vector3(5f, 28f, 66f), 0.45f, Foliage, parent, false);

            for (int i = 0; i < 8; i++)
            {
                float angle = i * Mathf.PI * 0.25f;
                Vector3 p = new(Mathf.Cos(angle) * 9.6f, 19.0f + (i % 2) * 0.8f, 58f + Mathf.Sin(angle) * 9.6f);
                CreateBox($"Arena Ruin Tooth {i}", p, new Vector3(1.15f, 2.4f + (i % 3), 1.15f), i % 2 == 0 ? DarkMetal : Rust, parent, false);
            }

            CreateLight("Boss Arena Warm Key", new Vector3(0f, 24f, 58f), WarmEnergy, 5f, 15f, parent);
            CreateLight("Boss Arena Cold Rim", new Vector3(-7f, 23f, 62f), Energy, 3.6f, 12f, parent);
        }

        private static void BuildDistantSilhouette(Transform parent)
        {
            for (int i = 0; i < 10; i++)
            {
                float angle = i * 0.73f + 0.4f;
                float radius = 38f + (i % 3) * 12f;
                Vector3 basePos = new(Mathf.Cos(angle) * radius, -2f + (i % 4) * 5f, 35f + Mathf.Sin(angle) * radius);
                float height = 14f + (i % 4) * 8f;
                CreateBox($"Far Spire {i}", basePos + Vector3.up * height * 0.5f, new Vector3(2.5f + (i % 2), height, 2.5f + (i % 2)), DarkMetal, parent, false);
                CreateBox($"Far Island {i}", basePos, new Vector3(10f + (i % 3) * 3f, 1.5f, 7f + (i % 2) * 4f), ColdMetal, parent, false);
            }
        }

        private static void BuildCheckpoints(Transform parent, PlayerRespawn respawn)
        {
            if (respawn == null)
                return;

            CreateCheckpoint("Checkpoint - Echo Shrine", new Vector3(2.5f, 10.0f, 22.2f), new Vector3(6f, 3f, 4f), new Vector3(2.5f, 10.1f, 20.0f), respawn, parent);
            CreateCheckpoint("Checkpoint - Boss Approach", new Vector3(0f, 17.0f, 50.5f), new Vector3(6f, 4f, 5f), new Vector3(0f, 16.4f, 47.5f), respawn, parent);
        }

        private static void CreateCheckpoint(string name, Vector3 position, Vector3 size, Vector3 spawnPoint, PlayerRespawn respawn, Transform parent)
        {
            GameObject trigger = new(name);
            trigger.transform.SetParent(parent);
            trigger.transform.position = position;
            BoxCollider collider = trigger.AddComponent<BoxCollider>();
            collider.isTrigger = true;
            collider.size = size;
            SpireCheckpoint checkpoint = trigger.AddComponent<SpireCheckpoint>();
            checkpoint.Configure(respawn, spawnPoint);

            CreateBeacon($"{name} Beacon", spawnPoint + new Vector3(-2.2f, 0.8f, 0f), Energy, parent);
        }

        private static void CreateArch(string name, Vector3 center, float width, float height, Transform parent)
        {
            CreateBox($"{name} Left", center + new Vector3(-width * 0.5f, 0f, 0f), new Vector3(0.65f, height, 0.9f), DarkMetal, parent, false);
            CreateBox($"{name} Right", center + new Vector3(width * 0.5f, 0f, 0f), new Vector3(0.65f, height, 0.9f), DarkMetal, parent, false);
            CreateBox($"{name} Crown", center + Vector3.up * height * 0.5f, new Vector3(width + 0.65f, 0.65f, 0.9f), Rust, parent, false);
        }

        private static void CreateBeacon(string name, Vector3 position, Color color, Transform parent)
        {
            GameObject pole = CreateBox(name, position, new Vector3(0.16f, 2.0f, 0.16f), DarkMetal, parent, false);
            GameObject lamp = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            lamp.name = $"{name} Lamp";
            lamp.transform.SetParent(pole.transform);
            lamp.transform.localPosition = new Vector3(0f, 0.6f, 0f);
            lamp.transform.localScale = Vector3.one * 2.6f;
            DisableCollider(lamp);
            lamp.GetComponent<Renderer>().material.color = color;
            CreateLight($"{name} Light", position + Vector3.up * 0.6f, color, 2.4f, 6.5f, parent);
        }

        private static void CreateMarker(Vector3 position, Vector3 scale, Transform parent)
        {
            CreateBox("Critical Path Inlay", position, scale, Energy, parent, false);
        }

        private static void CreateDebrisCluster(Vector3 center, int count, Transform parent)
        {
            for (int i = 0; i < count; i++)
            {
                Vector3 offset = new((i % 2 == 0 ? -1f : 1f) * (0.5f + i * 0.22f), i * 0.14f, (i - count * 0.5f) * 0.38f);
                GameObject debris = CreateBox($"Debris {center.x:0}_{i}", center + offset, new Vector3(0.55f + i * 0.08f, 0.28f, 1.1f), i % 2 == 0 ? Rust : ColdMetal, parent, false);
                debris.transform.rotation = Quaternion.Euler(i * 11f, i * 31f, i * 7f);
            }
        }

        private static GameObject CreateBox(string name, Vector3 position, Vector3 scale, Color color, Transform parent, bool colliderEnabled)
        {
            GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
            box.name = name;
            box.transform.SetParent(parent);
            box.transform.position = position;
            box.transform.localScale = scale;
            box.GetComponent<Renderer>().material.color = color;
            if (!colliderEnabled)
                DisableCollider(box);
            return box;
        }

        private static void CreateBeam(string name, Vector3 from, Vector3 to, float radius, Color color, Transform parent, bool colliderEnabled)
        {
            Vector3 delta = to - from;
            GameObject beam = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            beam.name = name;
            beam.transform.SetParent(parent);
            beam.transform.position = (from + to) * 0.5f;
            beam.transform.rotation = Quaternion.FromToRotation(Vector3.up, delta.normalized);
            beam.transform.localScale = new Vector3(radius, delta.magnitude * 0.5f, radius);
            beam.GetComponent<Renderer>().material.color = color;
            if (!colliderEnabled)
                DisableCollider(beam);
        }

        private static void CreateLight(string name, Vector3 position, Color color, float intensity, float range, Transform parent)
        {
            GameObject objectLight = new(name);
            objectLight.transform.SetParent(parent);
            objectLight.transform.position = position;
            Light light = objectLight.AddComponent<Light>();
            light.type = LightType.Point;
            light.color = color;
            light.intensity = intensity;
            light.range = range;
            light.shadows = LightShadows.None;
        }

        private static void DisableCollider(GameObject gameObject)
        {
            Collider collider = gameObject.GetComponent<Collider>();
            if (collider != null)
                Object.Destroy(collider);
        }
    }

    internal sealed class SpireCheckpoint : MonoBehaviour
    {
        private PlayerRespawn respawn;
        private Vector3 spawnPoint;
        private bool activated;

        public void Configure(PlayerRespawn targetRespawn, Vector3 targetSpawnPoint)
        {
            respawn = targetRespawn;
            spawnPoint = targetSpawnPoint;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (activated || respawn == null || other.GetComponentInParent<PlayerRespawn>() != respawn)
                return;

            respawn.Checkpoint = spawnPoint;
            activated = true;
        }
    }
}
