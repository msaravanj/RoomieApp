package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.dto.HousingDto;
import com.myrestapp.roomie.service.HousingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class HousingController {

    private HousingService housingService;

    @Autowired
    public HousingController(HousingService theHousingService) {
        housingService = theHousingService;
    }

    @GetMapping("/housings")
    public List<HousingDto> findAll(){
         return housingService.findAll();
    }

    @GetMapping("/housings/{housingId}")
    public HousingDto getHousingById(@PathVariable int housingId){
        HousingDto theHousing = housingService.findById(housingId);

        if (theHousing == null) {
            throw new RuntimeException("Housing id not found - " + housingId);
        }

        return theHousing;
    }

    @GetMapping("/housings/user/{userId}")
    public HousingDto getHousingByUserId(@PathVariable int userId){
        HousingDto theHousing = housingService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Housing for user id not found - " + userId));

        return theHousing;
    }

    @PreAuthorize("#theHousing.userId == authentication.principal.id or hasRole('ADMIN')")
    @PutMapping("/housings")
    public void updateHousing(@RequestBody HousingDto theHousing) {
        housingService.save(theHousing);
    }


    @PreAuthorize("#theHousing.userId == authentication.principal.id or hasRole('ADMIN')")
    @PostMapping("/housings")
    public ResponseEntity<HousingDto> addHousing(@RequestBody HousingDto theHousing) {
        theHousing.setId(0);
        HousingDto saved = housingService.save(theHousing);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasRole('ADMIN') or #theHousing.userId == authentication.principal.id")
    @DeleteMapping("/housings/{housingId}")
    public void deleteHousing(@PathVariable int housingId) {
        HousingDto tempHousing = housingService.findById(housingId);

        if (tempHousing == null) {
            throw new RuntimeException("Housing id not found - " + housingId);
        }

        housingService.deleteById(housingId);
    }

}
