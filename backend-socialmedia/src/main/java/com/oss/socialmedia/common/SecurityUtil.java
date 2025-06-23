package com.oss.socialmedia.common;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.util.Base64;
import com.oss.socialmedia.controller.response.ResLoginDTO;
import com.oss.socialmedia.service.PermissionService;
import com.oss.socialmedia.service.RoleService;
import com.oss.socialmedia.service.UserService;


@Service
public class SecurityUtil {

    private final JwtEncoder jwtEncoder;
    private final UserService userService;
    private final RoleService roleService;
    private final PermissionService permissionService;

    public SecurityUtil(JwtEncoder jwtEncoder, UserService userService,
                        RoleService roleService, PermissionService permissionService) {
        this.jwtEncoder = jwtEncoder;
        this.userService = userService;
        this.permissionService = permissionService;
        this.roleService = roleService;
    }

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${jwt.base64-secret}")
    private String jwtKey;

    @Value("${jwt.access-token-validity-in-seconds}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpiration;

    /***
     * 
     * @param email
     * @param dto
     * @param typeOfToken
     * @return
     */
    private Map<String, Object> getJwtClaimSet(String email, ResLoginDTO dto, String typeOfToken){
        Map<String, Object> map = new TreeMap<>();
        ResLoginDTO.UserInsideToken userToken = new ResLoginDTO.UserInsideToken();
        userToken.setId(dto.getUser().getId());
        userToken.setEmail(dto.getUser().getEmail());
        userToken.setUsername(dto.getUser().getUsername());

        Instant now = Instant.now();
        Instant validity;
        if(typeOfToken.equals("accessToken")){
            validity = now.plus(this.accessTokenExpiration, ChronoUnit.SECONDS);
        } 
        else {
            validity = now.plus(this.refreshTokenExpiration, ChronoUnit.SECONDS);
        }

        Set<String> rolesId = userService.findById(dto.getUser().getId()).getRoles();
        Set<String> rolesName = new HashSet<>();
        for(String roleId : rolesId){
            rolesName.add(roleService.findById(roleId).getName());
        }

        //handle permission
        Set<String> permissionsId  = new HashSet<>();
        for(String role: rolesId){
            permissionsId.addAll(roleService.findById(role).getPermissions());
        }
        Set<String> permissionsName = new HashSet<>();
        for(String permissionId : permissionsId){
            permissionsName.add(permissionService.findById(permissionId).getName());
        }

        // @formatter:off
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuedAt(now)
            .expiresAt(validity)
            .subject(email)
            .claim("user", userToken)
            .claim("role", rolesName)
            .claim("permission", permissionsName)
            .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        map.put("jwsHeader", jwsHeader);
        map.put("claims", claims);
        return map;
    }

    /***
     * 
     * @param email
     * @param dto
     * @return
     */
    // access token
    public String createAccessToken(String email, ResLoginDTO dto) {
        Map<String, Object> map = getJwtClaimSet(email, dto, "accessToken");
        return this.jwtEncoder.encode(JwtEncoderParameters.from((JwsHeader)map.get("jwsHeader"), (JwtClaimsSet)map.get("claims"))).getTokenValue();
        //return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();

    }

    /***
     * 
     * @param email
     * @param dto
     * @return
     */
    public String createRefreshToken(String email, ResLoginDTO dto) {
        Map<String, Object> map = getJwtClaimSet(email, dto, "refreshToken");
        return this.jwtEncoder.encode(JwtEncoderParameters.from((JwsHeader)map.get("jwsHeader"), (JwtClaimsSet)map.get("claims"))).getTokenValue();

    }

    /***
     * 
     * @return
     */
    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.from(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length,
                JWT_ALGORITHM.getName());
    }

    /***
     * 
     * @param token
     * @return
     */
    public Jwt checkValidRefreshToken(String token){
     NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(
                getSecretKey()).macAlgorithm(SecurityUtil.JWT_ALGORITHM).build();
                try {
                     return jwtDecoder.decode(token);
                } catch (Exception e) {
                    System.out.println(">>> Refresh Token error: " + e.getMessage());
                    throw e;
                }
    }
    
    /**
     * Get the login of the current user.
     *
     * @return the login of the current user.
     */
    public static Optional<String> getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(extractPrincipal(securityContext.getAuthentication()));
    }

    
    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetails springSecurityUser) {
            return springSecurityUser.getUsername();
        } else if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        } else if (authentication.getPrincipal() instanceof String s) {
            return s;
        }
        return null;
    }

    /**
     * Get the JWT of the current user.
     *
     * @return the JWT of the current user.
     */
    public static Optional<String> getCurrentUserJWT() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(securityContext.getAuthentication())
            .filter(authentication -> authentication.getCredentials() instanceof String)
            .map(authentication -> (String) authentication.getCredentials());
    }
}
