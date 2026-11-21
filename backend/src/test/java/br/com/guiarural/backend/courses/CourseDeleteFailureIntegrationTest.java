package br.com.guiarural.backend.courses;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.courses.service.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.AopTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;

// CT-036.03 (FE-36.01): "simular falha de conexão com o banco" não é executável à mão, então vira este teste.
// A falha acontece no último passo da exclusão (gravar o histórico), depois de a matriz e o curso já terem sido
// apagados e enviados ao banco: a transação inteira precisa ser desfeita e o curso continuar como estava.
// Na tela, o erro chega como falha da API e o CourseForm mostra "Não foi possível concluir a exclusão. O curso foi
// mantido sem alterações." (coberto em frontend/tests/cursos-admin.test.ts).
@SpringBootTest
class CourseDeleteFailureIntegrationTest {
    private static final long DEPARTMENT = 601;
    private static final long COURSE = 9601;

    @Autowired
    private CourseService service;
    @Autowired
    private JdbcTemplate jdbc;
    @MockitoSpyBean
    private AuditService auditService;

    @BeforeEach
    void seed() {
        jdbc.update("delete from audit_logs");
        jdbc.update("delete from curriculum_subjects");
        jdbc.update("delete from courses");
        jdbc.update("delete from departments where id = ?", DEPARTMENT);
        jdbc.update("insert into departments (id, name, active) values (?, ?, ?)", DEPARTMENT, "Departamento de Computação", true);
        jdbc.update("insert into courses (id, department_id, name, level, type, active) values (?, ?, ?, ?, ?, ?)",
                COURSE, DEPARTMENT, "Bacharelado em Ciência da Computação", "GRADUACAO", "BACHARELADO", true);
        jdbc.update("insert into curriculum_subjects (course_id, period, code, name, workload_hours, nature) values (?, ?, ?, ?, ?, ?)",
                COURSE, 1, "BCC101", "Introdução à Computação", 60, "OBRIGATORIA");
        jdbc.update("insert into curriculum_subjects (course_id, period, code, name, workload_hours, nature) values (?, ?, ?, ?, ?, ?)",
                COURSE, null, "BCC900", "Optativa", 30, "OPTATIVA");
    }

    @Test
    @DisplayName("CT-036.03: se a conexão com o banco cai no meio da exclusão, o curso e a matriz ficam como estavam")
    void deleteFailureKeepsCourseUnchanged() {
        // record() exige transação aberta (MANDATORY): o stub vai no spy por trás do proxy transacional.
        AuditService target = AopTestUtils.getUltimateTargetObject(auditService);
        doThrow(new DataAccessResourceFailureException("conexão com o banco perdida"))
                .when(target)
                .record(eq(AuditService.Entity.CURSO), any(), any(), eq(AuditService.Action.DELETADO), any(), any());

        assertThrows(DataAccessResourceFailureException.class, () -> service.delete(COURSE));

        assertEquals(1, count("select count(*) from courses where id = ?", COURSE));
        assertEquals("Bacharelado em Ciência da Computação",
                jdbc.queryForObject("select name from courses where id = ?", String.class, COURSE));
        assertEquals(2, count("select count(*) from curriculum_subjects where course_id = ?", COURSE));
        assertEquals(0, count("select count(*) from audit_logs"));
    }

    private int count(String sql, Object... args) {
        Integer value = jdbc.queryForObject(sql, Integer.class, args);
        return value == null ? 0 : value;
    }
}
