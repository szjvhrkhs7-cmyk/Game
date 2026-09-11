using CradleOfTitans.Combat;
using UnityEngine;

namespace CradleOfTitans.Enemies
{
    [RequireComponent(typeof(Health))]
    public sealed class ScrapDrone : MonoBehaviour
    {
        [SerializeField] private float detectionRange = 13f;
        [SerializeField] private float stopDistance = 1.8f;
        [SerializeField] private float moveSpeed = 2.6f;
        [SerializeField] private float contactDamage = 14f;
        [SerializeField] private float attackCooldown = 1.1f;

        private Transform player;
        private float nextAttackTime;
        private Vector3 home;
        private Health health;

        private void Awake()
        {
            home = transform.position;
            health = GetComponent<Health>();
            health.Died += HandleDeath;
        }

        private void Start()
        {
            GameObject candidate = GameObject.FindGameObjectWithTag("Player");
            if (candidate != null)
                player = candidate.transform;
        }

        private void Update()
        {
            if (health.IsDead)
                return;

            if (player == null)
            {
                GameObject candidate = GameObject.FindGameObjectWithTag("Player");
                if (candidate != null)
                    player = candidate.transform;
                return;
            }

            Vector3 toPlayer = player.position - transform.position;
            toPlayer.y = 0f;
            float distance = toPlayer.magnitude;
            if (distance > detectionRange)
            {
                ReturnHome();
                return;
            }

            if (distance > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(toPlayer.normalized, Vector3.up);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, 7f * Time.deltaTime);
            }

            if (distance > stopDistance)
            {
                Vector3 step = toPlayer.normalized * moveSpeed * Time.deltaTime;
                transform.position += step;
                return;
            }

            if (Time.time >= nextAttackTime)
            {
                nextAttackTime = Time.time + attackCooldown;
                IDamageable target = player.GetComponentInParent<IDamageable>();
                target?.TakeDamage(contactDamage, DamageKind.Melee, gameObject);
            }
        }

        private void ReturnHome()
        {
            Vector3 toHome = home - transform.position;
            toHome.y = 0f;
            if (toHome.sqrMagnitude > 0.1f)
                transform.position += toHome.normalized * moveSpeed * 0.55f * Time.deltaTime;
        }

        private void HandleDeath()
        {
            enabled = false;
            Collider[] colliders = GetComponentsInChildren<Collider>();
            foreach (Collider collider in colliders)
                collider.enabled = false;
            Destroy(gameObject, 0.35f);
        }
    }
}
