using System;
using System.Collections.Generic;
using CradleOfTitans.Data;
using UnityEngine;

namespace CradleOfTitans.Inventory
{
    [Serializable]
    public sealed class ItemStack
    {
        public ItemDefinition item;
        [Min(1)] public int quantity = 1;
    }

    public sealed class InventoryRuntime : MonoBehaviour
    {
        [Min(1)] [SerializeField] private int slotCapacity = 24;
        [SerializeField] private List<ItemStack> stacks = new();
        [SerializeField] private WeaponDefinition equippedWeapon;

        public IReadOnlyList<ItemStack> Stacks => stacks;
        public WeaponDefinition EquippedWeapon => equippedWeapon;

        public bool Add(ItemDefinition item, int quantity = 1)
        {
            if (item == null || quantity <= 0)
                return false;

            foreach (ItemStack stack in stacks)
            {
                if (stack.item != item || stack.quantity >= item.MaxStack)
                    continue;

                int accepted = Mathf.Min(quantity, item.MaxStack - stack.quantity);
                stack.quantity += accepted;
                quantity -= accepted;
                if (quantity == 0)
                    return true;
            }

            while (quantity > 0)
            {
                if (stacks.Count >= slotCapacity)
                    return false;

                int accepted = Mathf.Min(quantity, item.MaxStack);
                stacks.Add(new ItemStack { item = item, quantity = accepted });
                quantity -= accepted;
            }

            return true;
        }

        public bool Remove(ItemDefinition item, int quantity = 1)
        {
            if (item == null || quantity <= 0 || Count(item) < quantity)
                return false;

            for (int i = stacks.Count - 1; i >= 0 && quantity > 0; i--)
            {
                ItemStack stack = stacks[i];
                if (stack.item != item)
                    continue;

                int removed = Mathf.Min(quantity, stack.quantity);
                stack.quantity -= removed;
                quantity -= removed;
                if (stack.quantity <= 0)
                    stacks.RemoveAt(i);
            }

            if (equippedWeapon == item && Count(item) == 0)
                equippedWeapon = null;

            return true;
        }

        public int Count(ItemDefinition item)
        {
            int count = 0;
            foreach (ItemStack stack in stacks)
                if (stack.item == item)
                    count += stack.quantity;
            return count;
        }

        public bool Equip(WeaponDefinition weapon)
        {
            if (weapon == null || Count(weapon) <= 0)
                return false;

            equippedWeapon = weapon;
            return true;
        }
    }
}
