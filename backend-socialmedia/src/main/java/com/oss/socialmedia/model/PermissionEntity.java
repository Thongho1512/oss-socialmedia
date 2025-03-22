    package com.oss.socialmedia.model;

    import java.time.Instant;

    import org.springframework.data.annotation.Id;
    import org.springframework.data.mongodb.core.mapping.Document;
    import org.springframework.data.mongodb.core.mapping.Field;

    import jakarta.validation.constraints.NotBlank;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Document(collection = "permissions")
    public class PermissionEntity {
        @Id
        private String id;

        @NotBlank(message = "name không được để trống")
        private String name;

        @NotBlank(message = "apiPath không được để trống")
        @Field("api_path")
        private String apiPath;

        @NotBlank(message = "method không được để trống")
        private String method;

        private String module;
        private Instant createdAt;
        private Instant updatedAt;
        private String createdBy;
        private String updatedBy;
    }
