package com.personalweb.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "msuite_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MsuiteAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Country country;

    @Column(name = "key_restore", length = 500)
    private String keyRestore;

    @Column(nullable = false, length = 255)
    private String domain;

    @Column(nullable = false, length = 100)
    private String account;

    @Column(nullable = false, length = 255)
    private String password;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Country {
        MVT, NCM, VTB, VTC, STL, MYT, VNM, VTL, VTP, VTZ
    }
}
