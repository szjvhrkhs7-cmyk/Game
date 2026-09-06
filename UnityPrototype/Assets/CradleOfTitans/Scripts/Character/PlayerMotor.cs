using CradleOfTitans.Data;
using CradleOfTitans.Progression;
using UnityEngine;

namespace CradleOfTitans.Character
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class PlayerMotor : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Transform cameraReference;
        [SerializeField] private PlayerProgression progression;
        [SerializeField] private LayerMask environmentMask = ~0;

        [Header("Move")]
        [SerializeField] private float walkSpeed = 5f;
        [SerializeField] private float sprintSpeed = 8f;
        [SerializeField] private float acceleration = 28f;
        [SerializeField] private float rotationSpeed = 14f;
        [SerializeField] private float gravity = -26f;
        [SerializeField] private float jumpHeight = 1.8f;

        [Header("Wall")]
        [SerializeField] private float wallCheckDistance = 0.65f;
        [SerializeField] private float wallSlideSpeed = 2.5f;
        [SerializeField] private float wallJumpUpSpeed = 8f;
        [SerializeField] private float wallJumpAwaySpeed = 6f;

        [Header("Mantle")]
        [SerializeField] private bool mantleAvailableByDefault = true;
        [SerializeField] private float mantleForwardProbe = 0.8f;
        [SerializeField] private float mantleMinHeight = 0.55f;
        [SerializeField] private float mantleMaxHeight = 1.65f;
        [SerializeField] private float mantleDuration = 0.22f;

        private CharacterController controller;
        private Vector3 planarVelocity;
        private float verticalVelocity;
        private int jumpsUsed;
        private bool wallSliding;
        private Vector3 wallNormal;
        private Vector3 desiredMoveDirection;

        private bool mantling;
        private float mantleElapsed;
        private Vector3 mantleStart;
        private Vector3 mantleEnd;

        public bool IsGrounded => controller != null && controller.isGrounded;
        public bool IsWallSliding => wallSliding;
        public bool IsMantling => mantling;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (cameraReference == null && Camera.main != null)
                cameraReference = Camera.main.transform;
        }

        private void Update()
        {
            if (mantling)
            {
                UpdateMantle();
                return;
            }

            UpdateGroundState();
            Vector2 moveInput = new(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
            UpdatePlanarMovement(moveInput);
            DetectWall();
            HandleJumpInput();
            ApplyVerticalMotion();

            controller.Move((planarVelocity + Vector3.up * verticalVelocity) * Time.deltaTime);

            if (!controller.isGrounded)
                TryStartMantle();
        }

        private void UpdateGroundState()
        {
            if (!controller.isGrounded)
                return;

            jumpsUsed = 0;
            wallSliding = false;
            if (verticalVelocity < 0f)
                verticalVelocity = -2f;
        }

        private void UpdatePlanarMovement(Vector2 input)
        {
            Vector3 cameraForward = cameraReference != null ? cameraReference.forward : transform.forward;
            Vector3 cameraRight = cameraReference != null ? cameraReference.right : transform.right;
            cameraForward.y = 0f;
            cameraRight.y = 0f;
            cameraForward.Normalize();
            cameraRight.Normalize();

            desiredMoveDirection = cameraForward * input.y + cameraRight * input.x;
            if (desiredMoveDirection.sqrMagnitude > 1f)
                desiredMoveDirection.Normalize();

            float targetSpeed = Input.GetKey(KeyCode.LeftShift) ? sprintSpeed : walkSpeed;
            Vector3 targetVelocity = desiredMoveDirection * targetSpeed;
            planarVelocity = Vector3.MoveTowards(planarVelocity, targetVelocity, acceleration * Time.deltaTime);

            if (desiredMoveDirection.sqrMagnitude > 0.01f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(desiredMoveDirection, Vector3.up);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
            }
        }

        private void DetectWall()
        {
            wallSliding = false;
            wallNormal = Vector3.zero;

            if (controller.isGrounded || desiredMoveDirection.sqrMagnitude < 0.01f)
                return;

            Vector3 origin = transform.position + controller.center;
            if (!Physics.Raycast(origin, desiredMoveDirection.normalized, out RaycastHit hit, wallCheckDistance, environmentMask, QueryTriggerInteraction.Ignore))
                return;

            if (Mathf.Abs(Vector3.Dot(hit.normal, Vector3.up)) > 0.35f)
                return;

            wallNormal = hit.normal;
            wallSliding = verticalVelocity <= 0f;
        }

        private void HandleJumpInput()
        {
            if (!Input.GetButtonDown("Jump"))
                return;

            if (wallSliding && HasAbility(AbilityId.WallJump))
            {
                verticalVelocity = wallJumpUpSpeed;
                planarVelocity = wallNormal * wallJumpAwaySpeed;
                wallSliding = false;
                jumpsUsed = 1;
                return;
            }

            if (controller.isGrounded)
            {
                Jump();
                jumpsUsed = 1;
                return;
            }

            if (HasAbility(AbilityId.DoubleJump) && jumpsUsed < 2)
            {
                Jump();
                jumpsUsed = 2;
            }
        }

        private void Jump()
        {
            verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }

        private void ApplyVerticalMotion()
        {
            if (wallSliding && verticalVelocity < -wallSlideSpeed)
                verticalVelocity = -wallSlideSpeed;
            else
                verticalVelocity += gravity * Time.deltaTime;
        }

        private void TryStartMantle()
        {
            if (!MantleUnlocked() || desiredMoveDirection.sqrMagnitude < 0.01f || verticalVelocity > 2f)
                return;

            Vector3 forward = desiredMoveDirection.normalized;
            float bottomOffset = controller.center.y - controller.height * 0.5f;
            Vector3 feet = transform.position + Vector3.up * bottomOffset;
            Vector3 chestOrigin = feet + Vector3.up * mantleMinHeight;
            Vector3 headOrigin = feet + Vector3.up * mantleMaxHeight;

            if (!Physics.Raycast(chestOrigin, forward, out RaycastHit obstacleHit, mantleForwardProbe, environmentMask, QueryTriggerInteraction.Ignore))
                return;

            if (Vector3.Dot(obstacleHit.normal, Vector3.up) > 0.35f)
                return;

            if (Physics.Raycast(headOrigin, forward, mantleForwardProbe, environmentMask, QueryTriggerInteraction.Ignore))
                return;

            Vector3 topProbe = feet + forward * (mantleForwardProbe + controller.radius) + Vector3.up * mantleMaxHeight;
            if (!Physics.Raycast(topProbe, Vector3.down, out RaycastHit topHit, mantleMaxHeight - mantleMinHeight + 0.5f, environmentMask, QueryTriggerInteraction.Ignore))
                return;

            if (Vector3.Dot(topHit.normal, Vector3.up) < 0.75f)
                return;

            float targetPivotY = topHit.point.y - bottomOffset + 0.03f;
            Vector3 target = new(topHit.point.x, targetPivotY, topHit.point.z);
            if (Physics.CheckCapsule(
                    target + controller.center + Vector3.up * (-controller.height * 0.5f + controller.radius),
                    target + controller.center + Vector3.up * (controller.height * 0.5f - controller.radius),
                    controller.radius * 0.9f,
                    environmentMask,
                    QueryTriggerInteraction.Ignore))
                return;

            mantleStart = transform.position;
            mantleEnd = target;
            mantleElapsed = 0f;
            mantling = true;
            planarVelocity = Vector3.zero;
            verticalVelocity = 0f;
            controller.enabled = false;
        }

        private void UpdateMantle()
        {
            mantleElapsed += Time.deltaTime;
            float t = Mathf.Clamp01(mantleElapsed / Mathf.Max(0.01f, mantleDuration));
            t = t * t * (3f - 2f * t);
            transform.position = Vector3.Lerp(mantleStart, mantleEnd, t);

            if (t < 1f)
                return;

            controller.enabled = true;
            mantling = false;
            jumpsUsed = 0;
        }

        private bool MantleUnlocked()
        {
            return mantleAvailableByDefault || HasAbility(AbilityId.Mantle);
        }

        private bool HasAbility(AbilityId id)
        {
            return progression != null && progression.Has(id);
        }
    }
}
