package com.diagnostic.app.Service;

import com.diagnostic.app.DTO.UserProfileResponse;
import com.diagnostic.app.Entity.Enums.UsersRole;
import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Orders;
import com.diagnostic.app.Entity.Prescription;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Repository.LabRepository;
import com.diagnostic.app.Repository.OrderRepository;
import com.diagnostic.app.Repository.PrescriptionRepository;
import com.diagnostic.app.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private LabRepository labRepository;



    public List<Users> getAllUserDetails() {

        return usersRepository.findAll();
    }

    public Users getUserDetails(Long id) {

        return usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Users assignLab(Long userId, Long labId) {

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UsersRole.LAB) {
            throw new RuntimeException("Only lab-role users can be assigned to a lab.");
        }

        if (labId == null) {
            user.setLab(null);
        } else {
            Labs lab = labRepository.findById(labId)
                    .orElseThrow(() -> new RuntimeException("Lab not found"));
            user.setLab(lab);
        }

        return usersRepository.save(user);
    }

    public void deleteUser(Long id) {

        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Orders> orders = orderRepository.findByPatientUserId(id);
        for (Orders order : orders) {
            order.setPatient(null);
        }
        orderRepository.saveAll(orders);

        List<Prescription> prescriptions = prescriptionRepository.findByPatient_UserId(id);
        for (Prescription prescription : prescriptions) {
            prescription.setPatient(null);
        }
        prescriptionRepository.saveAll(prescriptions);

        usersRepository.delete(user);
    }

    public UserProfileResponse getProfileByEmail(String email) {

        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse response = new UserProfileResponse();

        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(String.valueOf(user.getRole()));

        return response;
    }
    public Users updateProfile(String email, Users updatedUser) {

        Users existingUser = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setAddress(updatedUser.getAddress());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // role is intentionally left untouched here to prevent self-service
        // privilege escalation through the profile-edit endpoint

        return usersRepository.save(existingUser);
    }
}
