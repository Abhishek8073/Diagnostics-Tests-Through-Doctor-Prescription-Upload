package com.diagnostic.app.Service;

import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Repository.LabRepository;
import com.diagnostic.app.Repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabService {


    private final LabRepository labRepository;
    private final OrderRepository orderRepository;

    public List<Labs> getAllLabDetails() {

        return labRepository.findAll();
    }

    public Labs getLabDetails(Long id) {

        Labs existingLab = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        return existingLab;
    }

    public Labs createLab(Labs lab) {

        return labRepository.save(lab);
    }

    public void deleteLab(Long id) {

        Labs lab = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        List<Orders> orders = orderRepository.findByLaboratory_LabId(id);
        for (Orders order : orders) {
            order.setLaboratory(null);
        }
        orderRepository.saveAll(orders);

        labRepository.delete(lab);
    }
}
