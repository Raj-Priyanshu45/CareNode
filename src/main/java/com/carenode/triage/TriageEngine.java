package com.carenode.triage;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class TriageEngine {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public TriageResult score(EncounterData data) {
        int score = 0;
        Map<String, Object> rationale = new HashMap<>();

        // Vital signs
        if (data.getSpO2() != null && data.getSpO2() < 94) {
            score += 30;
            rationale.put("spO2_low", "SpO2 below 94%");
        }
        if (data.getHeartRate() != null && (data.getHeartRate() > 120 || data.getHeartRate() < 50)) {
            score += 20;
            rationale.put("heart_rate_abnormal", "Heart rate abnormal");
        }
        if (data.getSystolic() != null && (data.getSystolic() > 180 || data.getSystolic() < 90)) {
            score += 25;
            rationale.put("blood_pressure_abnormal", "Blood pressure abnormal");
        }

        // AI diagnostic flags
        if (data.getDiagnosticConfidence() != null && data.getDiagnosticConfidence() > 0.80 &&
            !"normal".equals(data.getPrediction())) {
            score += 25;
            rationale.put("ai_diagnostic_flag", "High confidence abnormal diagnostic");
        }

        // Demographics
        if (Boolean.TRUE.equals(data.getPregnant())) {
            score += 15;
            rationale.put("pregnant", "Pregnancy risk factor");
        }
        if (data.getAge() != null && (data.getAge() < 5 || data.getAge() > 70)) {
            score += 10;
            rationale.put("age_extreme", "Extreme age");
        }

        String severity = scoreToSeverity(score);
        rationale.put("total_score", score);

        try {
            return new TriageResult(severity, score, objectMapper.writeValueAsString(rationale));
        } catch (Exception e) {
            return new TriageResult(severity, score, "{}");
        }
    }

    private String scoreToSeverity(int score) {
        if (score >= 80) return "CRITICAL";
        if (score >= 50) return "HIGH";
        if (score >= 20) return "MEDIUM";
        return "LOW";
    }

    public static class EncounterData {
        private Integer spO2;
        private Integer heartRate;
        private Integer systolic;
        private Double diagnosticConfidence;
        private String prediction;
        private Boolean pregnant;
        private Integer age;

        // getters and setters
        public Integer getSpO2() { return spO2; }
        public void setSpO2(Integer spO2) { this.spO2 = spO2; }
        public Integer getHeartRate() { return heartRate; }
        public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }
        public Integer getSystolic() { return systolic; }
        public void setSystolic(Integer systolic) { this.systolic = systolic; }
        public Double getDiagnosticConfidence() { return diagnosticConfidence; }
        public void setDiagnosticConfidence(Double diagnosticConfidence) { this.diagnosticConfidence = diagnosticConfidence; }
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }
        public Boolean getPregnant() { return pregnant; }
        public void setPregnant(Boolean pregnant) { this.pregnant = pregnant; }
        public boolean isPregnant() { return Boolean.TRUE.equals(pregnant); }
        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }
    }

    public static class TriageResult {
        private String severity;
        private int score;
        private String rationale;

        public TriageResult(String severity, int score, String rationale) {
            this.severity = severity;
            this.score = score;
            this.rationale = rationale;
        }

        public String getSeverity() { return severity; }
        public int getScore() { return score; }
        public String getRationale() { return rationale; }
    }
}