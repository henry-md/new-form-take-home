## Scheduled Insight Reports

### 1 · Goal

Build a mini app that consumes our ad data api:

1. lets a user configure **one** recurring “insight report” (Meta or TikTok),
2. **schedules** it at the chosen cadence,
3. **generates** a report with a quick LLM summary + chart, and
4. **delivers** it **either** by email **or** by exposing a public link.

### 2 · Tech suggestions

| Layer       | Required / Suggested                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Next.js + (or Remix) + TypeScript                                                                                       |
| Styling     | Tailwind CSS                                                                                                               |
| UI lib      | shadcn/ui (or Chakra / Radix if faster)                                                                                    |
| Charting    | Any React chart lib                                                                                                        |
| Scheduler   | `node-cron`, `setInterval`, or Remix scheduler                                                                             |
| Persistence | Any solution is fine (KV, file, SQLite, Postgres)                                                                                          |
| Email       | Use an email service of choice or we can provide resend API keys |
| LLM         | Call whichever LLM you like (we can provide api keys)                                                              |

---

### 3 · Functional Spec

#### 3.1 Configure Report  (**single-page form**)

| Field             | Allowed Values                       | Validation                   |
| ----------------- | ------------------------------------ | ---------------------------- |
| Platform          | `meta` / `tiktok`                    | required                     |
| Metrics           | multi-select (see lists below)       | ≥ 1                          |
| Level             | per-platform select                  | required                     |
| Date Range Enum   | `last7` / `last14` / `last30`        | required                     |
| **Cadence**       | `manual`, `hourly`, `every 12 hours`, `daily` | required                     |
| **Delivery**      | `email` or `link`                    | required                     |
| Email (if chosen) | valid address                        | required if delivery = email |

Click **“Save & Start”** → stores config in memory & kicks off scheduler.

#### 3.2 Scheduler

* Runs according to selected cadence (use `node-cron` or `setInterval`).
* Allows **“Run Now”** button in UI (manual trigger).

#### 3.3 Report Builder (runs each tick)

1. Fetch metrics from `/sample-data/{platform}` with saved params.
2. Compose basic report with metrics, basic chart, and summary
3. Delivery (depends on chosen delivery format)
Return status (success/error) to a simple **Dashboard**.

#### 3.4 Dashboard

* Card with **last run** timestamp, **next run** countdown, and last error.
* “Run Now” button.
* If delivery = link, show **“Open Latest Report”** link.

---

### 4 · Allowed Params (for selects)

<details>
<summary>TikTok</summary>

```txt
metrics: spend, impressions, clicks, conversions, cost_per_conversion,
         conversion_rate, ctr, cpc, reach, frequency
level:   AUCTION_ADVERTISER • AUCTION_AD • AUCTION_CAMPAIGN
```

</details>

<details>
<summary>Meta</summary>

```txt
metrics: spend, impressions, clicks, ctr, conversions,
         cost_per_conversion, reach, frequency
level:   account • campaign • adset • ad
```

</details>

---

### 5 · What *Must* Work (Core ≈ 3 hrs)

1. **Form** saves a single report config.
2. Scheduler fires on chosen cadence **and** via “Run Now”.
3. Fetch, build HTML, embed LLM summary, render chart.
4. Deliver either by:

   * writing file & exposing link **or**
   * sending email (we’ll provide SMTP or SendGrid creds).
5. Dashboard shows last/next run + error.

*(Choose whichever delivery path is easiest for you; both not required.)*

---

### 6 · Stretch (bonus, totally optional)

| Idea                              | Hints                            |
| --------------------------------- | -------------------------------- |
| Allow multiple concurrent reports | Store array; map scheduler jobs. |
| Daily / weekly cron expressions   | `cron-parser`                    |
| PDF attachment                    | `html-pdf` or `puppeteer`        |
| Signed URLs for public reports    | Pre-signed token param           |

---

### 8 · Submission

1. Send me a Github repo link (and if hosted live link). If repo is private share with alec2435


---
### Appendix -- API Spec
**Base URL:** https://bizdev.newform.ai

**Endpoints:**

