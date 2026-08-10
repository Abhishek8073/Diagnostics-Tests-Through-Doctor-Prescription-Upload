package com.diagnostic.app.Service;

import com.diagnostic.app.Entity.Enums.OrderStatus;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Entity.Report;
import com.diagnostic.app.Repository.OrderRepository;
import com.diagnostic.app.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Report uploadReport(Long orderId, MultipartFile file) throws IOException {

        String type=file.getContentType();

        if(!type.equals("application/pdf")
                && !type.equals("image/png")
                && !type.equals("image/jpeg")){

            throw new RuntimeException("Invalid file type");

        }

        if(file.isEmpty()){
            throw new RuntimeException("File is empty");
        }


        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        Report report = new Report();

        report.setOrder(order);
        report.setReportName(file.getOriginalFilename());
        report.setReportType(file.getContentType());
        report.setReportData(file.getBytes());

        Report savedReport = reportRepository.save(report);

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        return savedReport;
    }

    public ResponseEntity<byte[]> downloadReportByOrderId(Long orderId) {

        Report report = reportRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Report not found for this order"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(report.getReportType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getReportName() + "\"")
                .body(report.getReportData());
    }

    public ResponseEntity<byte[]> downloadReport(Long reportId) {


        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(report.getReportType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getReportName() + "\"")
                .body(report.getReportData());
    }
}