"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";  
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Enums & Constants
const platforms = [
  { value: "meta", label: "Meta" },
  { value: "tiktok", label: "TikTok" },
] as const; // infer most specific type possible — strings become literal types, not just strings.

const tiktokMetrics = [
  "spend", "impressions", "clicks", "conversions", "cost_per_conversion",
  "conversion_rate", "ctr", "cpc", "reach", "frequency"
];
const metaMetrics = [
  "spend", "impressions", "clicks", "ctr", "conversions",
  "cost_per_conversion", "reach", "frequency"
];

const tiktokLevels = [
  { value: "AUCTION_ADVERTISER", label: "Advertiser" },
  { value: "AUCTION_AD", label: "Ad" },
  { value: "AUCTION_CAMPAIGN", label: "Campaign" },
];

const metaLevels = [
  { value: "account", label: "Account" },
  { value: "campaign", label: "Campaign" },
  { value: "adset", label: "Ad Set" },
  { value: "ad", label: "Ad" },
];

const dateRanges = [
  { value: "last7", label: "Last 7 Days" },
  { value: "last14", label: "Last 14 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

const cadences = [
  { value: "manual", label: "Manual" },
  { value: "every_minute", label: "Every Minute" },
  { value: "hourly", label: "Hourly" },
  { value: "every12h", label: "Every 12 Hours" },
  { value: "daily", label: "Daily" },
];

const deliveries = [
  { value: "email", label: "Email" },
  { value: "link", label: "Public Link" },
];

// Zod form schema for validation
const formSchema = z.object({
  platform: z.enum(["meta", "tiktok"]),
  metrics: z.array(z.string()).min(1, "Select at least one metric"),
  level: z.string().min(1, "Level is required"),
  dateRangeEnum: z.enum(["last7", "last14", "last30", "custom"]),
  dateRange: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  }).optional(),
  cadence: z.enum(["manual", "every_minute", "hourly", "every12h", "daily"]),
  delivery: z.enum(["email", "link"]),
  email: z.string().optional(),
}).refine(
  (data) => {
    if (data.delivery === "email") {
      return data.email && data.email.length > 0 && z.string().email().safeParse(data.email).success;
    }
    return true;
  },
  { message: "Valid email is required when delivery method is email", path: ["email"] }
).refine(
  (data) => data.dateRangeEnum !== "custom" || !!data.dateRange,
  { message: "Custom date range is required when Custom Range is selected", path: ["dateRange"] }
).refine(
  (data) => {
    if (data.dateRangeEnum === "custom" && data.dateRange) {
      return new Date(data.dateRange.from) <= new Date(data.dateRange.to);
    }
    return true;
  },
  { message: "From date must be before or equal to To date", path: ["dateRange"] }
);

// Should be typecast-able to ReportParams
type FormValues = z.infer<typeof formSchema>;

const ReportConfigForm = ({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<FormValues>;
}) => {
  // useForm is a hook that returns a form object with a control, handleSubmit, watch, and formState.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "meta",
      metrics: [],
      level: "",
      dateRangeEnum: "last7",
      dateRange: undefined,
      cadence: "manual",
      delivery: "email",
      email: undefined,
      ...defaultValues,
    },
  });

  const platform = form.watch("platform");
  const delivery = form.watch("delivery");
  const dateRangeEnum = form.watch("dateRangeEnum");

  const metricsOptions = platform === "meta" ? metaMetrics : tiktokMetrics;
  const levelOptions = platform === "meta" ? metaLevels : tiktokLevels;

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">⚙️ Configure Report</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metrics"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Metrics</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {metricsOptions.map((metric) => (
                      <FormField
                        key={metric}
                        control={form.control}
                        name="metrics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 sm:space-x-3 space-y-0 p-2 rounded border hover:bg-gray-50">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(metric)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, metric])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== metric
                                        )
                                      )
                                }}
                                className="shrink-0"
                              />
                            </FormControl>
                            <FormLabel className="text-xs sm:text-sm font-normal cursor-pointer flex-1 leading-tight">
                              {metric}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levelOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRangeEnum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Date Range</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dateRanges.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {dateRangeEnum === "custom" && (
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Custom Date Range</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <FormLabel className="text-xs sm:text-sm text-gray-600 mb-1 block">From</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value?.from || ""}
                            onChange={(e) => field.onChange({
                              ...field.value,
                              from: e.target.value
                            })}
                            placeholder="YYYY-MM-DD"
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                      </div>
                      <div>
                        <FormLabel className="text-xs sm:text-sm text-gray-600 mb-1 block">To</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value?.to || ""}
                            onChange={(e) => field.onChange({
                              ...field.value,
                              to: e.target.value
                            })}
                            placeholder="YYYY-MM-DD"
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cadence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Cadence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select cadence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cadences.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Delivery</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deliveries.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {delivery === "email" && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        {...field}
                        value={field.value || ""}
                        className="h-10 sm:h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {delivery === "link" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-blue-500 text-base sm:text-lg">🔗</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
                      Public Link Selected
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                      Reports will be generated and accessible from your dashboard. 
                      You&apos;ll receive a secure shareable link with 24-hour expiration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium">
              {delivery === "link" 
                ? "📊 Create Report & Generate Link" 
                : "📧 Save & Start Email Reports"
              }
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export { ReportConfigForm, type FormValues };