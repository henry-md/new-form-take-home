import fetch from "node-fetch";

const BASE_URL = "https://bizdev.newform.ai/sample-data/meta";
const AUTH_HEADER = "NEWFORMCODINGCHALLENGE";

const metricsList = [
  "spend",
  "impressions", 
  "clicks",
  "ctr",
  "cpc",
  "reach",
  "frequency",
  "conversions",
  "cost_per_conversion",
  "convrersion_rate",
  "actions",
  "cost_per_action_type",
] as const;

const levelList = ["account", "campaign", "adset", "ad"] as const;

const breakdownsList = [
  "age",
  "gender", 
  "country",
  "region",
  "dma",
  "impression_device",
  "platform_position",
  "publisher_platform",
] as const;

const timeIncrementList = ["1", "7", "28", "monthly", "quarterly", "yearly", "all_days"] as const;
const dateRangeEnumList = ["last7", "last14", "last30", "lifetime"] as const;

type MetaRequestBody = {
  metrics: string[];
  level: string;
  breakdowns: string[];
  timeIncrement?: string;
  dateRangeEnum: string;
};

function getCombinations<T>(arr: readonly T[], min = 1, max = 3): T[][] {
  const results: T[][] = [];
  for (let len = min; len <= max; len++) {
    const combine = (start: number, combo: T[]): void => {
      if (combo.length === len) {
        results.push(combo);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combine(i + 1, combo.concat([arr[i]]));
      }
    };
    combine(0, []);
  }
  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testSingleRequest(): Promise<boolean> {
  console.log("Testing single Meta request first...");
  const testBody: MetaRequestBody = {
    metrics: ["spend"],
    level: "campaign",
    breakdowns: ["age"],
    timeIncrement: "7",
    dateRangeEnum: "last7",
  };

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify(testBody),
    });

    console.log(`Status: ${res.status}`);
    const responseText = await res.text();
    console.log(`Response: ${responseText}`);

    if (res.ok) {
      console.log("✅ Single Meta request successful!");
      return true;
    } else {
      console.log("❌ Single Meta request failed");
      return false;
    }
  } catch (e) {
    console.error("❌ Single Meta request error:", e instanceof Error ? e.message : 'Unknown error');
    return false;
  }
}

async function testMetaApi(): Promise<void> {
  const singleTestPassed = await testSingleRequest();
  if (!singleTestPassed) {
    console.log("Stopping full test due to single request failure");
    return;
  }

  console.log("\nStarting full Meta test...");

  const metricsCombos = getCombinations(metricsList, 1, 2);
  const breakdownsCombos = getCombinations(breakdownsList, 1, 2);

  console.log(`Testing ${metricsCombos.length} metrics combinations`);
  console.log(`Testing ${breakdownsCombos.length} breakdowns combinations`);
  console.log(`Testing ${levelList.length} levels`);
  console.log(`Testing ${dateRangeEnumList.length} date ranges`);
  console.log(`Testing ${timeIncrementList.length} time increments`);

  const totalCombinations =
    metricsCombos.length *
    breakdownsCombos.length *
    levelList.length *
    dateRangeEnumList.length *
    timeIncrementList.length;
  console.log(`Total combinations to test: ${totalCombinations}`);
  console.log("Starting Meta tests...\n");

  let processedCount = 0;

  for (const level of levelList) {
    for (const metrics of metricsCombos) {
      for (const breakdowns of breakdownsCombos) {
        for (const dateRangeEnum of dateRangeEnumList) {
          for (const timeIncrement of timeIncrementList) {
            processedCount++;

            if (processedCount % 10 === 0) {
              console.log(
                `Progress: ${processedCount}/${totalCombinations} (${Math.round(
                  (processedCount / totalCombinations) * 100
                )}%)`
              );
            }
            const body: MetaRequestBody = {
              metrics,
              level,
              breakdowns,
              timeIncrement,
              dateRangeEnum,
            };
            try {
              const res = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: AUTH_HEADER,
                },
                body: JSON.stringify(body),
              });

              if (!res.ok) {
                const errorText = await res.text();
                console.error(
                  `HTTP ${res.status}: ${errorText} for input:`,
                  body
                );
                continue;
              }

              const data: unknown = await res.json();
              if (data && typeof data === "object") {
                const hasNonEmptyArray = Object.values(data).some(
                  (v) => Array.isArray(v) && v.length > 0
                );
                const hasNonEmptyString = Object.values(data).some(
                  (v) => typeof v === "string" && v.trim() !== ""
                );
                if (hasNonEmptyArray || hasNonEmptyString) {
                  console.log("INPUT:", body);
                  console.log("OUTPUT:", data);
                  console.log("---");
                }
              }

              await delay(100);
            } catch (e) {
              console.error("Error for input", body, e instanceof Error ? e.message : 'Unknown error');
            }
          }
        }
      }
    }
  }

  console.log(`\nCompleted! Processed ${processedCount} combinations.`);
}

testMetaApi();
