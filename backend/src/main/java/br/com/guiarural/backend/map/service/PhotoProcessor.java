package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.core.exception.BadRequestException;
import org.springframework.stereotype.Component;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Set;

// Prepara a foto do local (D2): aceita só JPG e PNG de até 5 MB (RNF01), reduz para no máximo 1280 px no lado maior
// e regrava em JPEG. Decodificar e regravar também descarta metadados (EXIF/GPS) e recusa arquivo que não é imagem
// (SVG, por exemplo, não passa). Usa só o javax.imageio do JDK: nenhuma dependência nova.
@Component
public class PhotoProcessor {
    public static final String CONTENT_TYPE = "image/jpeg";
    public static final int MAX_BYTES = 5 * 1024 * 1024;
    public static final int MAX_SIDE = 1280;
    // Barreira contra imagem minúscula em bytes e enorme em pixels (decodificá-la gastaria a memória toda).
    private static final long MAX_PIXELS = 40_000_000L;
    private static final Set<String> FORMATS = Set.of("jpeg", "jpg", "png");
    private static final float QUALITY = 0.82f;

    public byte[] toJpeg(byte[] original) {
        if (original == null || original.length == 0) {
            throw new BadRequestException("Envie um arquivo de imagem.");
        }
        if (original.length > MAX_BYTES) {
            throw new BadRequestException("A foto pode ter no máximo 5 MB.");
        }
        BufferedImage image = decode(original);
        try {
            return encode(resize(flatten(image)));
        } catch (IOException e) {
            throw new BadRequestException("Não foi possível processar a imagem.");
        }
    }

    private BufferedImage decode(byte[] bytes) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = input == null ? null : ImageIO.getImageReaders(input);
            if (readers == null || !readers.hasNext()) {
                throw notAnImage();
            }
            ImageReader reader = readers.next();
            try {
                if (!FORMATS.contains(reader.getFormatName().toLowerCase())) {
                    throw notAnImage();
                }
                reader.setInput(input);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels > MAX_PIXELS) {
                    throw new BadRequestException("A imagem tem dimensões grandes demais.");
                }
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException e) {
            if (e instanceof BadRequestException bad) {
                throw bad;
            }
            throw notAnImage();
        }
    }

    private BadRequestException notAnImage() {
        return new BadRequestException("O arquivo precisa ser uma imagem JPG ou PNG válida.");
    }

    // JPEG não tem transparência: PNG com fundo transparente vira fundo branco.
    private BufferedImage flatten(BufferedImage source) {
        BufferedImage rgb = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            g.drawImage(source, 0, 0, null);
        } finally {
            g.dispose();
        }
        return rgb;
    }

    private BufferedImage resize(BufferedImage source) {
        int longest = Math.max(source.getWidth(), source.getHeight());
        if (longest <= MAX_SIDE) {
            return source;
        }
        double scale = (double) MAX_SIDE / longest;
        int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(source.getHeight() * scale));
        BufferedImage scaled = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(source, 0, 0, width, height, null);
        } finally {
            g.dispose();
        }
        return scaled;
    }

    private byte[] encode(BufferedImage image) throws IOException {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        try {
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(QUALITY);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (MemoryCacheImageOutputStream stream = new MemoryCacheImageOutputStream(out)) {
                writer.setOutput(stream);
                writer.write(null, new IIOImage(image, null, null), param);
            }
            return out.toByteArray();
        } finally {
            writer.dispose();
        }
    }
}
