    package com.oss.socialmedia.controller.request.permission;



    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public class ReqCreationPermissionDTO {
        private String name;

        private String apiPath;

        private String method;

        private String module;
    }
