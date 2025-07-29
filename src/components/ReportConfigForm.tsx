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
    <div className="flex justify-center items-start min-h-screen bg-gray-50 w-full max-w-[600px] mx-auto">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Configure Report</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel>Metrics</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {metricsOptions.map((metric) => (
                      <FormField
                        key={metric}
                        control={form.control}
                        name="metrics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
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
                  <FormLabel>Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormLabel>Date Range</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a date range" />
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
                    <FormLabel>Custom Date Range</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="text-sm text-gray-600">From</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value?.from || ""}
                            onChange={(e) => field.onChange({
                              ...field.value,
                              from: e.target.value
                            })}
                            placeholder="YYYY-MM-DD"
                          />
                        </FormControl>
                      </div>
                      <div>
                        <FormLabel className="text-sm text-gray-600">To</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value?.to || ""}
                            onChange={(e) => field.onChange({
                              ...field.value,
                              to: e.target.value
                            })}
                            placeholder="YYYY-MM-DD"
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
                  <FormLabel>Cadence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cadence" />
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
                  <FormLabel>Delivery</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a delivery method" />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {delivery === "link" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-blue-500 text-lg">🔗</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Public Link Selected
                    </h4>
                    <p className="text-sm text-blue-700">
                      Reports will be generated and accessible from your dashboard. 
                      You&apos;ll receive a shareable link that you can access anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="mt-4 w-full">
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