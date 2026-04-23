package com.carenode.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class AIBridgeService {

    private final WebClient webClient;

    public AIBridgeService(@Value("${ai.service.url}") String aiServiceUrl) {
        this.webClient = WebClient.builder().baseUrl(aiServiceUrl).build();
    }

    public Mono<SoapResponse> transcribeToSoap(MultipartFile audioFile) {
        MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
        formData.add("audio", audioFile.getResource());
        return webClient.post()
                .uri("/transcribe-soap")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(formData))
                .retrieve()
                .bodyToMono(SoapResponse.class);
    }

    public Mono<DiagnosticResponse> diagnoseImage(MultipartFile imageFile, String modelType) {
        MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
        formData.add("image", imageFile.getResource());
        formData.add("model_type", modelType);
        return webClient.post()
                .uri("/diagnose/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(formData))
                .retrieve()
                .bodyToMono(DiagnosticResponse.class);
    }

    public static class SoapResponse {
        private String transcript;
        private Object soap;

        // getters and setters
        public String getTranscript() { return transcript; }
        public void setTranscript(String transcript) { this.transcript = transcript; }
        public Object getSoap() { return soap; }
        public void setSoap(Object soap) { this.soap = soap; }
    }

    public static class DiagnosticResponse {
        private String prediction;
        private double confidence;
        private boolean requiresReferral;

        // getters and setters
        public String getPrediction() { return prediction; }
        public void setPrediction(String prediction) { this.prediction = prediction; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
        public boolean isRequiresReferral() { return requiresReferral; }
        public void setRequiresReferral(boolean requiresReferral) { this.requiresReferral = requiresReferral; }
    }
}