export function canCancelOrder(order: {
  orderStatus: string;
  paymentStatus: string;
  trackingId?: string | null;
}) {
  const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];
  return (
    cancellableStatuses.includes(order.orderStatus) &&
    !order.trackingId
  );
}

export function canReturnOrder(order: {
  orderStatus: string;
  deliveredAt?: Date | string | null;
}) {
  if (order.orderStatus !== "DELIVERED" || !order.deliveredAt) {
    return false;
  }

  const returnWindowDays = 7;
  const deliveredAt = new Date(order.deliveredAt);
  const now = new Date();

  // Calculate difference in days
  const diffTime = Math.abs(now.getTime() - deliveredAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= returnWindowDays;
}

export function canRefundOrder(order: {
  orderStatus: string;
  paymentStatus: string;
  refundedAt?: Date | string | null;
}) {
  const refundableStatuses = ["CANCELLED", "RETURNED", "RETURN_REQUESTED", "RETURN_APPROVED"];
  return (
    refundableStatuses.includes(order.orderStatus) &&
    order.paymentStatus === "PAID" &&
    !order.refundedAt
  );
}
