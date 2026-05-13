export const calculateDeliveryCharge = (totalAmount: number, totalWeight: number) => {
  // Logic for manual courier-based delivery
  
  // 1. Threshold for Free Delivery
  if (totalAmount >= 1500) {
    return 0;
  }

  // 2. Weight-based charging (Standard Courier Rate approximation)
  // e.g., 40 INR per kg, minimum 50 INR
  const ratePerKg = 40;
  const minCharge = 50;
  
  const calculatedCharge = totalWeight * ratePerKg;
  
  return Math.max(minCharge, calculatedCharge);
};
