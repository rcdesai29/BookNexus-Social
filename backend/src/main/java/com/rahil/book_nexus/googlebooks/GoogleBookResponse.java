package com.rahil.book_nexus.googlebooks;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleBookResponse {
    private List<GoogleBook> items;
    private Integer totalItems;
    private String kind;
}
