/**
 * Logic for delivery availability and charges.
 * In a real app, this would call a logistics API like Delhivery or Shiprocket.
 */

// Sample list of available pincodes (Serviceable Areas)
const SERVICEABLE_PINCODES = [
  "400001", "400002", "110001", "110002", "560001", "560002",
  "600001", "600002", "700001", "700002", "500001", "500002"
];

export interface DeliveryEstimate {
  isAvailable: boolean;
  deliveryCharge: number;
  estimatedDays: number;
  message?: string;
}

export async function checkDeliveryAvailability(pincode: string, orderTotal: number): Promise<DeliveryEstimate> {
  // Basic validation
  if (!pincode || pincode.length !== 6) {
    return { isAvailable: false, deliveryCharge: 0, estimatedDays: 0, message: "Invalid pincode" };
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (!data || data[0].Status !== "Success") {
      return { 
        isAvailable: false, 
        deliveryCharge: 0, 
        estimatedDays: 0, 
        message: "Pincode not found. Please check and try again." 
      };
    }

    const postOffices = data[0].PostOffice;
    const isTamilNadu = postOffices.some((po: any) => po.State === "Tamil Nadu");

    if (!isTamilNadu) {
      return { 
        isAvailable: false, 
        deliveryCharge: 0, 
        estimatedDays: 0, 
        message: "Currently, we only deliver within Tamil Nadu." 
      };
    }

    // Delivery Charge Logic:
    // - Free delivery above ₹999
    // - Standard ₹50 below ₹999
    const deliveryCharge = orderTotal >= 999 ? 0 : 50;
    const estimatedDays = 3; // Standard 3 days for TN

    return {
      isAvailable: true,
      deliveryCharge,
      estimatedDays,
      message: deliveryCharge === 0 
        ? "Yay! You've got Free Delivery." 
        : `Standard delivery charge of ₹${deliveryCharge} applies.`
    };
  } catch (error) {
    console.error("Delivery API error:", error);
    // Fallback to safe state
    return { 
      isAvailable: false, 
      deliveryCharge: 0, 
      estimatedDays: 0, 
      message: "Unable to verify delivery availability. Please try again later." 
    };
  }
}
