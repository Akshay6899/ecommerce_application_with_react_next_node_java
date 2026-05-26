package com.ecom.payment.model;

import java.time.Instant;

public class Payment {
    public enum Status { PENDING, PAID, FAILED }

    private String paymentId;
    private String orderId;
    private double amount;
    private Status status;
    private String clientSecret;
    private Instant createdAt;

    public Payment() {}
    public Payment(String paymentId, String orderId, double amount, Status status, String clientSecret) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
        this.clientSecret = clientSecret;
        this.createdAt = Instant.now();
    }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String s) { this.clientSecret = s; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant t) { this.createdAt = t; }
}
