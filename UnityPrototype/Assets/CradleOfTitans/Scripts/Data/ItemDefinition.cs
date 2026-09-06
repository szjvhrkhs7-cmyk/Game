using UnityEngine;

namespace CradleOfTitans.Data
{
    public enum ItemCategory
    {
        Resource,
        Quest,
        Weapon,
        Lore
    }

    [CreateAssetMenu(menuName = "Cradle of Titans/Item", fileName = "Item_")]
    public class ItemDefinition : ScriptableObject
    {
        [SerializeField] private string id;
        [SerializeField] private string displayName;
        [TextArea(2, 5)] [SerializeField] private string description;
        [SerializeField] private Sprite icon;
        [SerializeField] private ItemCategory category;
        [Min(1)] [SerializeField] private int maxStack = 1;

        public string Id => id;
        public string DisplayName => displayName;
        public string Description => description;
        public Sprite Icon => icon;
        public ItemCategory Category => category;
        public int MaxStack => Mathf.Max(1, maxStack);
    }
}
