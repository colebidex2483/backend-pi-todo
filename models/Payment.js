import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  pi_payment_id: { type: String, required: true, unique: true },
  donation_purpose: { type: String, required: true }, // Purpose of the donation
  user: { type: String, required: true }, // User making the donation
  txid: { type: String, default: null }, // Transaction ID on the Pi blockchain
  amount: { type: Number, required: true }, // Amount of Pi coins donated
  paid: { type: Boolean, default: false }, // Whether the donation is paid
  cancelled: { type: Boolean, default: false }, // Whether the donation is cancelled
  created_at: { type: Date, default: Date.now }, // Timestamp of the donation
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;