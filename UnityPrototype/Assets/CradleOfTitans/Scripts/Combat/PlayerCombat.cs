using CradleOfTitans.Data;
using CradleOfTitans.Progression;
using CradleOfTitans.Targeting;
using UnityEngine;

namespace CradleOfTitans.Combat
{
    public sealed class PlayerCombat : MonoBehaviour
    {
        [SerializeField] private PlayerProgression progression;
        [SerializeField] private LockOnSystem lockOn;
        [SerializeField] private Transform projectileOrigin;
        [SerializeField] private float meleeDamage = 28f;
        [SerializeField] private float meleeRadius = 1.35f;
        [SerializeField] private float meleeReach = 1.25f;
        [SerializeField] private float meleeCooldown = 0.38f;
        [SerializeField] private float bowDamage = 22f;
        [SerializeField] private float bowCooldown = 0.45f;
        [SerializeField] private float projectileSpeed = 30f;

        private readonly Collider[] meleeHits = new Collider[20];
        private float nextMeleeTime;
        private float nextBowTime;

        public void Configure(PlayerProgression playerProgression, LockOnSystem lockSystem, Transform shotOrigin = null)
        {
            progression = playerProgression;
            lockOn = lockSystem;
            projectileOrigin = shotOrigin;
        }

        private void Update()
        {
            if (Input.GetMouseButtonDown(0))
                TryMelee();

            if (Input.GetMouseButtonDown(1))
                TryFireBow();
        }

        private void TryMelee()
        {
            if (Time.time < nextMeleeTime)
                return;

            nextMeleeTime = Time.time + meleeCooldown;
            Vector3 center = transform.position + transform.forward * meleeReach + Vector3.up;
            int count = Physics.OverlapSphereNonAlloc(center, meleeRadius, meleeHits, ~0, QueryTriggerInteraction.Ignore);

            for (int i = 0; i < count; i++)
            {
                Collider hit = meleeHits[i];
                if (hit == null || hit.transform == transform || hit.transform.IsChildOf(transform))
                    continue;

                IDamageable damageable = hit.GetComponentInParent<IDamageable>();
                if (damageable != null && damageable.TakeDamage(meleeDamage, DamageKind.Melee, gameObject))
                    break;
            }
        }

        private void TryFireBow()
        {
            if (progression == null || !progression.Has(AbilityId.EchoBow) || Time.time < nextBowTime)
                return;

            nextBowTime = Time.time + bowCooldown;
            Transform origin = projectileOrigin != null ? projectileOrigin : transform;
            Vector3 originPosition = origin.position + Vector3.up * 0.25f;
            Vector3 aimPoint = lockOn != null
                ? lockOn.ResolveAimPoint(80f)
                : originPosition + transform.forward * 80f;
            Vector3 direction = (aimPoint - originPosition).normalized;

            GameObject arrow = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            arrow.name = "Echo Arrow";
            arrow.transform.position = originPosition;
            arrow.transform.localScale = Vector3.one * 0.18f;
            Collider collider = arrow.GetComponent<Collider>();
            collider.isTrigger = true;
            Renderer renderer = arrow.GetComponent<Renderer>();
            renderer.material.color = new Color(0.18f, 0.92f, 0.92f);

            Projectile projectile = arrow.AddComponent<Projectile>();
            projectile.Configure(direction, projectileSpeed, bowDamage, 4f, gameObject);
        }
    }
}
