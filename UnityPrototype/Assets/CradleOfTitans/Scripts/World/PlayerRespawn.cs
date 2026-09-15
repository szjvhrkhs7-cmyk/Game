using CradleOfTitans.Combat;
using UnityEngine;

namespace CradleOfTitans.World
{
    [RequireComponent(typeof(Health))]
    public sealed class PlayerRespawn : MonoBehaviour
    {
        [SerializeField] private float killHeight = -18f;
        private Health health;
        private Vector3 checkpoint;
        private bool respawning;

        public Vector3 Checkpoint
        {
            get => checkpoint;
            set => checkpoint = value;
        }

        private void Awake()
        {
            health = GetComponent<Health>();
            checkpoint = transform.position;
            health.Died += Respawn;
        }

        private void Update()
        {
            if (transform.position.y < killHeight)
                Respawn();
        }

        public void Respawn()
        {
            if (respawning)
                return;

            respawning = true;
            CharacterController controller = GetComponent<CharacterController>();
            if (controller != null)
                controller.enabled = false;
            transform.position = checkpoint;
            transform.rotation = Quaternion.identity;
            health.RestoreFull();
            if (controller != null)
                controller.enabled = true;
            respawning = false;
        }
    }
}
