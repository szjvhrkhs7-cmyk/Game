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
        private GUIStyle titleStyle;
        private GUIStyle bodyStyle;

        public void Configure(Health health, PlayerProgression playerProgression)
        {
            playerHealth = health;
            progression = playerProgression;
        }

        private void OnGUI()
        {
            EnsureStyles();
            float width = Mathf.Min(470f, Screen.width - 32f);
            GUILayout.BeginArea(new Rect(16f, 16f, width, 250f));
            GUILayout.Label("КОЛЫБЕЛЬ ТИТАНОВ · ШПИЛЬ ОБЛОМКОВ", titleStyle);

            if (playerHealth != null)
                GUILayout.Label($"Целостность: {Mathf.CeilToInt(playerHealth.Current)} / {Mathf.CeilToInt(playerHealth.Max)}", bodyStyle);

            string objective;
            if (boss == null)
                boss = FindFirstObjectByType<RootSentinelBoss>();

            if (boss != null)
            {
                objective = boss.WeakPointsRemaining > 0
                    ? $"Цель: разбей Эхо-стрелами узлы Стража ({boss.WeakPointsRemaining})"
                    : "Цель: Страж уязвим. Добей его.";
            }
            else if (progression != null && progression.Has(AbilityId.DoubleJump))
                objective = "Vertical slice пройден. Получен двойной прыжок.";
            else if (progression != null && progression.Has(AbilityId.EchoBow))
                objective = "Цель: поднимись через резонансные врата к вершине.";
            else
                objective = "Цель: поднимись по обломкам и найди Ядро Эхо-Лука.";

            GUILayout.Label(objective, bodyStyle);
            GUILayout.Space(8f);
            GUILayout.Label("WASD · Shift спринт · Space прыжок · ЛКМ клинок · ПКМ Эхо-Лук · Q lock-on · колесо смена цели", bodyStyle);
            if (progression != null && progression.Has(AbilityId.Grapple))
                GUILayout.Label("E · крюк-кошка", bodyStyle);
            GUILayout.EndArea();
        }

        private void EnsureStyles()
        {
            if (titleStyle != null)
                return;

            titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 18,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.78f, 0.96f, 0.93f) }
            };
            bodyStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 14,
                wordWrap = true,
                normal = { textColor = Color.white }
            };
        }
    }
}
