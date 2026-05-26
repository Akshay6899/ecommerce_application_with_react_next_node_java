package com.ecom.payment.controller;

import com.ecom.payment.model.Payment;
import com.ecom.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/intent")
    public Map<String, Object> createIntent(@RequestBody Map<String, Object> body) {
        String orderId = (String) body.get("orderId");
        double amount = ((Number) body.get("amount")).doubleValue();
        Payment p = service.createIntent(orderId, amount);
        return Map.of(
                "paymentId", p.getPaymentId(),
                "clientSecret", p.getClientSecret(),
                "status", p.getStatus().name()
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        Payment p = service.verify(body.get("paymentId"), body.getOrDefault("signature", ""));
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        return ResponseEntity.ok(Map.of("paymentId", p.getPaymentId(), "status", p.getStatus().name()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        Payment p = service.get(id);
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        return ResponseEntity.ok(p);
    }
}