1. **TikTok:**
   - **POST** /sample-data/tiktok
   - **Body Parameters:**
     - metrics: An array of metrics (e.g. ["spend", "impressions", "clicks"]).
     - dimensions: An array of dimensions (e.g. ["ad_id", "country_code", "age"]).
     - level: One of ["AUCTION_ADVERTISER", "AUCTION_AD", "AUCTION_CAMPAIGN"].
     - dateRangeEnum (optional): One of ["LAST_7_DAYS", "LAST_14_DAYS", "LAST_30_DAYS", "LIFETIME"].
     - dateRange (optional): An object with { from: Date, to: Date } if no preset is used.
     - reportType (optional): ["BASIC", "AUDIENCE"].

   See the provided code snippet for a full list of allowed metrics/dimensions.

2. **Meta:**
   - **POST** /sample-data/meta
   - **Body Parameters:**
     - metrics: An array of metrics (e.g. ["spend", "impressions", "clicks"]).
     - level: One of ["account", "campaign", "adset", "ad"].
     - breakdowns: An array of breakdowns (e.g. ["age", "country", "impression_device"]).
     - timeIncrement (optional): One of ["1", "7", "28", "monthly", "quarterly", "yearly", "all_days"].
     - dateRangeEnum (optional): One of ["LAST_7_DAYS", "LAST_14_DAYS", "LAST_30_DAYS", "LIFETIME"].
     - dateRange (optional): If not using preset, provide { from: Date, to: Date }.

**Token:**  
Include the token NEWFORMCODINGCHALLENGE in the request headers. The exact header name will be provided (e.g., Authorization: Bearer NEWFORMCODINGCHALLENGE).

### Detailed params

Below are the lists of valid parameters based on the provided code snippet.

---

### TikTok Endpoint

**URL:** POST /sample-data/tiktok

**Parameters:**

- **metrics (array):**  
  - "spend"
  - "impressions"
  - "clicks"
  - "conversions"
  - "cost_per_conversion"
  - "conversion_rate"
  - "ctr"
  - "cpc"
  - "reach"
  - "frequency"
  - "skan_app_install"
  - "skan_cost_per_app_install"
  - "skan_purchase"
  - "skan_cost_per_purchase"

- **dimensions (array):**  
  - "ad_id"
  - "campaign_id"
  - "adgroup_id"
  - "advertiser_id"
  - "stat_time_day"
  - "campaign_name"
  - "adgroup_name"
  - "ad_name"
  - "country_code"
  - "age"
  - "gender"
  - "province_id"
  - "dma_id"

- **level (string):**  
  - "AUCTION_ADVERTISER"
  - "AUCTION_AD"
  - "AUCTION_CAMPAIGN"

- **dateRangeEnum (optional, string):**  
  - "last7"
  - "last14"
  - "last30"
  - "lifetime"

- **dateRange (optional, object):**  
  
json
  {
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD"
  }

  Used when dateRangeEnum is undefined.

- **reportType (optional, string):**  
  - "BASIC"
  - "AUDIENCE"



---

### Meta Endpoint

**URL:** POST /sample-data/meta

**Parameters:**

- **metrics (array):**  
  - "spend"
  - "impressions"
  - "clicks"
  - "ctr"
  - "cpc"
  - "reach"
  - "frequency"
  - "conversions"
  - "cost_per_conversion"
  - "conversion_rate"
  - "actions"
  - "cost_per_action_type"

- **level (string):**  
  - "account"
  - "campaign"
  - "adset"
  - "ad"

- **breakdowns (array):**  
  - "age"
  - "gender"
  - "country"
  - "region"
  - "dma"
  - "impression_device"
  - "platform_position"
  - "publisher_platform"

- **timeIncrement (optional, string):**  
  - "1"
  - "7"
  - "28"
  - "monthly"
  - "quarterly"
  - "yearly"
  - "all_days"

- **dateRangeEnum (optional, string):**  
  - "last7"
  - "last14"
  - "last30"
  - "lifetime"

- **dateRange (optional, object):**  
  
json
  {
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD"
  }

  Used when dateRangeEnum is undefined.

** Example Request **

curl --location 'https://bizdev.newform.ai/sample-data/meta' \
--header 'Content-Type: application/json' \
--data '{
  "metrics": [
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "conversions",
    "cost_per_conversion"
  ],
  "level": "campaign",
  "breakdowns": [
    "age"
  ],
  "timeIncrement": "7",
  "dateRangeEnum": "last30"
}'


---

Use these lists as references when constructing requests to the /sample-data/tiktok and /sample-data/meta endpoints.