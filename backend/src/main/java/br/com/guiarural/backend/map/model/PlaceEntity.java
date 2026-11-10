package br.com.guiarural.backend.map.model;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "places")
public class PlaceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slug;
    private String name;
    private String shortName;
    private String category;
    private String status;
    private Double latitude;
    private Double longitude;
    private String coordinatesSource;
    private String address;
    private String hours;
    private String description;
    private String phone;
    private String email;

    // Serviços do catálogo (/servicos) prestados neste local (decisão D11 do plano de integração).
    // A tabela place_service tem id próprio gerado pelo banco; aqui só importam as duas pontas do vínculo.
    @ElementCollection
    @CollectionTable(name = "place_service", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "service_id")
    @BatchSize(size = 50)
    private Set<Long> serviceIds = new LinkedHashSet<>();

    // Cursos vinculados ao local (escolhidos no formulário do painel).
    @ElementCollection
    @CollectionTable(name = "place_courses", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "course_id")
    @BatchSize(size = 50)
    private Set<Long> courseIds = new LinkedHashSet<>();

    public PlaceEntity() {
    }

    public Set<Long> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(Set<Long> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public Set<Long> getCourseIds() {
        return courseIds;
    }

    public void setCourseIds(Set<Long> courseIds) {
        this.courseIds = courseIds;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCoordinatesSource() {
        return coordinatesSource;
    }

    public void setCoordinatesSource(String coordinatesSource) {
        this.coordinatesSource = coordinatesSource;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getHours() {
        return hours;
    }

    public void setHours(String hours) {
        this.hours = hours;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
