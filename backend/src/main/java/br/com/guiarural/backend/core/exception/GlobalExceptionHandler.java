package br.com.guiarural.backend.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ProblemDetail> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ProblemDetail> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest()
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dados inválidos.");
        problem.setProperty("fields", fields);
        return ResponseEntity.badRequest().body(problem);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ProblemDetail> handleMalformed(Exception ex) {
        return ResponseEntity.badRequest()
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Requisição malformada."));
    }
}
