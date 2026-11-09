package br.com.guiarural.backend.info;

import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

// As entidades do guia são só de leitura (sem setters): os testes preenchem os campos por reflexão.
final class GuideTestData {
    private GuideTestData() {
    }

    // fields = pares nome, valor: entity(GuideTipEntity.class, "slug", "vem", "titlePt", "Cartão").
    static <T> T entity(Class<T> type, Object... fields) {
        T instance = BeanUtils.instantiateClass(type);
        for (int i = 0; i < fields.length; i += 2) {
            ReflectionTestUtils.setField(instance, (String) fields[i], fields[i + 1]);
        }
        return instance;
    }
}
