package com.diagnostic.app.Controller;

import com.diagnostic.app.Entity.Enums.UsersRole;
import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Entity.Report;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Repository.UsersRepository;
import com.diagnostic.app.Service.OrderService;
import com.diagnostic.app.Service.PrescriptionService;
import com.diagnostic.app.Service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/lab")
@RequiredArgsConstructor
public class LabController {

    private final OrderService orderService;
    private final ReportService reportService;
    private final PrescriptionService prescriptionService;
    private final UsersRepository usersRepository;

    // Resolves the lab this authenticated lab-role user is allowed to act on.
    // Every endpoint below is scoped through this so a lab user can never
    // see or modify another lab's orders, reports, or prescriptions.
    private Labs getCurrentLab(Principal principal) {

        Users user = usersRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UsersRole.LAB) {
            throw new RuntimeException("Only lab accounts can access this resource.");
        }

        if (user.getLab() == null) {
            throw new RuntimeException("Your account has not been assigned to a lab yet. Contact an admin.");
        }

        return user.getLab();
    }

    // Lab Details

    @GetMapping("/mylab")
    public Labs getMyLab(Principal principal) {

        return getCurrentLab(principal);
    }

    // Orders

    @GetMapping("/orders")
    public List<Orders> getMyLabOrders(Principal principal) {

        Labs lab = getCurrentLab(principal);
        return orderService.getOrdersByLabId(lab.getLabId());
    }

    @GetMapping("/orders/{id}")
    public Orders getOrderByID(
            @PathVariable("id") Long id,
            Principal principal) {

        Labs lab = getCurrentLab(principal);
        return orderService.getOrderByIdForLab(id, lab.getLabId());
    }

    @PutMapping("/orders/{id}/status")
    public Orders updateStatus(
            @PathVariable("id") Long id,
            @RequestBody Orders order,
            Principal principal) {

        Labs lab = getCurrentLab(principal);
        return orderService.updateOrderStatusForLab(id, order, lab.getLabId());
    }

    // Reports

    @PostMapping("/reports/upload")
    public Report uploadReport(
            @RequestParam Long orderId,
            @RequestParam MultipartFile file,
            Principal principal) throws IOException {

        Labs lab = getCurrentLab(principal);
        orderService.getOrderByIdForLab(orderId, lab.getLabId());

        return reportService.uploadReport(orderId, file);
    }

    // prescription

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<byte[]> downloadPrescription(
            @PathVariable("id") Long id,
            Principal principal) {

        Labs lab = getCurrentLab(principal);
        orderService.verifyPrescriptionBelongsToLab(id, lab.getLabId());

        return prescriptionService.downloadPrescription(id);
    }
}
