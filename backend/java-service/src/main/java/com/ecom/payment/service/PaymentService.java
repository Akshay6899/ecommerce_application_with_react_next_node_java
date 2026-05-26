package com.ecom.payment.service;

import com.ecom.payment.model.Payment;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory payment store. Replace with a real DB (Postgres/JPA)
 * and a real gateway (Stripe/Razorpay) for production.
 */
@Service
public class PaymentService {
    private final Map<String, Payment> store = new ConcurrentHashMap<>();

    public Payment createIntent(String orderId, double amount) {
        String id = "pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String secret = "secret_" + UUID.randomUUID().toString().replace("-", "");
        Payment p = new Payment(id, orderId, amount, Payment.Status.PENDING, secret);
        store.put(id, p);
        return p;
    }

    public Payment verify(String paymentId, String signature) {
        Payment p = store.get(paymentId);
        if (p == null) return null;
        // In real life: verify HMAC signature against gateway secret.
        // For demo: accept any non-empty signature.
        if (signature != null && !signature.isBlank()) {
            p.setStatus(Payment.Status.PAID);
        } else {
            p.setStatus(Payment.Status.FAILED);
        }
        return p;
    }

    public Payment get(String paymentId) {
        return store.get(paymentId);
    }
}
