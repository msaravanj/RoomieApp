package com.myrestapp.roomie.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myrestapp.roomie.service.EmbeddingService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    private final WebClient webClient;
    private final ObjectMapper mapper;

    public EmbeddingServiceImpl(
            ObjectMapper mapper,
            @Value("${spring.ai.openai.api-key}") String apiKey
    ) {
        this.mapper = mapper;

        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public List<Double> createEmbedding(String text) {

        EmbeddingRequest request = new EmbeddingRequest(
                "text-embedding-3-small",
                text
        );

        EmbeddingResponse response = webClient.post()
                .uri("/embeddings")
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(
                                        new RuntimeException("OpenAI API error: " + body)
                                ))
                )
                .bodyToMono(EmbeddingResponse.class)
                .block();

        if (response == null || response.getData() == null || response.getData().isEmpty()) {
            throw new RuntimeException("Invalid response from OpenAI API");
        }

        return response.getData().get(0).getEmbedding();
    }

    @Override
    public String toJson(List<Double> embedding) {
        try {
            return mapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing embedding", e);
        }
    }

    @Override
    public List<Double> fromJson(String json) {
        try {
            return mapper.readValue(json, new TypeReference<List<Double>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error deserializing embedding", e);
        }
    }

    // ================= DTOs =================

    @Data
    static class EmbeddingRequest {
        private final String model;
        private final String input;
    }

    @Data
    static class EmbeddingResponse {
        private List<DataItem> data;

        @Data
        static class DataItem {
            private List<Double> embedding;
        }
    }
}