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

        private float yaw;
        private float pitch = 18f;
        private Vector3 velocity;

        public void Configure(Transform followTarget, LockOnSystem lockSystem)
        {
            target = followTarget;
            lockOn = lockSystem;
            if (target != null)
                yaw = target.eulerAngles.y;
        }

        private void LateUpdate()
        {
            if (target == null)
                return;

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
            Vector3 pivot = target.position + Vector3.up * height;
            Vector3 desired = pivot - orbit * Vector3.forward * distance;
            Vector3 direction = desired - pivot;
            float desiredDistance = direction.magnitude;

            if (Physics.SphereCast(pivot, collisionRadius, direction.normalized, out RaycastHit hit, desiredDistance, ~0, QueryTriggerInteraction.Ignore))
            {
                if (hit.transform != target && !hit.transform.IsChildOf(target))
                    desired = pivot + direction.normalized * Mathf.Max(0.35f, hit.distance - collisionRadius);
            }

            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, smoothTime);

            Vector3 lookPoint = pivot;
            if (lockOn != null && lockOn.IsLocked)
                lookPoint = Vector3.Lerp(pivot, lockOn.CurrentTarget.AimPoint, 0.5f);

            transform.rotation = Quaternion.LookRotation(lookPoint - transform.position, Vector3.up);
        }
    }
}
