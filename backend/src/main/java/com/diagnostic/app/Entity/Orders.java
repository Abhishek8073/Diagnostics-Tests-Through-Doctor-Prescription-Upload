package com.diagnostic.app.Entity;

import com.diagnostic.app.Entity.Enums.OrderStatus;
import com.diagnostic.app.Entity.Enums.UsersCollectionType;
import jakarta.persistence.*;
import jakarta.persistence.metamodel.PluralAttribute;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;


@Entity
@Table(name="orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name="patient_id")
    private Users patient;

    @ManyToOne
    @JoinColumn(name="prescription_id")
    private Prescription prescription;

    @ManyToOne
    @JoinColumn(name="lab_id")
    private Labs laboratory;

    @Enumerated(EnumType.STRING)
    private UsersCollectionType collectionType;

    private String address;

    private LocalDate bookingDate;

    private LocalTime bookingTime;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Users getPatient() {
        return patient;
    }

    public void setPatient(Users patient) {
        this.patient = patient;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public Labs getLaboratory() {
        return laboratory;
    }

    public void setLaboratory(Labs laboratory) {
        this.laboratory = laboratory;
    }

    public UsersCollectionType getCollectionType() {
        return collectionType;
    }

    public void setCollectionType(UsersCollectionType collectionType) {
        this.collectionType = collectionType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}