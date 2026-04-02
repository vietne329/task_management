package com.personalweb.app.dto;

import com.personalweb.app.entity.MsuiteAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MsuiteAccountDto {

    private Long id;
    private MsuiteAccount.Country country;
    private String keyRestore;
    private String domain;
    private String account;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
