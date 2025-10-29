package com.golpe.antigolpe.security;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    private LoadingCache<String, Integer> attemptsCache;

    public LoginAttemptService() {
        super();
        // O cache expira 15 minutos após o último acesso de escrita
        attemptsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
    }

    // Chamado quando um login tem sucesso
    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    // Chamado quando um login falha
    public void loginFailed(String key) {
        int attempts = 0;
        try {
            attempts = attemptsCache.get(key);
        } catch (ExecutionException e) {
            attempts = 0;
        }
        attempts++;
        attemptsCache.put(key, attempts);
    }

    // Verifica se o usuário está bloqueado
    public boolean isBlocked(String key) {
        try {
            return attemptsCache.get(key) >= MAX_ATTEMPTS;
        } catch (ExecutionException e) {
            return false;
        }
    }
}
