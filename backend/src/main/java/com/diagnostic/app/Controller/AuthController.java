package com.diagnostic.app.Controller;

import com.diagnostic.app.DTO.LoginRequest;
import com.diagnostic.app.DTO.LoginResponse;
import com.diagnostic.app.DTO.RegisterRequest;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Service.AuthService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Users register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}