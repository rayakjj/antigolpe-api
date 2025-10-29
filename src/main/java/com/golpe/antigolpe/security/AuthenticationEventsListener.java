package com.golpe.antigolpe.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationEventsListener {

    private final LoginAttemptService loginAttemptService;

    @EventListener
    public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
        String email = (String) event.getAuthentication().getPrincipal();
        System.out.println("Tentativa de login falhou para o usuário: " + email);
        loginAttemptService.loginFailed(email);
    }

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        // O getPrincipal() aqui retorna um objeto UserDetails
        UserDetails userDetails = (UserDetails) event.getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        System.out.println("Login bem-sucedido para o usuário: " + email);
        loginAttemptService.loginSucceeded(email);
    }
}