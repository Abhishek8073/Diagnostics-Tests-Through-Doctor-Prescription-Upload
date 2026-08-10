package com.diagnostic.app.Service;

import com.diagnostic.app.Entity.Enums.OrderStatus;
import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Entity.Prescription;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Repository.LabRepository;
import com.diagnostic.app.Repository.OrderRepository;
import com.diagnostic.app.Repository.PrescriptionRepository;
import com.diagnostic.app.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private LabRepository labRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public Orders createOrder(Orders order) {

        Users patient = usersRepository.findById(order.getPatient().getUserId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Labs lab = labRepository.findById(order.getLaboratory().getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        Prescription prescription = prescriptionRepository.findById(order.getPrescription().getPrescriptionId())
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        order.setPatient(patient);
        order.setLaboratory(lab);
        order.setPrescription(prescription);

        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }
    public List<Orders> getPatientOrders(Long patientId) {
        return orderRepository.findByPatientUserId(patientId);
    }

    public Orders getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));


    }

    public Orders getOrderByIdForLab(Long orderId, Long labId) {

        Orders order = getOrderById(orderId);

        if (order.getLaboratory() == null || !order.getLaboratory().getLabId().equals(labId)) {
            throw new RuntimeException("This order does not belong to your lab.");
        }

        return order;
    }

    public Orders updateOrderStatus(Long orderId, Orders updatedOrder) {

        Orders existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        existingOrder.setStatus(updatedOrder.getStatus());

        return orderRepository.save(existingOrder);
    }

    public Orders updateOrderStatusForLab(Long orderId, Orders updatedOrder, Long labId) {

        Orders existingOrder = getOrderByIdForLab(orderId, labId);

        existingOrder.setStatus(updatedOrder.getStatus());

        return orderRepository.save(existingOrder);
    }

    public Orders cancelOrder(Long orderId) {

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.CANCELLED);

        return orderRepository.save(order);
    }

    public List<Orders> getAllOrders() {

        return orderRepository.findAll();
    }

    public List<Orders> getOrdersByLabId(Long labId) {
        return orderRepository.findByLaboratory_LabId(labId);
    }

    public void verifyPrescriptionBelongsToLab(Long prescriptionId, Long labId) {

        Orders order = orderRepository.findByPrescription_PrescriptionId(prescriptionId)
                .orElseThrow(() -> new RuntimeException("No order found for this prescription"));

        if (order.getLaboratory() == null || !order.getLaboratory().getLabId().equals(labId)) {
            throw new RuntimeException("This prescription does not belong to your lab.");
        }
    }
}
