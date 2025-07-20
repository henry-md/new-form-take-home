import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-[600px] p-0 mx-auto">
        <div className="text-3xl font-bold underline text-red-500">Hello World</div>
        <Input />
      </div>
    </>
  );
}
