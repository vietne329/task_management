package com.personalweb.app.dto;

import com.personalweb.app.entity.MsuiteAccount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MsuiteAccountRequest {

    @NotNull(message = "Country is required")
    private MsuiteAccount.Country country;

    private String keyRestore;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotBlank(message = "Account is required")
    private String account;

    @NotBlank(message = "Password is required")
    private String password;
}
