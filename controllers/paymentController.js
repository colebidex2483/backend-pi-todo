import Payment from "../models/Payment.js";
import platformAPIClient from "../services/platformAPIClient.js";
import axios from "axios";

// Handle the incomplete donation
export const incompleteDonation = async (req, res) => {
  const payment = req.body.payment;
  const paymentId = payment.identifier;
  const txid = payment.transaction && payment.transaction.txid;
  const txURL = payment.transaction && payment.transaction._link;

  try {
    // Find the incomplete donation
    const donation = await Payment.findOne({ pi_payment_id: paymentId });

    // Donation doesn't exist
    if (!donation) {
      return res.status(400).json({ message: "Donation not found" });
    }

    // Check the transaction on the Pi blockchain
    const horizonResponse = await axios.create({ timeout: 20000 }).get(txURL);
    const paymentIdOnBlock = horizonResponse.data.memo;

    // Verify payment ID matches
    if (paymentIdOnBlock !== donation.pi_payment_id) {
      return res.status(400).json({ message: "Payment ID doesn't match." });
    }

    // Mark the donation as paid
    donation.txid = txid;
    donation.paid = true;
    await donation.save();

    // Notify Pi Servers that the donation is completed
    await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, { txid });

    return res.status(200).json({ message: `Handled the incomplete donation ${paymentId}` });
  } catch (error) {
    console.error("Error handling incomplete donation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Approve the current donation
export const approveDonation = async (req, res) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ error: "unauthorized", message: "User needs to sign in first" });
  }

  try {
    const paymentId = req.body.paymentId;
    const currentPayment = await platformAPIClient.get(`/v2/payments/${paymentId}`);

    // Create a new donation record
    const newDonation = new Payment({
      pi_payment_id: paymentId,
      donation_purpose: currentPayment.data.metadata.donationPurpose || "General Donation",
      user: req.session.currentUser.uid,
      amount: currentPayment.data.amount, // Amount of Pi coins donated
      txid: null,
      paid: false,
      cancelled: false,
      created_at: new Date(),
    });

    await newDonation.save();

    // Notify Pi Servers that the donation is approved
    await platformAPIClient.post(`/v2/payments/${paymentId}/approve`);

    return res.status(200).json({ message: `Approved the donation ${paymentId}` });
  } catch (error) {
    console.error("Error approving donation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Complete the current donation
export const completeDonation = async (req, res) => {
  try {
    const paymentId = req.body.paymentId;
    const txid = req.body.txid;

    // Update the donation record
    const donation = await Payment.findOneAndUpdate(
      { pi_payment_id: paymentId },
      { $set: { txid, paid: true } },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({ message: "Donation not found" });
    }

    // Notify Pi Servers that the donation is completed
    await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, { txid });

    return res.status(200).json({ message: `Completed the donation ${paymentId}` });
  } catch (error) {
    console.error("Error completing donation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Handle the cancelled donation
export const cancelDonation = async (req, res) => {
  try {
    const paymentId = req.body.paymentId;

    // Update the donation record
    const donation = await Payment.findOneAndUpdate(
      { pi_payment_id: paymentId },
      { $set: { cancelled: true } },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({ message: "Donation not found" });
    }

    return res.status(200).json({ message: `Cancelled the donation ${paymentId}` });
  } catch (error) {
    console.error("Error cancelling donation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};