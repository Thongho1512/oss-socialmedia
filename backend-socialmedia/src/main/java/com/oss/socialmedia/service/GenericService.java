package com.oss.socialmedia.service;

import java.util.List;

public interface GenericService<T, ID> {
    List<T> findAll(String keyword, String sort, int page, int size);              // or paginated findAll
    T findById(ID id);
    ID add(T entity);               // returns generated ID (if applicable)
    void update(ID id, T entity);
    void delete(ID id);
}