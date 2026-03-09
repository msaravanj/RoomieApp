package com.myrestapp.roomie.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myrestapp.roomie.service.EmbeddingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public EmbeddingServiceImpl(@Value("${OPENAI_API_KEY}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public List<Double> createEmbedding(String text) {
        Map<String, Object> body = Map.of(
                "model", "text-embedding-3-small",
                "input", text);

        Map response = webClient.post()
                .uri("/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<List<Double>> data =
                (List<List<Double>>) ((List) response.get("data"))
                        .stream()
                        .map(d -> ((Map) d).get("embedding"))
                        .toList();

        return data.get(0);
    }
    @Override
    public String toJson(List<Double> embedding) {
        try {
            return mapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Override
    public List<Double> fromJson(String json) {
        try {
            return mapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
