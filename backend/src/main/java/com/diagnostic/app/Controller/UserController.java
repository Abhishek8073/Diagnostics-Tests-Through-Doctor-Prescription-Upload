package com.diagnostic.app.Controller;

import com.diagnostic.app.DTO.UserProfileResponse;
import com.diagnostic.app.Entity.Users;
import com.diagnostic.app.Service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UsersService usersService;

    @GetMapping("/allprofile")
    public List<Users> getAllUserDetails() {
        return usersService.getAllUserDetails();
    }

    @GetMapping("/profile")
    public UserProfileResponse getProfile(Principal principal) {

        return usersService.getProfileByEmail(principal.getName());
    }

    @PutMapping("/profile")
    public Users updateProfile(
            Principal principal,
            @RequestBody Users updatedUser) {

        return usersService.updateProfile(
                principal.getName(),
                updatedUser
        );
    }
}
