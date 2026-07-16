export function getJumpKind(coyoteTime, jumpsUsed, maxJumps = 2) {
  if (coyoteTime > 0) return "ground";
  if (jumpsUsed < maxJumps) return "air";
  return null;
}

export function calculatePhysicsSteps(vx, vy, dt, maxTravelPerStep = 10, maxSteps = 6) {
  const travel = Math.max(Math.abs(vx), Math.abs(vy)) * Math.max(0, dt);
  return Math.max(1, Math.min(maxSteps, Math.ceil(travel / maxTravelPerStep)));
}
