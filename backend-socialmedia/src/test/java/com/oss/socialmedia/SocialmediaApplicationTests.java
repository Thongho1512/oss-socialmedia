package com.oss.socialmedia;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.oss.socialmedia.controller.AuthController;
import com.oss.socialmedia.controller.EmailController;
import com.oss.socialmedia.controller.UserController;

@SpringBootTest
class SocialmediaApplicationTests {

	@Autowired
	private AuthController authController;

	@Autowired
	private UserController userController;

	@Autowired
	private EmailController emailController;

	@Test  // * Lương Quốc Tây *
	void contextLoads() {
		Assertions.assertNotNull(authController);
		Assertions.assertNotNull(userController);
		Assertions.assertNotNull(emailController);
	}
}

