import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Validate File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    // 2. Validate File Type (Only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // We can't directly return the raw result from uploadImage if we want the "full object"
    // because uploadImage currently only returns the secure_url string.
    // Let's modify lib/cloudinary.ts or just use cloudinary directly here if we need the full object.
    
    // Actually, let's keep lib/cloudinary.ts simple and maybe add another function for full result.
    // For now, I'll update lib/cloudinary.ts to return the result object or just use the secure_url.
    
    // The user wants "object return from cloudinary".
    // I'll update lib/cloudinary.ts to return the full result.
    
    const result = await uploadImage(file, folder);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
