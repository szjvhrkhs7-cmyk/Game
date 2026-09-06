using CradleOfTitans.Targeting;
using UnityEngine;

namespace CradleOfTitans.CameraSystem
{
    [RequireComponent(typeof(Camera))]
    public sealed class ThirdPersonCamera : MonoBehaviour
    {
        [SerializeField] private Transform target;
        [SerializeField] private LockOnSystem lockOn;
        [SerializeField] private float distance = 6.4f;
        [SerializeField] private float height = 1.55f;
        [SerializeField] private float sensitivityX = 160f;
        [SerializeField] private float sensitivityY = 120f;
        [SerializeField] private float minPitch = -28f;
        [SerializeField] private float maxPitch = 62f;
        [SerializeField] private float smoothTime = 0.06f;
        [SerializeField] private float collisionRadius = 0.22f;
        [Header("Vertical framing")]
        [SerializeField] private float verticalLookAhead = 0.42f;
        [SerializeField] private float maxLookAhead = 1.25f;
        [SerializeField] private float lookAheadSmoothing = 5f;

        private readonly RaycastHit[] collisionHits = new RaycastHit[12];
        private float yaw;
        private float pitch = 18f;
        private float currentVerticalLookAhead;
        private Vector3 velocity;
        private Vector3 previousTargetPosition;
        private bool hasPreviousTargetPosition;

        public void Configure(Transform followTarget, LockOnSystem lockSystem)
        {
            target = followTarget;
            lockOn = lockSystem;
            if (target != null)
            {
                yaw = target.eulerAngles.y;
                previousTargetPosition = target.position;
                hasPreviousTargetPosition = true;
            }
        }

        private void LateUpdate()
        {
            if (target == null)
                return;

            UpdateVerticalFraming();

            if (lockOn != null && lockOn.IsLocked)
            {
                Vector3 toEnemy = lockOn.CurrentTarget.AimPoint - target.position;
                if (toEnemy.sqrMagnitude > 0.01f)
                    yaw = Mathf.LerpAngle(yaw, Quaternion.LookRotation(toEnemy).eulerAngles.y, 8f * Time.deltaTime);
            }
            else
            {
                yaw += Input.GetAxis("Mouse X") * sensitivityX * Time.deltaTime;
                pitch -= Input.GetAxis("Mouse Y") * sensitivityY * Time.deltaTime;
                pitch = Mathf.Clamp(pitch, minPitch, maxPitch);
            }

            Quaternion orbit = Quaternion.Euler(pitch, yaw, 0f);
            Vector3 pivot = target.position + Vector3.up * (height + currentVerticalLookAhead);
            Vector3 desired = pivot - orbit * Vector3.forward * distance;
            Vector3 direction = desired - pivot;
            float desiredDistance = direction.magnitude;

            if (desiredDistance > 0.001f)
            {
                int hitCount = Physics.SphereCastNonAlloc(
                    pivot,
                    collisionRadius,
                    direction.normalized,
                    collisionHits,
                    desiredDistance,
                    ~0,
                    QueryTriggerInteraction.Ignore);

                float nearestValidDistance = desiredDistance;
                for (int i = 0; i < hitCount; i++)
                {
                    Transform hitTransform = collisionHits[i].transform;
                    if (hitTransform == null || hitTransform == target || hitTransform.IsChildOf(target))
                        continue;

                    nearestValidDistance = Mathf.Min(nearestValidDistance, collisionHits[i].distance);
                }

                if (nearestValidDistance < desiredDistance)
                    desired = pivot + direction.normalized * Mathf.Max(0.35f, nearestValidDistance - collisionRadius);
            }

            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, smoothTime);

            Vector3 lookPoint = pivot;
            if (lockOn != null && lockOn.IsLocked)
                lookPoint = Vector3.Lerp(pivot, lockOn.CurrentTarget.AimPoint, 0.5f);

            Vector3 lookDirection = lookPoint - transform.position;
            if (lookDirection.sqrMagnitude > 0.0001f)
                transform.rotation = Quaternion.LookRotation(lookDirection, Vector3.up);
        }

        private void UpdateVerticalFraming()
        {
            if (!hasPreviousTargetPosition)
            {
                previousTargetPosition = target.position;
                hasPreviousTargetPosition = true;
                return;
            }

            float deltaTime = Mathf.Max(Time.deltaTime, 0.0001f);
            float verticalSpeed = (target.position.y - previousTargetPosition.y) / deltaTime;
            previousTargetPosition = target.position;

            float targetLookAhead = Mathf.Clamp(verticalSpeed * verticalLookAhead * 0.08f, -maxLookAhead * 0.45f, maxLookAhead);
            currentVerticalLookAhead = Mathf.Lerp(currentVerticalLookAhead, targetLookAhead, 1f - Mathf.Exp(-lookAheadSmoothing * Time.deltaTime));
        }
    }
}
