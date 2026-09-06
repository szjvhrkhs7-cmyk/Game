using CradleOfTitans.Data;
using CradleOfTitans.Progression;
using UnityEngine;

namespace CradleOfTitans.World
{
    public sealed class AbilityGate : MonoBehaviour
    {
        [SerializeField] private AbilityId requiredAbility;
        [SerializeField] private Transform movingPart;
        [SerializeField] private Vector3 localOpenOffset = new(0f, 4f, 0f);
        [SerializeField] private float openSpeed = 4f;

        private Vector3 closedLocalPosition;
        private PlayerProgression progression;
        private bool opening;

        private void Awake()
        {
            if (movingPart == null)
                movingPart = transform;
            closedLocalPosition = movingPart.localPosition;
        }

        private void OnTriggerEnter(Collider other)
        {
            PlayerProgression candidate = other.GetComponentInParent<PlayerProgression>();
            if (candidate == null || !candidate.Has(requiredAbility))
                return;

            progression = candidate;
            opening = true;
        }

        private void Update()
        {
            if (!opening || progression == null || !progression.Has(requiredAbility))
                return;

            Vector3 target = closedLocalPosition + localOpenOffset;
            movingPart.localPosition = Vector3.MoveTowards(movingPart.localPosition, target, openSpeed * Time.deltaTime);
        }
    }
}
