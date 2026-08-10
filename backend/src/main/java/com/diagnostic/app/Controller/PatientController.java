package com.diagnostic.app.Controller;

import com.diagnostic.app.DTO.UserProfileResponse;
import com.diagnostic.app.Entity.*;
import com.diagnostic.app.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PrescriptionService prescriptionService;
    private final OrderService orderService;
    private final ReportService reportService;
    private final LabService labService;
    private final UsersService usersService;

    @GetMapping("/labs")
    public List<Labs> getAllLabs() {

        return labService.getAllLabDetails();
    }

    // Prescription

    @PostMapping("/prescriptions")
    public Prescription uploadPrescription(
            @RequestParam Long patientId,
            @RequestParam MultipartFile file) throws IOException {

        System.out.println("Patient ID = " + patientId);

        return prescriptionService.uploadPrescription(patientId, file);
    }

    // Report

    @GetMapping("/reports/{id}")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable("id") Long id) {

        return reportService.downloadReport(id);
    }

    @GetMapping("/orders/{orderId}/report")
    public ResponseEntity<byte[]> downloadReportForOrder(
            @PathVariable("orderId") Long orderId) {

        return reportService.downloadReportByOrderId(orderId);
    }

    // Orders

    @PostMapping("/orders")
    public Orders createOrder(@RequestBody Orders order) {

        return orderService.createOrder(order);
    }

    @GetMapping("/allOrders/{id}")
    public List<Orders> getPatientOrders(
            @PathVariable("id") Long Id) {

        return orderService.getPatientOrders(Id);
    }

    @GetMapping("/orders/{id}")
    public Orders getOrderById(@PathVariable("id") Long id) {

        return orderService.getOrderById(id);
    }

    @PutMapping("/orders/{id}/cancel")
    public Orders cancelOrder(@PathVariable("id") Long id) {

        return orderService.cancelOrder(id);
    }
    @GetMapping("/profile")
    public UserProfileResponse getProfile(Principal principal) {

        return usersService.getProfileByEmail(principal.getName());
    }
}