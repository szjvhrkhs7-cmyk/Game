using System;
using UnityEngine;

namespace CradleOfTitans.Targeting
{
    public sealed class LockOnSystem : MonoBehaviour
    {
        [SerializeField] private Camera viewCamera;
        [SerializeField] private LayerMask targetMask = ~0;
        [SerializeField] private LayerMask occlusionMask = ~0;
        [SerializeField] private float searchRadius = 24f;
        [Range(10f, 180f)] [SerializeField] private float maxViewAngle = 85f;
        [SerializeField] private float ownerTurnSpeed = 12f;
        [SerializeField] private KeyCode toggleKey = KeyCode.Q;

        private readonly Collider[] overlapBuffer = new Collider[48];
        private LockOnTarget currentTarget;

        public event Action<LockOnTarget> TargetChanged;
        public LockOnTarget CurrentTarget => currentTarget;
        public bool IsLocked => currentTarget != null;

        private void Awake()
        {
            if (viewCamera == null)
                viewCamera = Camera.main;
        }

        public void Configure(Camera camera, LayerMask targets, LayerMask occlusion)
        {
            viewCamera = camera;
            targetMask = targets;
            occlusionMask = occlusion;
        }

        private void Update()
        {
            if (Input.GetKeyDown(toggleKey))
                Toggle();

            if (currentTarget == null)
                return;

            if (!IsValid(currentTarget))
            {
                SetTarget(null);
                return;
            }

            FaceCurrentTarget();
            float wheel = Input.mouseScrollDelta.y;
            if (Mathf.Abs(wheel) > 0.01f)
                Cycle(wheel > 0f ? 1 : -1);
        }

        public void Toggle()
        {
            SetTarget(currentTarget == null ? FindBestTarget() : null);
        }

        public void Cycle(int direction)
        {
            LockOnTarget next = FindBestTarget(currentTarget, direction >= 0 ? 1 : -1);
            if (next != null)
                SetTarget(next);
        }

        public Vector3 ResolveAimPoint(float fallbackDistance = 80f)
        {
            if (currentTarget != null && IsValid(currentTarget))
                return currentTarget.AimPoint;

            if (viewCamera == null)
                return transform.position + transform.forward * fallbackDistance;

            Ray ray = new(viewCamera.transform.position, viewCamera.transform.forward);
            RaycastHit[] hits = Physics.RaycastAll(ray, fallbackDistance, ~0, QueryTriggerInteraction.Ignore);
            Array.Sort(hits, (a, b) => a.distance.CompareTo(b.distance));
            foreach (RaycastHit hit in hits)
            {
                if (hit.transform == transform || hit.transform.IsChildOf(transform))
                    continue;
                return hit.point;
            }

            return ray.origin + ray.direction * fallbackDistance;
        }

        private LockOnTarget FindBestTarget(LockOnTarget excluded = null, int cycleDirection = 0)
        {
            if (viewCamera == null)
                return null;

            int count = Physics.OverlapSphereNonAlloc(transform.position, searchRadius, overlapBuffer, targetMask, QueryTriggerInteraction.Collide);
            LockOnTarget best = null;
            float bestScore = float.MaxValue;

            Vector3 cameraForward = viewCamera.transform.forward;
            Vector3 cameraPosition = viewCamera.transform.position;
            Vector3 currentViewport = excluded != null ? viewCamera.WorldToViewportPoint(excluded.AimPoint) : Vector3.zero;

            for (int i = 0; i < count; i++)
            {
                Collider candidateCollider = overlapBuffer[i];
                if (candidateCollider == null)
                    continue;

                LockOnTarget candidate = candidateCollider.GetComponentInParent<LockOnTarget>();
                if (candidate == null || candidate == excluded || !IsValid(candidate))
                    continue;

                Vector3 toTarget = candidate.AimPoint - cameraPosition;
                float distance = toTarget.magnitude;
                float angle = Vector3.Angle(cameraForward, toTarget);
                if (angle > maxViewAngle)
                    continue;

                Vector3 viewport = viewCamera.WorldToViewportPoint(candidate.AimPoint);
                if (viewport.z <= 0f)
                    continue;

                if (cycleDirection != 0 && excluded != null)
                {
                    float deltaX = viewport.x - currentViewport.x;
                    if (cycleDirection > 0 && deltaX <= 0.015f)
                        continue;
                    if (cycleDirection < 0 && deltaX >= -0.015f)
                        continue;
                }

                float angleScore = angle / maxViewAngle;
                float distanceScore = Mathf.Clamp01(distance / searchRadius);
                float centerScore = Mathf.Abs(viewport.x - 0.5f) + Mathf.Abs(viewport.y - 0.5f);
                float cyclePenalty = cycleDirection == 0 ? 0f : Mathf.Abs(viewport.x - currentViewport.x) * 0.2f;
                float score = angleScore * 0.45f + distanceScore * 0.25f + centerScore * 0.3f + cyclePenalty - candidate.PriorityBias;

                if (score < bestScore)
                {
                    best = candidate;
                    bestScore = score;
                }
            }

            if (best == null && cycleDirection != 0 && excluded != null)
                return FindBestTarget(null, 0);

            return best;
        }

        private bool IsValid(LockOnTarget target)
        {
            if (target == null || !target.IsTargetable || viewCamera == null)
                return false;

            Vector3 origin = viewCamera.transform.position;
            Vector3 toTarget = target.AimPoint - origin;
            if (toTarget.sqrMagnitude > searchRadius * searchRadius)
                return false;

            if (Vector3.Angle(viewCamera.transform.forward, toTarget) > maxViewAngle * 1.35f)
                return false;

            RaycastHit[] hits = Physics.RaycastAll(origin, toTarget.normalized, toTarget.magnitude, occlusionMask, QueryTriggerInteraction.Ignore);
            Array.Sort(hits, (a, b) => a.distance.CompareTo(b.distance));
            foreach (RaycastHit hit in hits)
            {
                if (hit.transform == transform || hit.transform.IsChildOf(transform))
                    continue;
                return hit.transform == target.transform || hit.transform.IsChildOf(target.transform);
            }

            return true;
        }

        private void FaceCurrentTarget()
        {
            Vector3 flatDirection = currentTarget.AimPoint - transform.position;
            flatDirection.y = 0f;
            if (flatDirection.sqrMagnitude < 0.001f)
                return;

            Quaternion targetRotation = Quaternion.LookRotation(flatDirection.normalized, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, ownerTurnSpeed * Time.deltaTime);
        }

        private void SetTarget(LockOnTarget target)
        {
            if (currentTarget == target)
                return;

            currentTarget = target;
            TargetChanged?.Invoke(currentTarget);
        }
    }
}
