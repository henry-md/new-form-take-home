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

const metaMetrics = [
  "spend", "impressions", "clicks", "ctr", "conversions",
  "cost_per_conversion", "reach", "frequency"
];
const tiktokMetrics = [
  "spend", "impressions", "clicks", "conversions", "cost_per_conversion",
  "conversion_rate", "ctr", "cpc", "reach", "frequency"
];

const metaLevels = [
  { value: "account", label: "Account" },
  { value: "campaign", label: "Campaign" },
  { value: "adset", label: "Ad Set" },
  { value: "ad", label: "Ad" },
];
const tiktokLevels = [
  { value: "AUCTION_ADVERTISER", label: "Advertiser" },
  { value: "AUCTION_AD", label: "Ad" },
  { value: "AUCTION_CAMPAIGN", label: "Campaign" },
];

const dateRanges = [
  { value: "last7", label: "Last 7 Days" },
  { value: "last14", label: "Last 14 Days" },
  { value: "last30", label: "Last 30 Days" },
];

const cadences = [
  { value: "manual", label: "Manual" },
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
  dateRange: z.enum(["last7", "last14", "last30"]),
  cadence: z.enum(["manual", "hourly", "every12h", "daily"]),
  delivery: z.enum(["email", "link"]),
  email: z.string().email("Invalid email").optional(),
}).refine(
  (data) => data.delivery === "link" || !!data.email,
  { message: "Email is required if delivery is email", path: ["email"] }
);

type FormValues = z.infer<typeof formSchema>;

const ReportConfigForm = ({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<FormValues>;
}) => {
  // useForm is a hook that returns a form object with a control, handleSubmit, watch, and formState.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "meta",
      metrics: [],
      level: "",
      dateRange: "last7",
      cadence: "manual",
      delivery: "email",
      email: "",
      ...defaultValues,
    },
  });

  const platform = form.watch("platform");
  const delivery = form.watch("delivery");

  const metricsOptions = platform === "meta" ? metaMetrics : tiktokMetrics;
  const levelOptions = platform === "meta" ? metaLevels : tiktokLevels;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 pt-16 w-full max-w-[600px] mx-auto">
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metrics</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {metricsOptions.map((metric) => (
                        <Checkbox
                          key={metric}
                          checked={field.value?.includes(metric)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, metric]);
                            } else {
                              field.onChange(field.value.filter((m: string) => m !== metric));
                            }
                          }}
                        >
                          {metric}
                        </Checkbox>
                      ))}
                    </div>
                  </FormControl>
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
              name="dateRange"
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
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="mt-4 w-full">
              Save & Start
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export { ReportConfigForm, type FormValues };