using UnityEngine;

namespace CradleOfTitans.Data
{
    public enum WeaponKind
    {
        KineticBlade,
        ThermalSpear,
        EchoBow,
        QuantumOrb
    }

    [CreateAssetMenu(menuName = "Cradle of Titans/Weapon", fileName = "Weapon_")]
    public sealed class WeaponDefinition : ItemDefinition
    {
        [SerializeField] private WeaponKind weaponKind;
        [Min(0f)] [SerializeField] private float baseDamage = 10f;
        [Min(0.01f)] [SerializeField] private float attacksPerSecond = 1f;
        [SerializeField] private AbilityId interactionAbility = AbilityId.None;

        public WeaponKind WeaponKind => weaponKind;
        public float BaseDamage => Mathf.Max(0f, baseDamage);
        public float AttacksPerSecond => Mathf.Max(0.01f, attacksPerSecond);
        public AbilityId InteractionAbility => interactionAbility;
    }
}
