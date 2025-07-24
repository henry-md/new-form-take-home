import fetch from "node-fetch";

const BASE_URL = "https://bizdev.newform.ai/sample-data/tiktok";
const AUTH_HEADER = "NEWFORMCODINGCHALLENGE";

const metricsList = [
  "spend",
  "impressions",
  "clicks",
  "conversions",
  "cost_per_conversion",
  "conversion_rate",
  "ctr",
  "cpc",
  "reach",
  "frequency",
  "skan_app_install",
  "skan_cost_per_app_install",
  "skan_purchase",
  "skan_cost_per_purchase",
];
const dimensionsList = [
  "ad_id",
  "campaign_id",
  "adgroup_id",
  "advertiser_id",
  "stat_time_day",
  "campaign_name",
  "adgroup_name",
  "ad_name",
  "country_code",
  "age",
  "gender",
  "province_id",
  "dma_id",
];
const levelList = ["AUCTION_ADVERTISER", "AUCTION_AD", "AUCTION_CAMPAIGN"];
const dateRangeEnumList = ["last7", "last14", "last30", "lifetime"];
const reportTypeList = ["BASIC", "AUDIENCE"];

function getCombinations(arr, min = 1, max = 3) {
  // Returns all combinations of arr with length between min and max
  const results = [];
  for (let len = min; len <= max; len++) {
    const combine = (start, combo) => {
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

// Add delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test single request first
async function testSingleRequest() {
  console.log("Testing single request first...");
  const testBody = {
    metrics: ["spend"],
    dimensions: ["ad_id"],
    level: "AUCTION_ADVERTISER",
    dateRangeEnum: "last7",
    reportType: "BASIC",
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
      console.log("✅ Single request successful!");
      return true;
    } else {
      console.log("❌ Single request failed");
      return false;
    }
  } catch (e) {
    console.error("❌ Single request error:", e.message);
    return false;
  }
}

async function testTikTokApi() {
  // Test single request first
  const singleTestPassed = await testSingleRequest();
  if (!singleTestPassed) {
    console.log("Stopping full test due to single request failure");
    return;
  }

  console.log("\nStarting full test...");

  const metricsCombos = getCombinations(metricsList, 1, 2); // keep small for demo
  const dimensionsCombos = getCombinations(dimensionsList, 1, 2); // keep small for demo

  console.log(`Testing ${metricsCombos.length} metrics combinations`);
  console.log(`Testing ${dimensionsCombos.length} dimensions combinations`);
  console.log(`Testing ${levelList.length} levels`);
  console.log(`Testing ${dateRangeEnumList.length} date ranges`);
  console.log(`Testing ${reportTypeList.length} report types`);

  const totalCombinations =
    metricsCombos.length *
    dimensionsCombos.length *
    levelList.length *
    dateRangeEnumList.length *
    reportTypeList.length;
  console.log(`Total combinations to test: ${totalCombinations}`);
  console.log("Starting tests...\n");

  let processedCount = 0;

  for (const level of levelList) {
    for (const metrics of metricsCombos) {
      for (const dimensions of dimensionsCombos) {
        for (const dateRangeEnum of dateRangeEnumList) {
          for (const reportType of reportTypeList) {
            processedCount++;

            if (processedCount % 10 === 0) {
              console.log(
                `Progress: ${processedCount}/${totalCombinations} (${Math.round(
                  (processedCount / totalCombinations) * 100
                )}%)`
              );
            }
            const body = {
              metrics,
              dimensions,
              level,
              dateRangeEnum,
              reportType,
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

              // Check if response is ok
              if (!res.ok) {
                const errorText = await res.text();
                console.error(
                  `HTTP ${res.status}: ${errorText} for input:`,
                  body
                );
                continue;
              }

              const data = await res.json();
              // Only log if data contains non-empty array or non-empty string fields
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

              // Add delay to avoid rate limiting
              await delay(100); // 100ms delay between requests
            } catch (e) {
              console.error("Error for input", body, e.message);
            }
          }
        }
      }
    }
  }

  console.log(`\nCompleted! Processed ${processedCount} combinations.`);
}

testTikTokApi();
