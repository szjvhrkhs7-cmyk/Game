using CradleOfTitans.Data;
using CradleOfTitans.Progression;
using UnityEngine;

namespace CradleOfTitans.World
{
    [RequireComponent(typeof(Collider))]
    public sealed class AbilityPickup : MonoBehaviour
    {
        [SerializeField] private AbilityId ability;
        [SerializeField] private float rotationSpeed = 65f;
        [SerializeField] private float bobHeight = 0.22f;
        [SerializeField] private float bobSpeed = 2.2f;

        private Vector3 basePosition;

        public AbilityId Ability => ability;

        public void Configure(AbilityId id)
        {
            ability = id;
        }

        private void Awake()
        {
            basePosition = transform.position;
            Collider trigger = GetComponent<Collider>();
            trigger.isTrigger = true;
        }

        private void Update()
        {
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime, Space.World);
            transform.position = basePosition + Vector3.up * (Mathf.Sin(Time.time * bobSpeed) * bobHeight);
        }

        private void OnTriggerEnter(Collider other)
        {
            PlayerProgression progression = other.GetComponentInParent<PlayerProgression>();
            if (progression == null)
                return;

            progression.Unlock(ability);
            Destroy(gameObject);
        }
    }
}
