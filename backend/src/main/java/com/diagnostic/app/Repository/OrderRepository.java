package com.diagnostic.app.Repository;

import com.diagnostic.app.Entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    List<Orders> findByPatientUserId(Long userId);

    List<Orders> findByLaboratory_LabId(Long labId);

    Optional<Orders> findByPrescription_PrescriptionId(Long prescriptionId);
}