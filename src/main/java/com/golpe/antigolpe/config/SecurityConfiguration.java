package com.golpe.antigolpe.config;

import com.golpe.antigolpe.config.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse; // Importar HttpServletResponse
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; // Importar CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Importar UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter; // Importar CorsFilter - Embora não esteja sendo usado diretamente na filterChain, é bom ter o import para entender a intenção
import java.util.Arrays; // Importar Arrays
import java.util.Collections; // Importar Collections (se usasse Collections.singletonList, mas Arrays.asList funciona bem)


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // --- ADICIONA A CONFIGURAÇÃO CORS AQUI ---
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // --- FIM DA CONFIGURAÇÃO CORS ---

                // --- BLOCO ADICIONADO PARA CORRIGIR O ERRO 403 (mantenho suas alterações) ---
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Credenciais inválidas")
                        )
                )
                // --- FIM DO BLOCO ADICIONADO ---

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll() // Permite acesso a todos os endpoints de autenticação
                        .anyRequest().authenticated() // Exige autenticação para qualquer outra requisição
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // API REST não guarda estado
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Adiciona nosso filtro JWT

        return http.build();
    }

    // --- NOVO BEAN PARA CONFIGURAR AS POLÍTICAS CORS ---
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite requisições das origens do seu frontend (Live Server)
        // Certifique-se de que a porta 5500 está correta para o seu Live Server.
        configuration.setAllowedOrigins(Arrays.asList("http://127.0.0.1:5500", "http://localhost:5500"));
        
        // Métodos HTTP permitidos (GET, POST, PUT, DELETE, OPTIONS para pre-flight requests)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cabeçalhos que o cliente pode enviar (incluindo Authorization para JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        
        // Permite que o navegador inclua credenciais (como cookies ou headers de autenticação)
        configuration.setAllowCredentials(true); 
        
        // Define o tempo que o navegador pode armazenar em cache os resultados da pré-flight request
        configuration.setMaxAge(3600L); // 1 hora

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração CORS a todos os caminhos (endpoints) da API
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // --- FIM DO NOVO BEAN CORS ---
}