package com.rahil.book_nexus.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookResponse {

    private Integer id;

    private String title;

    private String authorName;

    private String isbn;

    private String synopsis;

    private String owner;

    private Object cover; // Can be byte[] for local files or String for URLs

    private double rate;

    private boolean archived;

    private boolean shareable;

}