package com.diagnostic.app.Entity;


import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long prescriptionId;

    @ManyToOne
    @JoinColumn(name="patient_id")
    private Users patient;

    private String imageName;

    private String imageType;

//    @Lob
////    @Column(columnDefinition = "BYTEA")
//    @Column(name = "image_data")
//    private byte[] ImageData;

    @Column(name = "Image_data", columnDefinition = "BYTEA")
    private byte[] ImageData;
    private LocalDateTime uploadDate = LocalDateTime.now();


    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Long prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Users getPatient() {
        return patient;
    }

    public void setPatient(Users patient) {
        this.patient = patient;
    }



    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    @JsonIgnore
    public byte[] getImageData() {
        return ImageData;
    }

    public void setImageData(byte[] ImageData) {
        this.ImageData = ImageData;
    }
}
