"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { env } from "@/lib/env";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1 solid #000',
    paddingBottom: 10
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 10,
    color: '#666'
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  addressBox: {
    width: '45%'
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    borderBottom: '1 solid #ccc',
    paddingBottom: 5,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  text: {
    marginBottom: 3,
    lineHeight: 1.4
  },
  bold: {
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    marginBottom: 30
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderTop: '1 solid #000',
    borderBottom: '1 solid #000',
    paddingVertical: 8,
    backgroundColor: '#f6f6f6'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingVertical: 8
  },
  tableColItem: { width: '40%' },
  tableColQty: { width: '20%', textAlign: 'center' },
  tableColPrice: { width: '20%', textAlign: 'right' },
  tableColTotal: { width: '20%', textAlign: 'right' },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  tableCell: {
    fontSize: 10
  },
  summarySection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 5
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 8,
    borderTop: '1 solid #000',
    borderBottom: '1 solid #000',
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 12
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 8,
    borderTop: '1 solid #eee',
    paddingTop: 10
  }
});

interface OrderPDFDocumentProps {
  order: any;
}

export const OrderPDFDocument = ({ order }: OrderPDFDocumentProps) => {
  const subtotal = order.totalAmount - (order.deliveryCharge || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Packing Slip</Text>
            <Text style={styles.subtitle}>YASH ORGANICS | Pure. Organic. Handcrafted.</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.bold}>Order #{order.id.slice(-8).toUpperCase()}</Text>
            <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
            <Text>Status: {order.orderStatus}</Text>
            <Text>Payment: {order.paymentStatus}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Ship To</Text>
            <Text style={[styles.text, styles.bold]}>{order.address.fullName}</Text>
            <Text style={styles.text}>{order.address.addressLine1}</Text>
            {order.address.addressLine2 && <Text style={styles.text}>{order.address.addressLine2}</Text>}
            <Text style={styles.text}>{order.address.city}, {order.address.state} {order.address.postalCode}</Text>
            <Text style={styles.text}>Phone: {order.address.phone}</Text>
            <Text style={styles.text}>Email: {order.address.email}</Text>
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Bill From</Text>
            <Text style={[styles.text, styles.bold]}>{env.NEXT_PUBLIC_SITE_NAME}</Text>
            <Text style={styles.text}>East Tambaram,</Text>
            <Text style={styles.text}>Chennai - 600 059</Text>
            <Text style={styles.text}>Phone: +91 97901 84439</Text>
            <Text style={styles.text}>Email: {env.NEXT_PUBLIC_ADMIN_EMAIL}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableColItem}><Text style={styles.tableCellHeader}>Item</Text></View>
            <View style={styles.tableColQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
            <View style={styles.tableColPrice}><Text style={styles.tableCellHeader}>Unit Price</Text></View>
            <View style={styles.tableColTotal}><Text style={styles.tableCellHeader}>Total</Text></View>
          </View>
          
          {order.orderItems.map((item: any) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableColItem}>
                <Text style={styles.tableCell}>{item.productName || item.product?.name}</Text>
                <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>{item.variantName || item.variant?.name}</Text>
              </View>
              <View style={styles.tableColQty}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableColPrice}>
                <Text style={styles.tableCell}>Rs. {item.sellingPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.tableColTotal}>
                <Text style={styles.tableCell}>Rs. {(item.sellingPrice * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery Charge</Text>
            <Text>Rs. {(order.deliveryCharge || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text>Grand Total</Text>
            <Text>Rs. {order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for supporting organic farming!</Text>
          <Text>This is a computer-generated document and requires no signature.</Text>
        </View>
        
      </Page>
    </Document>
  );
};
