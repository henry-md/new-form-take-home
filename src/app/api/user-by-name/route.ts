import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Missing 'name' query param" },
      { status: 400, headers: corsHeaders }
    );
  }

  const user = await prisma.user.findFirst({
    where: { name },
    select: { email: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { email: user.email },
    { headers: corsHeaders }
  );
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
