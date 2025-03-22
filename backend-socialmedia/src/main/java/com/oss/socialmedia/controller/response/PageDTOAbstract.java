package com.oss.socialmedia.controller.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class PageDTOAbstract {
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private Long totalElements;
}
