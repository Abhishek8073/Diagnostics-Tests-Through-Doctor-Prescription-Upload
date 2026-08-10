package com.diagnostic.app.Repository;

import com.diagnostic.app.Entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByOrder_OrderId(Long orderId);
}