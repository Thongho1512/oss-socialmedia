package com.oss.socialmedia.service.impl;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.BaseEntity;
import com.oss.socialmedia.service.GenericService;

@Service
@Transactional
public abstract class GenericServiceImpl<T, ID, R extends MongoRepository<T, ID>> 
        implements GenericService<T, ID> {

    protected R repository;  // Generic repository for T

    protected GenericServiceImpl(R repository){
        this.repository = repository;
    }

    // @Override
    // public List<T> findAll() {
    //     return (List<T>) repository.findAll();
    // }

    @Override
    public T findById(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    @Override
    public ID add(T entity) {
        // Set audit fields if applicable (e.g., createdAt)
        if (entity instanceof BaseEntity) {
            ((BaseEntity) entity).setCreatedAt(Instant.now());
        }
        T saved = repository.save(entity);
        // Assuming the ID is generated, return the ID of the saved entity:
        return getEntityId(saved);
    }

    @Override
    public void update(ID id, T entity) {
        T existing = findById(id);
        // Preserve creation metadata if needed
        if (entity instanceof BaseEntity && existing instanceof BaseEntity) {
            ((BaseEntity) entity).setCreatedAt(((BaseEntity) existing).getCreatedAt());
            ((BaseEntity) entity).setCreatedBy(((BaseEntity) existing).getCreatedBy());
            ((BaseEntity) entity).setUpdatedAt(Instant.now());
        }
        repository.save(entity);
    }

    @Override
    public void delete(ID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found");
        }
        repository.deleteById(id);
    }

    // Helper to extract ID from an entity (assuming getId() method exists in entity)
    protected ID getEntityId(T entity) {
        try {
            Method getId = entity.getClass().getMethod("getId");
            @SuppressWarnings("unchecked")
            ID id = (ID) getId.invoke(entity);
            return id;
        } catch (Exception e) {
            return null; // or throw an IllegalStateException
        }
    }
    // @Override
    // public Page<T> findAll(String keyword, String sort, int page, int size) {
    //     // Parse sorting string (format: "field:asc" or "field:desc")
    //     Sort.Order order = Sort.Order.by("id").with(Sort.Direction.ASC);
    //     if (StringUtils.hasLength(sort)) {
    //         // Example sort value: "name:desc"
    //         String[] parts = sort.split(":");
    //         if (parts.length == 2) {
    //             String field = parts[0];
    //             Sort.Direction direction = parts[1].equalsIgnoreCase("desc") 
    //                                     ? Sort.Direction.DESC 
    //                                     : Sort.Direction.ASC;
    //             order = new Sort.Order(direction, field);
    //         }
    //     }
    //     // 0-based page index for Pageable
    //     int pageIndex = (page > 0) ? page - 1 : 0;
    //     Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(order));

    //     // If keyword search is supported, use it; otherwise, do a normal findAll
    //     if (StringUtils.hasLength(keyword) && repository instanceof KeywordSearchable) {
    //         // KeywordSearchable is an interface your repos can implement for search
    //         return ((KeywordSearchable<T>) repository).searchByKeyword(keyword, pageable);
    //     } else {
    //         return repository.findAll(pageable);
    //     }
    // }

}

