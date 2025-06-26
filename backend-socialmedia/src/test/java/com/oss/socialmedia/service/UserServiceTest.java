package com.oss.socialmedia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.oss.socialmedia.controller.request.ReqCreationUserDTO;
import com.oss.socialmedia.controller.request.ReqPasswordUserDTO;
import com.oss.socialmedia.controller.response.UserPageDTO;
import com.oss.socialmedia.exception.ResourceNotFoundException;
import com.oss.socialmedia.model.UserEntity;
import com.oss.socialmedia.repository.UserRepository;
import com.oss.socialmedia.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    private UserService userService;


    private @Mock UserRepository userRepository;
    private @Mock PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp(){
        userService = new UserServiceImpl(userRepository, passwordEncoder);
    }

    
    

    // Initialize test data
    // This method is called once before all tests in this class
    @BeforeAll
    static void initData(){

    }

    
    @Nested
    @DisplayName("Test the method for adding a user")
    class AddUserTests {
        private static ReqCreationUserDTO reqCreationUserDTO;
        private static ReqCreationUserDTO reqCreationUserNoPasswordDTO;
        @BeforeAll
        static void initData(){
            
            // Initialize ReqCreationUserDTO with valid data
            reqCreationUserDTO = ReqCreationUserDTO.builder()
                    .email("thongho1512@gmail.com")
                    .password("123")
                    .username("thongho")
                    .firstName("Ho")
                    .lastName("Thong")
                    .phoneNumber("1234567890")
                    .build();
            reqCreationUserNoPasswordDTO = ReqCreationUserDTO.builder()
                    .email("thongho1512@gmail.com")
                    .password("")
                    .username("thongho")
                    .firstName("Ho")
                    .lastName("Thong")
                    .phoneNumber("1234567890")
                    .build();
                
        }
        @Test
        @DisplayName("Should throw IllegalArgumentException when email already exists")
        void testAddWithExistEmail() {
            // Arrange
            when(userRepository.existsByEmail(reqCreationUserDTO.getEmail()))
                .thenReturn(true);

            // Act & assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, 
                () -> { userService.add(reqCreationUserDTO); }
            );
            assertNotNull(exception);
            assertEquals("Email already exists", exception.getMessage());
            verify(userRepository).existsByEmail(reqCreationUserDTO.getEmail());
        }

        @Test
        @DisplayName("should throw IllegalArgumentException when username already exists")
        void testAddUserWithExistUsername(){
            // Arrange
            when(userRepository.existsByUsername(reqCreationUserDTO.getUsername())).thenReturn(true);

            // Act % assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.add(reqCreationUserDTO));
            assertNotNull(exception);
            assertEquals("Username already exists", exception.getMessage());
        }

        @Test
        @DisplayName("should throw IllegalArgumentException when password is null")
        void testAddUserWithNullPassword(){
            //Arrange
            when(userRepository.existsByEmail(reqCreationUserNoPasswordDTO.getEmail())).thenReturn(false);
            when(userRepository.existsByUsername(reqCreationUserNoPasswordDTO.getUsername())).thenReturn(false);
            // act & assert
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.add(reqCreationUserNoPasswordDTO));
            assertNotNull(exception);
            assertEquals("Password cannot be empty", exception.getMessage());
        }

        @Test
        @DisplayName("should return id user when create a new user successfully")
        void AddUserSuccess(){
            // Arrange
            String hashedPassword = "abcd";
            when(userRepository.existsByEmail(reqCreationUserDTO.getEmail())).thenReturn(false);
            when(userRepository.existsByUsername(reqCreationUserDTO.getUsername())).thenReturn(false);
            when(passwordEncoder.encode(reqCreationUserDTO.getPassword())).thenReturn(hashedPassword);
            when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
                UserEntity u = invocation.getArgument(0, UserEntity.class);
                u.setId("123123"); 
                return u;
            });

            // act
            String id = userService.add(reqCreationUserDTO);
            // assert
            assertEquals("123123", id);
            verify(userRepository).save(any(UserEntity.class));
        }
    }
    @Nested
    @DisplayName("Test the changePassword method")
    class ChangePasswordTest {
        private ReqPasswordUserDTO reqPasswordUserDTO;
        private UserEntity user;
        @BeforeEach
        void initData(){
            reqPasswordUserDTO = ReqPasswordUserDTO.builder()
                .id("123")
                .comfirmPassword("thongho")
                .password("thongho")
                .build();

            user = UserEntity.builder()
                .id("123")
                .password("abc")
                .build();
            
        }

        @Test
        @DisplayName("should change password when comfirmed correctly")
        void testChangePassword_Success() {
            //Arrange
            when(userRepository.findById("123")).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(reqPasswordUserDTO.getPassword())).thenReturn("HashedPassword");
            //act
            userService.changePassword(reqPasswordUserDTO);
            //assert
            assertEquals("HashedPassword", user.getPassword());
            verify(userRepository).save(user);
        }
        @Test
        @DisplayName("Should not change password if comfirmation doesn't match")
        void testChangePassWord_PasswordMismatc(){
            //Arrange
            ReqPasswordUserDTO req = ReqPasswordUserDTO.builder()
                .id("123")
                .password("newPassword")
                .comfirmPassword("ComfirmNewPassword")
                .build();
            when(userRepository.findById(req.getId())).thenReturn(Optional.of(user));
            //act
            userService.changePassword(req);
            //assert
            verify(userRepository).findById(req.getId());
            verify(userRepository, never()).save(any());
        }
        @Test
        @DisplayName("Should throw exception if user not found")
        void testChangePassword_UserNotFound(){
            //Arrange
            when(userRepository.findById(reqPasswordUserDTO.getId())).thenReturn(Optional.empty());
            //act
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, 
                () -> userService.changePassword(reqPasswordUserDTO)
            );
            // assert
            assertEquals("User not found", exception.getMessage());
            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository, never()).save(any());
        }
    }

    @Test
    void testConvertToUserDTO() {

    }

    @Test
    void testDelete() {

    }


    private static UserEntity user1;
    private static UserEntity user2;
    @Nested
    @DisplayName("Test the method for finding all users")
    class FindAllTests {
        @BeforeAll
        static void initData(){
            user1 = UserEntity.builder()
                    .id("1")
                    .avatar_url("tt.img")
                    .bio("success")
                    .email("thongho1512@gmail.com")
                    .password("123")
                    .firstName("Ho")
                    .lastName("Thong")
                    .createdAt(Instant.now())
                    .isPrivate(false)
                    .phoneNumber("1234567890")
                    .build();
            user2 = UserEntity.builder()
                    .id("2")
                    .avatar_url("tt.img")
                    .bio("success")
                    .email("thanggap@gmail.com")
                    .password("123")
                    .firstName("Thang")
                    .lastName("Gap")
                    .createdAt(Instant.now())
                    .isPrivate(false)
                    .phoneNumber("1234567890")
                    .build();
        }
        @Test
        @DisplayName("should return all active users when no keyword is supplied")
        void findAllWithoutKeyword() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, null, 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            assertEquals(1, result.getPageNumber());
            assertEquals(5, result.getPageSize());
            assertEquals(1, result.getTotalPages());
            assertEquals(2, result.getUsers().size());
            assertEquals("Ho", result.getUsers().get(0).getFirstName());
            assertEquals("Thong", result.getUsers().get(0).getLastName());
            assertEquals("Thang", result.getUsers().get(1).getFirstName());
            assertEquals("Gap", result.getUsers().get(1).getLastName());
            verify(userRepository).findAll(any(Pageable.class));
            verify(userRepository, never()).searchByKeyword(anyString(), any(Pageable.class));
        }

        @Test
        @DisplayName("should return filtered users when keyword is provided")
        void findAllWithKeyword() {
            // Arrange
            String keyword = "Ho";
            Page<UserEntity> page = new PageImpl<>(List.of(user1));
            when(userRepository.searchByKeyword(anyString(), any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(keyword, null, 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            assertEquals(1, result.getUsers().size());
            assertEquals("Ho", result.getUsers().get(0).getFirstName());
            verify(userRepository).searchByKeyword(anyString(), any(Pageable.class));
            verify(userRepository, never()).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should return empty result when no users match keyword")
        void findAllWithKeywordNoResults() {
            // Arrange
            String keyword = "NonExistent";
            Page<UserEntity> emptyPage = new PageImpl<>(List.of());
            when(userRepository.searchByKeyword(anyString(), any(Pageable.class)))
                .thenReturn(emptyPage);

            // Act
            UserPageDTO result = userService.findAll(keyword, null, 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(0, result.getTotalElements());
            assertEquals(0, result.getUsers().size());
        }

        @Test
        @DisplayName("should apply ascending sort when sort parameter is provided")
        void findAllWithAscendingSort() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, "firstName:asc", 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should apply descending sort when sort parameter is provided")
        void findAllWithDescendingSort() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user2, user1));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, "firstName:desc", 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            assertEquals("Thang", result.getUsers().get(0).getFirstName());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should handle pagination correctly for second page")
        void findAllWithPagination() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user2), PageRequest.of(1, 1), 2);
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, null, 2, 1);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            assertEquals(2, result.getPageNumber());
            assertEquals(1, result.getPageSize());
            assertEquals(2, result.getTotalPages());
            assertEquals(1, result.getUsers().size());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should handle zero page correctly by defaulting to first page")
        void findAllWithZeroPage() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, null, 0, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            assertEquals(0, result.getPageNumber());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should handle negative page correctly by defaulting to first page")
        void findAllWithNegativePage() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, null, -1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            assertEquals(-1, result.getPageNumber());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should combine keyword search with sorting")
        void findAllWithKeywordAndSort() {
            // Arrange
            String keyword = "Ho";
            Page<UserEntity> page = new PageImpl<>(List.of(user1));
            when(userRepository.searchByKeyword(anyString(), any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(keyword, "lastName:desc", 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            assertEquals("Ho", result.getUsers().get(0).getFirstName());
        }

        @Test
        @DisplayName("should ignore invalid sort format and use default sorting")
        void findAllWithInvalidSortFormat() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll(null, "invalid-sort-format", 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            verify(userRepository).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("should handle empty string keyword as no keyword provided")
        void findAllWithEmptyKeyword() {
            // Arrange
            Page<UserEntity> page = new PageImpl<>(List.of(user1, user2));
            when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(page);

            // Act
            UserPageDTO result = userService.findAll("", null, 1, 5);

            // Assert
            assertNotNull(result);
            assertEquals(2, result.getTotalElements());
            verify(userRepository).findAll(any(Pageable.class));
            verify(userRepository, never()).searchByKeyword(anyString(), any(Pageable.class));
        }
    


    }

    @Test
    void testFindByEmail() {

    }

    @Test
    void testFindById() {

    }

    @Test
    void testFindByUsername() {

    }

    @Test
    void testGetUserByRefreshTokenAndEmail() {

    }

    @Test
    void testHandleCreateUserRegister() {

    }

    @Test
    void testIsEmailExist() {

    }

    @Test
    void testUpdate() {

    }

    @Test
    void testUpdateAvatarUrl() {

    }

    @Test
    void testUpdateBio() {

    }

    @Test
    void testUpdateFolloweeCount() {

    }

    @Test
    void testUpdateFollowingCount() {

    }

    @Test
    void testUpdateUserToken() {

    }
}
