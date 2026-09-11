using System;
using UnityEngine;

namespace CradleOfTitans.Combat
{
    public class Health : MonoBehaviour, IDamageable
    {
        [SerializeField] private float maxHealth = 100f;
        [SerializeField] private bool invulnerable;

        public event Action<float, float> Changed;
        public event Action Died;

        public float Current { get; private set; }
        public float Max => maxHealth;
        public bool IsDead => Current <= 0f;
        public bool IsInvulnerable => invulnerable;

        protected virtual void Awake()
        {
            Current = Mathf.Max(1f, maxHealth);
        }

        public void Configure(float maximum)
        {
            maxHealth = Mathf.Max(1f, maximum);
            Current = maxHealth;
            Changed?.Invoke(Current, maxHealth);
        }

        public void SetInvulnerable(bool value)
        {
            invulnerable = value;
        }

        public virtual bool TakeDamage(float amount, DamageKind kind, GameObject source)
        {
            if (invulnerable || IsDead || amount <= 0f)
                return false;

            Current = Mathf.Max(0f, Current - amount);
            Changed?.Invoke(Current, maxHealth);

            if (Current <= 0f)
                Died?.Invoke();

            return true;
        }

        public void RestoreFull()
        {
            Current = maxHealth;
            Changed?.Invoke(Current, maxHealth);
        }
    }
}
