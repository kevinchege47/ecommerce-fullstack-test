package org.kevinchege47.ecommercebackend.service;

import org.kevinchege47.ecommercebackend.dto.Dtos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FareCalculationService {

    private final double baseFare;
    private final double perKmRate;
    private final double minimumFare;
    private final double defaultSurgeMultiplier;

    public FareCalculationService(
            @Value("${fare.base:50.0}") double baseFare,
            @Value("${fare.per-km-rate:15.0}") double perKmRate,
            @Value("${fare.minimum:80.0}") double minimumFare,
            @Value("${fare.surge-multiplier:1.0}") double defaultSurgeMultiplier) {
        this.baseFare = baseFare;
        this.perKmRate = perKmRate;
        this.minimumFare = minimumFare;
        this.defaultSurgeMultiplier = defaultSurgeMultiplier;
    }

    public Dtos.FareResponse calculate(double distanceKm) {
        return calculate(distanceKm, defaultSurgeMultiplier);
    }

    public Dtos.FareResponse calculate(double distanceKm, double surgeMultiplier) {
        if (distanceKm <= 0) {
            throw new IllegalArgumentException("distanceKm must be greater than 0");
        }

        double effectiveSurge = Math.max(1.0, surgeMultiplier);
        double distanceCharge = distanceKm * perKmRate;
        double raw = (baseFare + distanceCharge) * effectiveSurge;
        double finalFare = Math.max(raw, minimumFare);

        return Dtos.FareResponse.builder()
            .distanceKm(distanceKm)
            .baseFare(baseFare)
            .distanceCharge(round2(distanceCharge))
            .surgeMultiplier(effectiveSurge)
            .calculatedFare(round2(raw))
            .finalFare(round2(finalFare))
            .minimumApplied(raw < minimumFare)
            .currency("KES")
            .build();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
