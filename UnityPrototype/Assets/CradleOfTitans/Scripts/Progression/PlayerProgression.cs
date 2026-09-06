using System;
using System.Collections.Generic;
using CradleOfTitans.Data;
using UnityEngine;

namespace CradleOfTitans.Progression
{
    public sealed class PlayerProgression : MonoBehaviour
    {
        [SerializeField] private List<AbilityDefinition> unlockedCores = new();

        private readonly HashSet<AbilityId> unlockedAbilities = new();

        public event Action<AbilityId> AbilityUnlocked;

        private void Awake()
        {
            RebuildRuntimeState();
        }

        public bool Has(AbilityId id)
        {
            return id == AbilityId.None || unlockedAbilities.Contains(id);
        }

        public void Unlock(AbilityDefinition definition)
        {
            if (definition == null || unlockedCores.Contains(definition))
                return;

            unlockedCores.Add(definition);
            RebuildRuntimeState();
            AbilityUnlocked?.Invoke(definition.Id);
        }

        public void RebuildRuntimeState()
        {
            unlockedAbilities.Clear();

            foreach (AbilityDefinition core in unlockedCores)
            {
                if (core != null)
                    unlockedAbilities.Add(core.Id);
            }

            bool changed;
            do
            {
                changed = false;
                foreach (AbilityDefinition core in unlockedCores)
                {
                    if (core == null || core.SynergyResult == AbilityId.None || unlockedAbilities.Contains(core.SynergyResult))
                        continue;

                    AbilityId[] requirements = core.SynergyRequirements;
                    if (requirements == null || requirements.Length == 0)
                        continue;

                    bool allUnlocked = true;
                    foreach (AbilityId requirement in requirements)
                    {
                        if (!unlockedAbilities.Contains(requirement))
                        {
                            allUnlocked = false;
                            break;
                        }
                    }

                    if (allUnlocked)
                    {
                        unlockedAbilities.Add(core.SynergyResult);
                        AbilityUnlocked?.Invoke(core.SynergyResult);
                        changed = true;
                    }
                }
            }
            while (changed);
        }
    }
}
