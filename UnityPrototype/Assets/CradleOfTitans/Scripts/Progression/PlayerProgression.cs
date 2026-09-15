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
        private readonly HashSet<AbilityId> runtimeUnlocks = new();

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

        public void Unlock(AbilityId id)
        {
            if (id == AbilityId.None || unlockedAbilities.Contains(id))
                return;

            runtimeUnlocks.Add(id);
            unlockedAbilities.Add(id);
            AbilityUnlocked?.Invoke(id);
            ResolveSynergies();
        }

        public void RebuildRuntimeState()
        {
            unlockedAbilities.Clear();

            foreach (AbilityId id in runtimeUnlocks)
                unlockedAbilities.Add(id);

            foreach (AbilityDefinition core in unlockedCores)
            {
                if (core != null)
                    unlockedAbilities.Add(core.Id);
            }

            ResolveSynergies();
        }

        private void ResolveSynergies()
        {
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

                    if (!allUnlocked)
                        continue;

                    unlockedAbilities.Add(core.SynergyResult);
                    AbilityUnlocked?.Invoke(core.SynergyResult);
                    changed = true;
                }
            }
            while (changed);
        }
    }
}
