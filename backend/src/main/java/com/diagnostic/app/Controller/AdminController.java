package com.diagnostic.app.Controller;

import com.diagnostic.app.DTO.LabAssignmentRequest;
import com.diagnostic.app.DTO.RegisterRequest;
import com.diagnostic.app.Entity.Enums.OrderStatus;
import com.diagnostic.app.Entity.Enums.UsersRole;
import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Service.AuthService;
import com.diagnostic.app.Service.LabService;
import com.diagnostic.app.Service.OrderService;
import com.diagnostic.app.Service.UsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsersService usersService;
    private final LabService labService;
    private final OrderService orderService;
    private final AuthService authService;

    private static final Set<OrderStatus> LAB_HANDLED_STATUSES =
            Set.of(OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.COMPLETED);


    @GetMapping("/users")
    public List<Users> users() {
        return usersService.getAllUserDetails();
    }

    @GetMapping("/users/{id}")
    public Users getUser(@PathVariable("id") Long id) {
        return usersService.getUserDetails(id);
    }

    @PostMapping("/users")
    public Users createUser(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/users/{id}/orders")
    public List<Orders> getUserOrders(@PathVariable("id") Long id) {
        Users user = usersService.getUserDetails(id);

        if (user.getRole() == UsersRole.LAB && user.getLab() != null) {
            return orderService.getOrdersByLabId(user.getLab().getLabId())
                    .stream()
                    .filter(order -> LAB_HANDLED_STATUSES.contains(order.getStatus()))
                    .toList();
        }

        return orderService.getPatientOrders(id);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable("id") Long id) {
        usersService.deleteUser(id);
    }

    @PutMapping("/users/{id}/lab")
    public Users assignLab(@PathVariable("id") Long id, @RequestBody LabAssignmentRequest request) {
        return usersService.assignLab(id, request.getLabId());
    }

    @GetMapping("/orders")
    public List<Orders> orders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/orders/{id}")
    public Orders getOrderByID(@PathVariable("id") Long id) {

        return orderService.getOrderById(id);
    }

    @GetMapping("/labs")
    public List<Labs> getAllLabs() {

        return labService.getAllLabDetails();
    }

    @GetMapping("/labs/{id}")
    public Labs getLab(@PathVariable("id") Long id) {

        return labService.getLabDetails(id);
    }

    @PostMapping("/labs")
    public Labs createLab(@Valid @RequestBody Labs lab) {

        return labService.createLab(lab);
    }

    @GetMapping("/labs/{id}/orders")
    public List<Orders> getLabOrders(@PathVariable("id") Long id) {
        return orderService.getOrdersByLabId(id);
    }

    @DeleteMapping("/labs/{id}")
    public void deleteLab(@PathVariable("id") Long id) {
        labService.deleteLab(id);
    }

}