package com.oss.socialmedia.model;

import java.io.Serializable;
import java.time.Instant;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BaseEntity implements Serializable{
    @Id
    protected String id;
    protected Instant createdAt;
    protected Instant updatedAt;
    protected String createdBy;
    protected String updatedBy;
}
