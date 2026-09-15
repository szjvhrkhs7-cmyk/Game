using CradleOfTitans.Combat;
using UnityEngine;

namespace CradleOfTitans.Enemies
{
    public sealed class BossWeakPoint : MonoBehaviour, IDamageable
    {
        private RootSentinelBoss boss;
        private float health = 30f;
        private bool broken;

        public void Configure(RootSentinelBoss owner, float hitPoints = 30f)
        {
            boss = owner;
            health = Mathf.Max(1f, hitPoints);
        }

        public bool TakeDamage(float amount, DamageKind kind, GameObject source)
        {
            if (broken || kind != DamageKind.Projectile || amount <= 0f)
                return false;

            health -= amount;
            transform.localScale *= 0.9f;
            if (health > 0f)
                return true;

            broken = true;
            boss?.NotifyWeakPointBroken(this);
            gameObject.SetActive(false);
            return true;
        }
    }
}
