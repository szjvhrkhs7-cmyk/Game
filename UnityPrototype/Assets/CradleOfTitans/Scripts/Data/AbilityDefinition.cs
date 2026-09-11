using UnityEngine;

namespace CradleOfTitans.Data
{
    public enum AbilityId
    {
        None = 0,
        Mantle = 1,
        WallJump = 2,
        EchoBow = 3,
        DoubleJump = 4,
        FireArrow = 5,
        GravityBeam = 6,
        Grapple = 7,
        PhaseDash = 8,
        RecoilShot = 9
    }

    [CreateAssetMenu(menuName = "Cradle of Titans/Ability Core", fileName = "Ability_")]
    public sealed class AbilityDefinition : ScriptableObject
    {
        [SerializeField] private AbilityId id;
        [SerializeField] private string displayName;
        [TextArea(2, 5)] [SerializeField] private string description;
        [SerializeField] private Sprite icon;
        [Header("Optional synergy")]
        [SerializeField] private AbilityId[] synergyRequirements;
        [SerializeField] private AbilityId synergyResult;

        public AbilityId Id => id;
        public string DisplayName => displayName;
        public string Description => description;
        public Sprite Icon => icon;
        public AbilityId[] SynergyRequirements => synergyRequirements;
        public AbilityId SynergyResult => synergyResult;
    }
}
