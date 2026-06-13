package org.kevinchege47.ecommercebackend.controller;

import lombok.RequiredArgsConstructor;
import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.kevinchege47.ecommercebackend.service.FareCalculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fare")
@RequiredArgsConstructor
public class FareController {

    private final FareCalculationService fareCalculationService;

    @GetMapping("/calculate")
    public ResponseEntity<Dtos.FareResponse> calculate(
            @RequestParam double distanceKm,
            @RequestParam(required = false) Double surgeMultiplier) {

        Dtos.FareResponse response = (surgeMultiplier != null)
            ? fareCalculationService.calculate(distanceKm, surgeMultiplier)
            : fareCalculationService.calculate(distanceKm);

        return ResponseEntity.ok(response);
    }
}
