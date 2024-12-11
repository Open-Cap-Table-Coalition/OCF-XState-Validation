import type {
  Earlier_Of_Trigger,
  GraphNode,
  Later_Of_Trigger,
  VestingAbsoluteTrigger,
  VestingEventTrigger,
  VestingRelativeTrigger,
  VestingStartTrigger,
} from "types";

export const buildUnpopulatedGraphNode = (
  id: string,
  next_condition_ids: string[],
  trigger:
    | VestingStartTrigger
    | VestingAbsoluteTrigger
    | VestingEventTrigger
    | VestingRelativeTrigger
    | Earlier_Of_Trigger
    | Later_Of_Trigger
) => {
  return {
    id: id,
    description: id,
    trigger: trigger,
    next_condition_ids: next_condition_ids,
    prior_condition_ids: [],
    part_of_relationship: undefined,
    triggeredDate: undefined,
  } as GraphNode;
};

export const buildPopulatedGraphNode = (
  unpopulatedNode: GraphNode,
  prior_condition_ids: string[],
  part_of_relationship?: boolean
) => {
  return {
    ...unpopulatedNode,
    prior_condition_ids,
    part_of_relationship,
  } as GraphNode;
};
