using CradleOfTitans.Combat;
using CradleOfTitans.Data;
using CradleOfTitans.Enemies;
using CradleOfTitans.Progression;
using UnityEngine;

namespace CradleOfTitans.UI
{
    public sealed class PrototypeHUD : MonoBehaviour
    {
        [SerializeField] private Health playerHealth;
        [SerializeField] private PlayerProgression progression;

        private RootSentinelBoss boss;
        private GUIStyle eyebrowStyle;
        private GUIStyle titleStyle;
        private GUIStyle bodyStyle;
        private GUIStyle hintStyle;
        private GUIStyle bossStyle;

        private static readonly Color Panel = new(0.025f, 0.045f, 0.055f, 0.90f);
        private static readonly Color PanelSoft = new(0.04f, 0.075f, 0.085f, 0.82f);
        private static readonly Color Energy = new(0.10f, 0.90f, 0.82f, 1f);
        private static readonly Color Danger = new(1f, 0.34f, 0.12f, 1f);
        private static readonly Color Track = new(0.13f, 0.18f, 0.20f, 0.96f);

        public void Configure(Health health, PlayerProgression playerProgression)
        {
            playerHealth = health;
            progression = playerProgression;
        }

        private void OnGUI()
        {
            EnsureStyles();
            DrawExplorerPanel();
            DrawBossPanel();
            DrawControlStrip();
        }

        private void DrawExplorerPanel()
        {
            float width = Mathf.Min(430f, Screen.width - 32f);
            Rect panel = new(16f, 16f, width, 154f);
            DrawPanel(panel, Panel);

            GUILayout.BeginArea(new Rect(panel.x + 14f, panel.y + 12f, panel.width - 28f, panel.height - 22f));
            GUILayout.Label("ЗОНА 01 · ВНЕШНЯЯ ОБОЛОЧКА", eyebrowStyle);
            GUILayout.Label("Шпиль Обломков", titleStyle);

            if (playerHealth != null)
            {
                float health01 = playerHealth.Max > 0f ? playerHealth.Current / playerHealth.Max : 0f;
                GUILayout.Space(3f);
                Rect healthRect = GUILayoutUtility.GetRect(10f, 10f, GUILayout.ExpandWidth(true));
                DrawBar(healthRect, health01, Energy);
                GUILayout.Label($"Целостность корпуса  {Mathf.CeilToInt(playerHealth.Current)} / {Mathf.CeilToInt(playerHealth.Max)}", hintStyle);
            }

            GUILayout.Space(4f);
            GUILayout.Label(GetObjective(), bodyStyle);
            GUILayout.EndArea();
        }

        private void DrawBossPanel()
        {
            if (boss == null && (progression == null || !progression.Has(AbilityId.DoubleJump)))
                boss = FindFirstObjectByType<RootSentinelBoss>();

            if (boss == null || boss.Health == null || boss.Health.IsDead)
                return;

            float width = Mathf.Min(520f, Screen.width - 40f);
            float x = (Screen.width - width) * 0.5f;
            Rect panel = new(x, Mathf.Max(182f, Screen.height - 120f), width, 76f);
            DrawPanel(panel, PanelSoft);

            GUI.Label(new Rect(panel.x + 14f, panel.y + 8f, panel.width - 28f, 24f), "СТРАЖ КОРНЕЙ", bossStyle);
            Rect bar = new(panel.x + 14f, panel.y + 37f, panel.width - 28f, 12f);
            float bossHealth01 = boss.Health.Max > 0f ? boss.Health.Current / boss.Health.Max : 0f;
            DrawBar(bar, bossHealth01, Danger);

            string phase = boss.WeakPointsRemaining > 0
                ? $"Резонансные узлы: {boss.WeakPointsRemaining} · только Эхо-стрелы"
                : "Ядро раскрыто · атакуй тело";
            GUI.Label(new Rect(panel.x + 14f, panel.y + 52f, panel.width - 28f, 18f), phase, hintStyle);
        }

        private void DrawControlStrip()
        {
            string controls = progression != null && progression.Has(AbilityId.Grapple)
                ? "WASD движение   Shift спринт   Space прыжок   ЛКМ клинок   ПКМ Эхо-Лук   Q захват цели   E крюк-кошка"
                : "WASD движение   Shift спринт   Space прыжок   ЛКМ клинок   ПКМ Эхо-Лук   Q захват цели";

            float width = Mathf.Min(760f, Screen.width - 32f);
            Rect panel = new((Screen.width - width) * 0.5f, Screen.height - 36f, width, 24f);
            DrawPanel(panel, new Color(0.02f, 0.035f, 0.04f, 0.72f));
            GUI.Label(new Rect(panel.x + 10f, panel.y + 3f, panel.width - 20f, 18f), controls, hintStyle);
        }

        private string GetObjective()
        {
            if (progression != null && progression.Has(AbilityId.DoubleJump))
                return "Сигнал вершины стабилизирован. Испытай двойной прыжок и крюк на верхних якорях.";

            if (boss != null)
            {
                return boss.WeakPointsRemaining > 0
                    ? "Поднимайся по ветвям и разбей три резонансных узла Стража Эхо-стрелами."
                    : "Резонанс снят. Страж уязвим: добей ядро кинетическим клинком или стрелами.";
            }

            if (progression != null && progression.Has(AbilityId.EchoBow))
                return "Эхо-Лук синхронизирован. Следуй бирюзовым маякам через резонансные врата к вершине.";

            return "Поднимись по обломкам к бирюзовому святилищу и найди оружейное ядро.";
        }

        private static void DrawPanel(Rect rect, Color color)
        {
            Color previous = GUI.color;
            GUI.color = color;
            GUI.DrawTexture(rect, Texture2D.whiteTexture);
            GUI.color = previous;
        }

        private static void DrawBar(Rect rect, float value, Color fill)
        {
            value = Mathf.Clamp01(value);
            DrawPanel(rect, Track);
            Rect filled = rect;
            filled.width *= value;
            DrawPanel(filled, fill);
        }

        private void EnsureStyles()
        {
            if (titleStyle != null)
                return;

            eyebrowStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 10,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.45f, 0.70f, 0.69f) }
            };
            titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 20,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.82f, 0.98f, 0.95f) }
            };
            bodyStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 13,
                wordWrap = true,
                normal = { textColor = new Color(0.92f, 0.96f, 0.96f) }
            };
            hintStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 11,
                alignment = TextAnchor.MiddleLeft,
                normal = { textColor = new Color(0.68f, 0.76f, 0.77f) }
            };
            bossStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 15,
                fontStyle = FontStyle.Bold,
                alignment = TextAnchor.MiddleCenter,
                normal = { textColor = new Color(1f, 0.72f, 0.56f) }
            };
        }
    }
}
