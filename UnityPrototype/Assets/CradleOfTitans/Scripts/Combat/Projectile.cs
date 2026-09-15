using UnityEngine;

namespace CradleOfTitans.Combat
{
    [RequireComponent(typeof(SphereCollider))]
    public sealed class Projectile : MonoBehaviour
    {
        private Vector3 velocity;
        private float damage;
        private float expiresAt;
        private GameObject owner;
        private DamageKind kind;

        public void Configure(Vector3 direction, float speed, float damageAmount, float lifetime, GameObject source, DamageKind damageKind = DamageKind.Projectile)
        {
            velocity = direction.normalized * Mathf.Max(0f, speed);
            damage = Mathf.Max(0f, damageAmount);
            expiresAt = Time.time + Mathf.Max(0.1f, lifetime);
            owner = source;
            kind = damageKind;
        }

        private void Update()
        {
            if (Time.time >= expiresAt)
            {
                Destroy(gameObject);
                return;
            }

            Vector3 delta = velocity * Time.deltaTime;
            if (delta.sqrMagnitude > 0f && Physics.SphereCast(transform.position, 0.11f, delta.normalized, out RaycastHit hit, delta.magnitude, ~0, QueryTriggerInteraction.Ignore))
            {
                if (owner != null && (hit.transform == owner.transform || hit.transform.IsChildOf(owner.transform)))
                {
                    transform.position += delta;
                    return;
                }

                IDamageable damageable = hit.collider.GetComponentInParent<IDamageable>();
                damageable?.TakeDamage(damage, kind, owner);
                Destroy(gameObject);
                return;
            }

            transform.position += delta;
        }
    }
}
