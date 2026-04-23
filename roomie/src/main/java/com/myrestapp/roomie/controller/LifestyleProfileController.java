package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.domain.LifestyleProfile;
import com.myrestapp.roomie.dto.LifestyleGenerateRequestDto;
import com.myrestapp.roomie.dto.LifestyleProfileDto;
import com.myrestapp.roomie.service.LifestyleAiService;
import com.myrestapp.roomie.service.LifestyleProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class LifestyleProfileController {

    private LifestyleProfileService lifestyleProfileService;
    private LifestyleAiService lifestyleAiService;

    @Autowired
    public LifestyleProfileController(LifestyleProfileService theLifestyleProfileService, LifestyleAiService theLifestyleAiService){
        lifestyleProfileService = theLifestyleProfileService;
        lifestyleAiService = theLifestyleAiService;
    }

    @GetMapping("/lifestyle-profiles")
    public List<LifestyleProfileDto> findAll(){
        return lifestyleProfileService.findAll();
    }

    @GetMapping("/lifestyle-profiles/{lifestyleProfileId}")
    public LifestyleProfileDto getLifestyleProfileById(@PathVariable int lifestyleProfileId){
        LifestyleProfileDto theLifestyleProfile = lifestyleProfileService.findById(lifestyleProfileId);

        if (theLifestyleProfile == null) {
            throw new RuntimeException("LifestyleProfile id not found - " + lifestyleProfileId);
        }

        return theLifestyleProfile;
    }

    @PreAuthorize("#theLifestyleProfile.id == authentication.principal.lifestyleProfile.id or hasRole('ADMIN')")
    @PutMapping("/lifestyle-profiles")
    public void updateLifestyleProfile(@RequestBody LifestyleProfileDto theLifestyleProfile) {
        lifestyleProfileService.save(theLifestyleProfile);
    }


    @PostMapping("/lifestyle-profiles")
    public LifestyleProfile addLifestyleProfile(@RequestBody LifestyleProfileDto theLifestyleProfile) {

        theLifestyleProfile.setId(0);
        LifestyleProfile profile = lifestyleProfileService.save(theLifestyleProfile);
        return profile;
    }

    @PreAuthorize("#lifestyleProfileId == authentication.principal.lifestyleProfileId or hasRole('ADMIN')")
    @DeleteMapping("/lifestyle-profiles/{lifestyleProfileId}")
    public void deleteLifestyleProfile(@PathVariable int lifestyleProfileId) {
        LifestyleProfileDto tempLifestyleProfile = lifestyleProfileService.findById(lifestyleProfileId);

        if (tempLifestyleProfile == null) {
            throw new RuntimeException("LifestyleProfile id not found - " + lifestyleProfileId);
        }

        lifestyleProfileService.deleteById(lifestyleProfileId);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/lifestyle-profile/generate")
    public String generate(@RequestBody LifestyleGenerateRequestDto request) {
        return lifestyleAiService.generateLifestyleProfile(request);
    }
}
