package com.diagnostic.app.Service;

import com.diagnostic.app.DTO.LoginRequest;
import com.diagnostic.app.DTO.LoginResponse;
import com.diagnostic.app.DTO.RegisterRequest;
import com.diagnostic.app.Entity.Labs;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Repository.LabRepository;
import com.diagnostic.app.Repository.UsersRepository;

import com.diagnostic.app.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsersRepository usersRepository;
    private final LabRepository labRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public Users register(RegisterRequest request) {


        if(usersRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
        }

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());

        if (request.getLabId() != null) {
            Labs lab = labRepository.findById(request.getLabId())
                    .orElseThrow(() -> new RuntimeException("Lab not found"));
            user.setLab(lab);
        }

        return usersRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtUtil.generateToken(request.getEmail());

        return new LoginResponse(token);
    }
}