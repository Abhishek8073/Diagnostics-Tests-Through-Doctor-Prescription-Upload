package com.diagnostic.app.DTO;


import com.diagnostic.app.Entity.Enums.UsersRole;
import jakarta.validation.constraints.*;
import lombok.Data;


@Data
public class RegisterRequest {

    @NotBlank(message="Name is required")
    private String name;

    @Email(message="Invalid email")
    @NotBlank
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min=6,max=20)
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp="^[0-9]{10}$")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull
    private UsersRole role;

    private Long labId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public UsersRole getRole() {
        return role;
    }

    public void setRole(UsersRole role) {
        this.role = role;
    }

    public Long getLabId() {
        return labId;
    }

    public void setLabId(Long labId) {
        this.labId = labId;
    }
}