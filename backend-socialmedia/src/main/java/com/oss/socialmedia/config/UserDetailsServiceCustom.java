package com.oss.socialmedia.config;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.oss.socialmedia.model.RoleEntity;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.service.RoleService;
import com.oss.socialmedia.service.UserService;

@Component("userDetailsService")
public class UserDetailsServiceCustom implements UserDetailsService {

    private final UserService userService;
    private final RoleService roleService;

    public UserDetailsServiceCustom(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = this.userService.findByEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("Username/password không hợp lệ");
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        Set<String> roles = user.getRoles(); // Set<String>

        for (String roleName : roles) {
            RoleEntity role = roleService.findByName(roleName);
            if (role != null && role.getPermissions() != null) {
                for (String perm : role.getPermissions()) {
                    authorities.add(new SimpleGrantedAuthority(perm)); // e.g., "READ_DOCUMENT"
                }
            }
        }

        return new User(
            user.getEmail(), 
            user.getPassword(), 
            authorities);

    }

}
