using CradleOfTitans.Targeting;
using UnityEngine;

namespace CradleOfTitans.Combat
{
    public sealed class RangedAimController : MonoBehaviour
    {
        [SerializeField] private LockOnSystem lockOn;
        [SerializeField] private Transform projectileOrigin;
        [SerializeField] private float freeAimDistance = 80f;

        public Vector3 AimPoint => lockOn != null
            ? lockOn.ResolveAimPoint(freeAimDistance)
            : transform.position + transform.forward * freeAimDistance;

        public Vector3 GetShotDirection()
        {
            Transform origin = projectileOrigin != null ? projectileOrigin : transform;
            Vector3 direction = AimPoint - origin.position;
            return direction.sqrMagnitude > 0.0001f ? direction.normalized : origin.forward;
        }

        public Quaternion GetShotRotation()
        {
            return Quaternion.LookRotation(GetShotDirection(), Vector3.up);
        }
    }
}
