export interface DeliveryEstimate {
  isAvailable: boolean;
  deliveryCharge: number;
  estimatedDays: number;
  message?: string;
}

export function checkDeliveryAvailability(pincode: string, orderTotal: number): DeliveryEstimate {
  // 1. Basic validation: strictly 6 digits
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return { isAvailable: false, deliveryCharge: 0, estimatedDays: 0, message: "Invalid pincode format." };
  }

  // 2. Local Validation based on official PIN structure
  // Tamil Nadu pincodes start with 60 through 66, but exclude 605 (Puducherry)
  const prefix2 = parseInt(pincode.substring(0, 2), 10);
  const prefix3 = pincode.substring(0, 3);
  
  const isTamilNadu = (prefix2 >= 60 && prefix2 <= 66) && (prefix3 !== "605");

  if (!isTamilNadu) {
    return { 
      isAvailable: false, 
      deliveryCharge: 0, 
      estimatedDays: 0, 
      message: "Currently, we only deliver within Tamil Nadu." 
    };
  }

  // 3. Delivery Charge Logic
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
}