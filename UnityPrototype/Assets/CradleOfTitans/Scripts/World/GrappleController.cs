using CradleOfTitans.Character;
using CradleOfTitans.Data;
using CradleOfTitans.Progression;
using UnityEngine;

namespace CradleOfTitans.World
{
    public sealed class GrappleController : MonoBehaviour
    {
        [SerializeField] private PlayerMotor motor;
        [SerializeField] private PlayerProgression progression;
        [SerializeField] private float range = 22f;
        [SerializeField] private float launchSpeed = 13f;
        [SerializeField] private float upwardBias = 4f;
        [SerializeField] private KeyCode key = KeyCode.E;

        private readonly Collider[] buffer = new Collider[32];

        public void Configure(PlayerMotor playerMotor, PlayerProgression playerProgression)
        {
            motor = playerMotor;
            progression = playerProgression;
        }

        private void Update()
        {
            if (!Input.GetKeyDown(key) || motor == null || progression == null || !progression.Has(AbilityId.Grapple))
                return;

            GrapplePoint best = FindBestPoint();
            if (best == null)
                return;

            Vector3 toPoint = best.Point - transform.position;
            Vector3 velocity = toPoint.normalized * launchSpeed + Vector3.up * upwardBias;
            motor.ApplyLaunch(velocity);
        }

        private GrapplePoint FindBestPoint()
        {
            int count = Physics.OverlapSphereNonAlloc(transform.position, range, buffer, ~0, QueryTriggerInteraction.Collide);
            GrapplePoint best = null;
            float bestScore = float.MaxValue;
            Camera camera = Camera.main;

            for (int i = 0; i < count; i++)
            {
                GrapplePoint point = buffer[i] != null ? buffer[i].GetComponentInParent<GrapplePoint>() : null;
                if (point == null)
                    continue;

                Vector3 toPoint = point.Point - transform.position;
                float distance = toPoint.magnitude;
                float angle = camera != null ? Vector3.Angle(camera.transform.forward, point.Point - camera.transform.position) : 0f;
                if (angle > 55f)
                    continue;

                float score = distance + angle * 0.18f;
                if (score < bestScore)
                {
                    bestScore = score;
                    best = point;
                }
            }

            return best;
        }
    }
}
