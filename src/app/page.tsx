"use client";

import { ReportConfigForm, type FormValues } from "@/components/ReportConfigForm";
// import useUserEmail from "@/hooks/use-test";
// import useHello from "@/hooks/use-hello";

export default function Home() {
  // const { email, loading, error } = useUserEmail("Henry");
  // const { loading: helloLoading, text } = useHello();

  const handleSubmit = (data: FormValues) => {
    console.log('data:', data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full p-0 mx-auto">
      {/* <div>Email: {loading ? "Loading..." : error ? error : email}</div>
      <div>{helloLoading ? "Loading..." : text}</div> */}
      <ReportConfigForm onSubmit={handleSubmit} />
    </div>
  );
}
