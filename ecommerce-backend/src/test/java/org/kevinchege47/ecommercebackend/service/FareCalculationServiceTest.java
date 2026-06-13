package org.kevinchege47.ecommercebackend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kevinchege47.ecommercebackend.dto.Dtos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("FareCalculationService")
class FareCalculationServiceTest {

    private FareCalculationService service;

    @BeforeEach
    void setUp() {
        service = new FareCalculationService(50.0, 15.0, 80.0, 1.0);
    }


    @Nested
    @DisplayName("Normal fares (no surge)")
    class NormalFares {

        @Test
        @DisplayName("short trip: 1 km → 80 KES (minimum applied)")
        void shortTrip() {
            Dtos.FareResponse r = service.calculate(1.0);
            assertThat(r.getFinalFare()).isEqualTo(80.0);
            assertThat(r.isMinimumApplied()).isTrue();
            assertThat(r.getSurgeMultiplier()).isEqualTo(1.0);
            assertThat(r.getCurrency()).isEqualTo("KES");
        }

        @Test
        @DisplayName("standard trip: 10 km → 200 KES")
        void standardTrip() {
            Dtos.FareResponse r = service.calculate(10.0);
            assertThat(r.getFinalFare()).isEqualTo(200.0);
            assertThat(r.getCalculatedFare()).isEqualTo(200.0);
            assertThat(r.isMinimumApplied()).isFalse();
        }

        @Test
        @DisplayName("longer trip: 25 km → 425 KES")
        void longerTrip() {
            Dtos.FareResponse r = service.calculate(25.0);
            assertThat(r.getFinalFare()).isEqualTo(425.0);
        }

        @Test
        @DisplayName("decimal distance: 3.5 km → 102.5 KES")
        void decimalDistance() {
            Dtos.FareResponse r = service.calculate(3.5);
            assertThat(r.getFinalFare()).isEqualTo(102.5);
        }
    }


    @Nested
    @DisplayName("Minimum fare enforcement")
    class MinimumFare {

        @Test
        @DisplayName("very short trip 0.1 km → minimum (80) applied")
        void veryShortTrip() {
            Dtos.FareResponse r = service.calculate(0.1);
            assertThat(r.getFinalFare()).isEqualTo(80.0);
            assertThat(r.isMinimumApplied()).isTrue();
            assertThat(r.getCalculatedFare()).isLessThan(80.0);
        }

        @Test
        @DisplayName("trip exactly at minimum boundary: 2 km → exactly 80 not applied")
        void exactlyAtMinimum() {
            Dtos.FareResponse r = service.calculate(2.0);
            assertThat(r.getFinalFare()).isEqualTo(80.0);
            assertThat(r.isMinimumApplied()).isFalse();
        }
    }


    @Nested
    @DisplayName("Surge pricing")
    class SurgeScenarios {

        @Test
        @DisplayName("1.5× surge on 10 km trip → 300 KES")
        void surgeFiftyPercent() {
            Dtos.FareResponse r = service.calculate(10.0, 1.5);
            assertThat(r.getFinalFare()).isEqualTo(300.0);
            assertThat(r.getSurgeMultiplier()).isEqualTo(1.5);
        }

        @Test
        @DisplayName("2.0× surge on 10 km trip → 400 KES")
        void surgeDouble() {
            Dtos.FareResponse r = service.calculate(10.0, 2.0);

            assertThat(r.getFinalFare()).isEqualTo(400.0);
        }

        @Test
        @DisplayName("surge < 1.0 is clamped to 1.0")
        void surgeBelowOneClamped() {
            Dtos.FareResponse r = service.calculate(10.0, 0.5);
            assertThat(r.getSurgeMultiplier()).isEqualTo(1.0);
            assertThat(r.getFinalFare()).isEqualTo(200.0);
        }

        @Test
        @DisplayName("surge with minimum still applied: short trip × 1.5 surge still hits minimum")
        void surgeWithMinimum() {
            Dtos.FareResponse r = service.calculate(0.1, 1.5);
            assertThat(r.getFinalFare()).isEqualTo(80.0);
            assertThat(r.isMinimumApplied()).isTrue();
        }

        @Test
        @DisplayName("surge moves trip above minimum: 0.5 km × 2.0 surge → 115 > 80")
        void surgePushesAboveMinimum() {
            Dtos.FareResponse r = service.calculate(0.5, 2.0);
            assertThat(r.getFinalFare()).isEqualTo(115.0);
            assertThat(r.isMinimumApplied()).isFalse();
        }
    }


    @Nested
    @DisplayName("Input validation")
    class Validation {

        @Test
        @DisplayName("zero distance throws IllegalArgumentException")
        void zeroDistance() {
            assertThatThrownBy(() -> service.calculate(0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("distanceKm must be greater than 0");
        }

        @Test
        @DisplayName("negative distance throws IllegalArgumentException")
        void negativeDistance() {
            assertThatThrownBy(() -> service.calculate(-5.0))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }


    @Test
    @DisplayName("response contains all expected fields")
    void responseShape() {
        Dtos.FareResponse r = service.calculate(10.0, 1.2);
        assertThat(r.getDistanceKm()).isEqualTo(10.0);
        assertThat(r.getBaseFare()).isEqualTo(50.0);
        assertThat(r.getDistanceCharge()).isEqualTo(150.0);
        assertThat(r.getSurgeMultiplier()).isEqualTo(1.2);
        assertThat(r.getCalculatedFare()).isEqualTo(240.0);  // 200 * 1.2
        assertThat(r.getFinalFare()).isEqualTo(240.0);
        assertThat(r.getCurrency()).isEqualTo("KES");
    }
}
