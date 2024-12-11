import { GraphNode } from "types";
import { getOCFDataBySecurityId } from "../../get-ocf-data-by-security-id";
import { ocfPackage as FourYearMonthly1YearCliff } from "../../tests/testOcfPackages/four-year-monthly-with-1-year-cliff";
import { parseISO } from "date-fns";
import { ocfPackage as DeliberateCycle } from "../../tests/testOcfPackages/deliberate-cycle";
import { ocfPackage as NoRootNodes } from "../../tests/testOcfPackages/no-root-nodes";
import { createExecutionStack } from "../create-execution-stack";
import { createVestingGraph } from "../../create-vesting-graph";
import { OcfPackageContent } from "read_ocf_package";

const getExecutionStack = (
  ocfPackage: OcfPackageContent,
  securityId: string
): Map<string, GraphNode> => {
  /**********************************
   * Get OCF Data for the securityId
   **********************************/

  const ocfData = getOCFDataBySecurityId(ocfPackage, securityId);

  /******************************
   * Prepare vesting conditions
   ******************************/
  const vestingConditions = ocfData.issuanceVestingTerms!.vesting_conditions;
  const graphNodes = vestingConditions.map((vc) => {
    const graphNode: GraphNode = {
      ...vc,
      part_of_relationship: undefined,
      triggeredDate: undefined,
      prior_condition_ids: [],
    };

    return graphNode;
  });

  /******************************
   * Create vesting graph
   ******************************/
  const { graph, rootNodes } = createVestingGraph(graphNodes);

  /******************************
   * Create the execution stack
   ******************************/
  const executionStack = createExecutionStack(graph, rootNodes, ocfData);

  return executionStack;
};

describe("4 year monthly with one year cliff", () => {
  const executionStack = getExecutionStack(
    FourYearMonthly1YearCliff,
    "equity_compensation_issuance_01"
  );

  test("Stack should be as expected", () => {
    const expectedStack = new Map<string, GraphNode>([
      [
        "start_condition",
        {
          id: "start_condition",
          description: "start_condition",
          portion: {
            numerator: "0",
            denominator: "48",
          },
          trigger: {
            type: "VESTING_START_DATE",
          },
          next_condition_ids: ["monthly_vesting_condition"],
          prior_condition_ids: [],
          part_of_relationship: undefined,
          triggeredDate: parseISO("2024-06-01"),
        },
      ],
      [
        "monthly_vesting_condition",
        {
          id: "monthly_vesting_condition",
          description: "1/48 payout each month",
          portion: {
            numerator: "1",
            denominator: "48",
          },
          trigger: {
            type: "VESTING_SCHEDULE_RELATIVE",
            period: {
              length: 1,
              type: "MONTHS",
              occurrences: 48,
              day_of_month: "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH",
              cliff_installment: 12,
            },
            relative_to_condition_id: "start_condition",
          },
          next_condition_ids: [],
          prior_condition_ids: ["start_condition"],
          part_of_relationship: undefined,
          triggeredDate: parseISO("2024-06-01"),
        },
      ],
    ]);

    expect(executionStack).toStrictEqual(expectedStack);
  });
});

describe("Deliberate cycle", () => {
  test("Should throw an error when cycle is detected", () => {
    expect(() =>
      getExecutionStack(DeliberateCycle, "equity_compensation_issuance_01")
    ).toThrow("Cycle detected involving the vesting condition with id 2");
  });
});

describe("No root nodes", () => {
  test("Should throw an error when cycle is detected", () => {
    expect(() =>
      getExecutionStack(NoRootNodes, "equity_compensation_issuance_01")
    ).toThrow(`The graph does not have any root nodes`);
  });
});
