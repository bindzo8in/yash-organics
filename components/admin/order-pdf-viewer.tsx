"use client";

import dynamic from "next/dynamic";
import { OrderPDFDocument } from "./order-pdf-document";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// PDFViewer must be dynamically imported with ssr: false
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <div className="h-screen w-full flex items-center justify-center">Loading PDF Viewer...</div>,
  }
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface OrderPDFViewerProps {
  order: any;
}

export const OrderPDFViewer = ({ order }: OrderPDFViewerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-100">
      <div className="flex justify-between items-center p-4 bg-white border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold">Print Order #{order.id.slice(-8).toUpperCase()}</h1>
        </div>
        <div>
          <PDFDownloadLink
            document={<OrderPDFDocument order={order} />}
            fileName={`order-${order.id.slice(-8).toUpperCase()}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="gap-2">
                <Download className="h-4 w-4" />
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <div className="flex-1 w-full h-full p-4">
        <PDFViewer className="w-full h-full border-none rounded shadow-sm">
          <OrderPDFDocument order={order} />
        </PDFViewer>
      </div>
    </div>
  );
};
