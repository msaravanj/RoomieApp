package com.myrestapp.roomie.service;

import java.util.List;

public interface EmbeddingService {

    List<Double> createEmbedding(String text);

    List<Double> fromJson(String json);

    String toJson(List<Double> embedding);

}
