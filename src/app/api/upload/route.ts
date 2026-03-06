import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ error: "IPFS upload not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Accepted: jpg, png, webp, gif" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    // Pin to IPFS via Pinata
    const pinataForm = new FormData();
    pinataForm.append("file", file);
    pinataForm.append("pinataMetadata", JSON.stringify({ name: `origin-agent-avatar-${Date.now()}` }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: pinataForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Pinata error:", err);
      return NextResponse.json({ error: "IPFS upload failed" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
