package br.com.guiarural.backend.map;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.map.service.PhotoProcessor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PhotoProcessorTest {
    private final PhotoProcessor processor = new PhotoProcessor();

    private byte[] image(String format, int width, int height, int type) throws IOException {
        BufferedImage image = new BufferedImage(width, height, type);
        Graphics2D g = image.createGraphics();
        g.setColor(new Color(20, 90, 160));
        g.fillRect(0, 0, width, height);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, format, out);
        return out.toByteArray();
    }

    private BufferedImage decode(byte[] bytes) throws IOException {
        return ImageIO.read(new ByteArrayInputStream(bytes));
    }

    @Test
    @DisplayName("PNG grande vira JPEG de no máximo 1280 px no lado maior, mantendo a proporção")
    void shouldResizeAndConvertToJpeg() throws IOException {
        byte[] result = processor.toJpeg(image("png", 2560, 1280, BufferedImage.TYPE_INT_ARGB));

        // Assinatura do JPEG (FF D8).
        assertEquals((byte) 0xFF, result[0]);
        assertEquals((byte) 0xD8, result[1]);
        BufferedImage decoded = decode(result);
        assertNotNull(decoded);
        assertEquals(1280, decoded.getWidth());
        assertEquals(640, decoded.getHeight());
    }

    @Test
    @DisplayName("Imagem pequena não é ampliada")
    void shouldNotUpscaleSmallImages() throws IOException {
        BufferedImage decoded = decode(processor.toJpeg(image("jpg", 400, 300, BufferedImage.TYPE_INT_RGB)));

        assertEquals(400, decoded.getWidth());
        assertEquals(300, decoded.getHeight());
    }

    @Test
    @DisplayName("Fundo transparente do PNG vira branco, não preto")
    void shouldFlattenTransparencyToWhite() throws IOException {
        BufferedImage transparent = new BufferedImage(50, 50, BufferedImage.TYPE_INT_ARGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(transparent, "png", out);

        BufferedImage decoded = decode(processor.toJpeg(out.toByteArray()));

        Color pixel = new Color(decoded.getRGB(25, 25));
        assertTrue(pixel.getRed() > 240 && pixel.getGreen() > 240 && pixel.getBlue() > 240);
    }

    @Test
    @DisplayName("Recusa arquivo vazio, texto, formato fora de JPG/PNG e arquivo acima de 5 MB")
    void shouldRejectInvalidFiles() throws IOException {
        assertThrows(BadRequestException.class, () -> processor.toJpeg(new byte[0]));
        assertThrows(BadRequestException.class, () -> processor.toJpeg(null));
        assertThrows(BadRequestException.class, () -> processor.toJpeg("<svg xmlns='http://www.w3.org/2000/svg'/>".getBytes()));
        assertThrows(BadRequestException.class, () -> processor.toJpeg(image("gif", 20, 20, BufferedImage.TYPE_INT_RGB)));
        assertThrows(BadRequestException.class, () -> processor.toJpeg(new byte[PhotoProcessor.MAX_BYTES + 1]));
    }
}
