package com.diagnostic.app.Service;

import com.diagnostic.app.Entity.Prescription;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Repository.PrescriptionRepository;
import com.diagnostic.app.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@Service
public class PrescriptionService {

        @Autowired
        private PrescriptionRepository prescriptionRepository;

        @Autowired
        private UsersRepository usersRepository;

    public Prescription uploadPrescription(Long patientId, MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String type = file.getContentType();

        if (!type.equals("application/pdf")
                && !type.equals("image/png")
                && !type.equals("image/jpeg")) {

            throw new RuntimeException("Invalid file type");
        }

        Users patient = usersRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Prescription prescription = new Prescription();

        prescription.setPatient(patient);
        prescription.setImageName(file.getOriginalFilename());
        prescription.setImageType(file.getContentType());
        prescription.setImageData(file.getBytes());

        return prescriptionRepository.save(prescription);
    }

    public ResponseEntity<byte[]> downloadPrescription(Long id) {


        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Priscription not found") );

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(prescription.getImageType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + prescription.getImageName() + "\"")
                .body(prescription.getImageData());
    }
}
