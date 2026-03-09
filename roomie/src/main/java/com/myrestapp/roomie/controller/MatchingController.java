package com.myrestapp.roomie.controller;

import com.myrestapp.roomie.dto.MatchResultDto;
import com.myrestapp.roomie.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class MatchingController {

    private MatchingService matchingService;

    @Autowired
    public MatchingController(MatchingService theMatchingService) {
        matchingService = theMatchingService;
    }

    @GetMapping("matchings/{lifestyleProfileId}")
    public ResponseEntity<List<MatchResultDto>> getMatches(@PathVariable Integer lifestyleProfileId) {

        List<MatchResultDto> matches =
                matchingService.findMatches(lifestyleProfileId);

        return ResponseEntity.ok(matches);
    }
}
