using UnityEngine;

namespace CradleOfTitans.Combat
{
    public enum DamageKind
    {
        Melee,
        Projectile,
        Hazard
    }

    public interface IDamageable
    {
        bool TakeDamage(float amount, DamageKind kind, GameObject source);
    }
}
