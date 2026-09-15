using UnityEngine;

namespace CradleOfTitans.Targeting
{
    public sealed class LockOnTarget : MonoBehaviour
    {
        [SerializeField] private Transform aimPoint;
        [Range(-1f, 1f)] [SerializeField] private float priorityBias;
        [SerializeField] private bool targetable = true;

        public Vector3 AimPoint => aimPoint != null ? aimPoint.position : transform.position;
        public float PriorityBias => priorityBias;
        public bool IsTargetable => targetable && isActiveAndEnabled && gameObject.activeInHierarchy;

        public void SetTargetable(bool value)
        {
            targetable = value;
        }
    }
}
