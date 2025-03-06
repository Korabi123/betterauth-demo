import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    await prismadb.account.deleteMany({
      where: {
        providerId: "google",
      }
    })

    return NextResponse.json({ message: "Connection deleted successfully" });
  } catch (error) {
    console.log("ERROR_DELETING_CONNECTION: ", error);
    return new Response("Internal server error", { status: 500 });
  }
}
