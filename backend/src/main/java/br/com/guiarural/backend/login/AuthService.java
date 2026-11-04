package br.com.guiarural.backend.login;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public void realizarLogout(String token) {
        // Implementar a invalidação do token aqui
        System.out.println("Logout executado para o token: " + token);
    }
}