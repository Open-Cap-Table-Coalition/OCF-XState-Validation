import { createVestingGraph } from "../../create-vesting-graph";
import type { GraphNode } from "types";
import {
  buildPopulatedGraphNode,
  buildUnpopulatedGraphNode,
} from "./graph-builder";
import { formatISO } from "date-fns";

describe("Four Year Monthly With 1 Year Cliff", () => {
  const graphNodes: GraphNode[] = [
    {
      id: "vesting-start",
      description: "vesting start",
      trigger: {
        type: "VESTING_START_DATE",
      },
      next_condition_ids: ["monthly-vesting"],
      prior_condition_ids: [],
      part_of_relationship: undefined,
      triggeredDate: undefined,
    },

    {
      id: "monthly-vesting",
      description: "monthly vesting",
      trigger: {
        type: "VESTING_SCHEDULE_RELATIVE",
        period: {
          length: 1,
          type: "MONTHS",
          occurrences: 48,
          day_of_month: "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH",
          cliff_installment: 12,
        },
        relative_to_condition_id: "vesting-start",
      },
      next_condition_ids: [],
      prior_condition_ids: [],
      part_of_relationship: undefined,
      triggeredDate: undefined,
    },
  ];

  const vestingGraph = createVestingGraph(graphNodes);

  const expectedRootNodes = ["vesting-start"];
  const expectedGraph = new Map<string, GraphNode>([
    [
      "vesting-start",
      {
        id: "vesting-start",
        description: "vesting start",
        trigger: {
          type: "VESTING_START_DATE",
        },
        next_condition_ids: ["monthly-vesting"],
        prior_condition_ids: [],
        part_of_relationship: undefined,
        triggeredDate: undefined,
      },
    ],
    [
      "monthly-vesting",
      {
        id: "monthly-vesting",
        description: "monthly vesting",
        trigger: {
          type: "VESTING_SCHEDULE_RELATIVE",
          period: {
            length: 1,
            type: "MONTHS",
            occurrences: 48,
            day_of_month: "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH",
            cliff_installment: 12,
          },
          relative_to_condition_id: "vesting-start",
        },
        next_condition_ids: [],
        prior_condition_ids: ["vesting-start"],
        part_of_relationship: undefined,
        triggeredDate: undefined,
      },
    ],
  ]);

  test("Expect root nodes to return as expected", () => {
    expect(vestingGraph.rootNodes).toStrictEqual(expectedRootNodes);
  });

  test("Expected populated graph to return as expected", () => {
    expect(vestingGraph.graph).toStrictEqual(expectedGraph);
  });
});

describe("Start followed by event", () => {
  const first = buildUnpopulatedGraphNode("first", ["second"], {
    type: "VESTING_START_DATE",
  });
  const second = buildUnpopulatedGraphNode("second", [], {
    type: "VESTING_EVENT",
  });

  const vestingGraph = createVestingGraph([first, second]);

  const expectedRootNodes = [first.id];

  const expectedGraph = new Map<string, GraphNode>([
    [first.id, buildPopulatedGraphNode(first, [])],
    [second.id, buildPopulatedGraphNode(second, [first.id])],
  ]);

  test("Expect root nodes to return as expected", () => {
    expect(vestingGraph.rootNodes).toStrictEqual(expectedRootNodes);
  });

  test("Expect populated graph to return as expected", () => {
    expect(vestingGraph.graph).toStrictEqual(expectedGraph);
  });
});

describe("Two events with expiration dates in a later of relationship", () => {
  const start = buildUnpopulatedGraphNode(
    "vesting-start",
    ["event-A", "event-A-expiration", "event-B", "event-B-expiration"],
    {
      type: "VESTING_START_DATE",
    }
  );
  const eventA = buildUnpopulatedGraphNode("event-A", ["event-A-earlier-of"], {
    type: "VESTING_EVENT",
  });
  const eventAExpiration = buildUnpopulatedGraphNode(
    "event-A-expiration",
    ["event-A-earlier-of"],
    {
      type: "VESTING_SCHEDULE_ABSOLUTE",
      date: formatISO(new Date()),
    }
  );
  const eventB = buildUnpopulatedGraphNode("event-B", ["event-B-earlier-of"], {
    type: "VESTING_EVENT",
  });
  const eventBExpiration = buildUnpopulatedGraphNode(
    "event-B-expiration",
    ["event-B-earlier-of"],
    {
      type: "VESTING_SCHEDULE_ABSOLUTE",
      date: formatISO(new Date()),
    }
  );
  const eventAEarlierOf = buildUnpopulatedGraphNode(
    "event-A-earlier-of",
    ["later-of"],
    {
      type: "VESTING_RELATIONSHIP_EARLIER_OF",
      input_condition_ids: ["event-A", "event-A-expiration"],
    }
  );
  const eventBEarlierOf = buildUnpopulatedGraphNode(
    "event-B-earlier-of",
    ["later-of"],
    {
      type: "VESTING_RELATIONSHIP_EARLIER_OF",
      input_condition_ids: ["event-B", "event-B-expiration"],
    }
  );
  const laterOf = buildUnpopulatedGraphNode("later-of", [], {
    type: "VESTING_RELATIONSHIP_LATER_OF",
    input_condition_ids: ["event-A-earlier-of", "event-B-earlier-of"],
    calculation_type: "SUM",
  });

  const vestingGraph = createVestingGraph([
    start,
    eventA,
    eventAExpiration,
    eventB,
    eventBExpiration,
    eventAEarlierOf,
    eventBEarlierOf,
    laterOf,
  ]);

  const expectedRootNodes = [start.id];

  const expectedGraph = new Map<string, GraphNode>([
    [start.id, buildPopulatedGraphNode(start, [])],
    [eventA.id, buildPopulatedGraphNode(eventA, [start.id], true)],
    [
      eventAExpiration.id,
      buildPopulatedGraphNode(eventAExpiration, [start.id], true),
    ],
    [eventB.id, buildPopulatedGraphNode(eventB, [start.id], true)],
    [
      eventBExpiration.id,
      buildPopulatedGraphNode(eventBExpiration, [start.id], true),
    ],
    [
      eventAEarlierOf.id,
      buildPopulatedGraphNode(
        eventAEarlierOf,
        [eventAExpiration.id, eventA.id],
        true
      ),
    ],
    [
      eventBEarlierOf.id,
      buildPopulatedGraphNode(
        eventBEarlierOf,
        [eventBExpiration.id, eventB.id],
        true
      ),
    ],
    [
      laterOf.id,
      buildPopulatedGraphNode(laterOf, [
        eventBEarlierOf.id,
        eventAEarlierOf.id,
      ]),
    ],
  ]);

  test("Expect root nodes to return as expected", () => {
    expect(vestingGraph.rootNodes).toStrictEqual(expectedRootNodes);
  });

  test("Expect populated graph to return as expected", () => {
    expect(vestingGraph.graph).toStrictEqual(expectedGraph);
  });
});
