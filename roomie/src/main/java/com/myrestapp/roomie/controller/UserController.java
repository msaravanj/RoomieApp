package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.dto.UserDto;
import com.myrestapp.roomie.dto.UserInfoDto;
import com.myrestapp.roomie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class UserController {

    private UserService userService;

    @Autowired
    public UserController(UserService theUserService) {
        userService = theUserService;
    }

    @GetMapping("/users")
    public List<UserDto> findAll(){
        return userService.findAll();
    }

    @GetMapping("/users/{userId}")
    public UserDto getUserById(@PathVariable int userId){
        UserDto theUser = userService.findById(userId);

        if (theUser == null) {
            throw new RuntimeException("User id not found - " + userId);
        }

        return theUser;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/users/email/{email}")
    public UserInfoDto getUserByEmail(@PathVariable String email){
        UserInfoDto theUser = userService.findByEmail(email);

        if (theUser == null) {
            throw new RuntimeException("User email not found - " + email);
        }

        return theUser;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/users/info/{lifestyleProfileId}")
    public UserInfoDto getUserByLifestyleProfileId(@PathVariable int lifestyleProfileId){
        UserInfoDto theUser = userService.findByLifestyleProfileId(lifestyleProfileId).orElse(null);

        if (theUser == null) {
            throw new RuntimeException("User with Lifestyle Profile id not found - " + lifestyleProfileId);
        }

        return theUser;
    }

    @PreAuthorize("#theUser.id == authentication.principal.id or hasRole('ADMIN')")
    @PostMapping("/users")
    public UserDto addUser(@RequestBody UserDto theUser) {

        theUser.setId(0);
        userService.save(theUser);
        return theUser;
    }


    @PreAuthorize("#theUser.id == authentication.principal.id or hasRole('ADMIN')")
    @PutMapping("/users")
    public void updateUser(@RequestBody UserDto theUser) {
        userService.save(theUser);

    }

    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    @DeleteMapping("/users/{userId}")
    void deleteUser(@PathVariable int userId) {
        UserDto tempUser = userService.findById(userId);

        if (tempUser == null) {
            throw new RuntimeException("User id not found - " + userId);
        }

        userService.deleteById(userId);
    }

    @PutMapping("/users/{userId}/lifestyleProfile/{profileId}")
    public void updateLifestyleProfile(
            @PathVariable int userId,
            @PathVariable int profileId
    ) {
        userService.updateLifestyleProfile(userId, profileId);
    }

}
