using System.Collections.Generic;
using CradleOfTitans.Combat;
using CradleOfTitans.Targeting;
using UnityEngine;

namespace CradleOfTitans.Enemies
{
    [RequireComponent(typeof(Health))]
    public sealed class RootSentinelBoss : MonoBehaviour
    {
        [SerializeField] private float attackRange = 22f;
        [SerializeField] private float projectileDamage = 18f;
        [SerializeField] private float attackInterval = 1.8f;

        private readonly List<BossWeakPoint> weakPoints = new();
        private Health health;
        private Transform player;
        private float nextAttackTime;

        public int WeakPointsRemaining { get; private set; }
        public bool IsVulnerable => WeakPointsRemaining <= 0;
        public Health Health => health;

        private void Awake()
        {
            health = GetComponent<Health>();
            health.SetInvulnerable(true);
            health.Died += HandleDeath;
        }

        private void Start()
        {
            GameObject candidate = GameObject.FindGameObjectWithTag("Player");
            if (candidate != null)
                player = candidate.transform;
        }

        public void RegisterWeakPoint(BossWeakPoint weakPoint)
        {
            if (weakPoint == null || weakPoints.Contains(weakPoint))
                return;
            weakPoints.Add(weakPoint);
            WeakPointsRemaining++;
        }

        public void NotifyWeakPointBroken(BossWeakPoint weakPoint)
        {
            WeakPointsRemaining = Mathf.Max(0, WeakPointsRemaining - 1);
            if (WeakPointsRemaining == 0)
                health.SetInvulnerable(false);
        }

        private void Update()
        {
            if (health.IsDead || player == null)
                return;

            Vector3 toPlayer = player.position - transform.position;
            Vector3 flat = toPlayer;
            flat.y = 0f;
            if (flat.sqrMagnitude > 0.1f)
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(flat), 3f * Time.deltaTime);

            if (toPlayer.sqrMagnitude > attackRange * attackRange || Time.time < nextAttackTime)
                return;

            nextAttackTime = Time.time + attackInterval;
            FireRootBolt(toPlayer.normalized);
        }

        private void FireRootBolt(Vector3 direction)
        {
            GameObject bolt = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            bolt.name = "Root Bolt";
            bolt.transform.position = transform.position + Vector3.up * 2.4f + direction * 1.2f;
            bolt.transform.localScale = Vector3.one * 0.34f;
            bolt.GetComponent<Collider>().isTrigger = true;
            bolt.GetComponent<Renderer>().material.color = new Color(1f, 0.36f, 0.12f);
            Projectile projectile = bolt.AddComponent<Projectile>();
            projectile.Configure(direction, 12f, projectileDamage, 5f, gameObject, DamageKind.Hazard);
        }

        private void HandleDeath()
        {
            enabled = false;
            LockOnTarget lockTarget = GetComponent<LockOnTarget>();
            if (lockTarget != null)
                lockTarget.SetTargetable(false);
            foreach (Collider collider in GetComponentsInChildren<Collider>())
                collider.enabled = false;
            Destroy(gameObject, 1.2f);
        }
    }
}
