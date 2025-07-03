    package com.oss.socialmedia.model;


    import org.springframework.data.mongodb.core.mapping.Document;
    import org.springframework.data.mongodb.core.mapping.Field;

    import jakarta.validation.constraints.NotBlank;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;
    import lombok.experimental.SuperBuilder;
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @SuperBuilder
    @Document(collection = "permissions")
    public class PermissionEntity extends BaseEntity{

        @NotBlank(message = "name không được để trống")
        private String name;

        @NotBlank(message = "apiPath không được để trống")
        @Field("api_path")
        private String apiPath;

        @NotBlank(message = "method không được để trống")
        private String method;

        private String module;
        
    }
