package com.personalweb.app.service;

import com.personalweb.app.dto.MsuiteAccountDto;
import com.personalweb.app.dto.MsuiteAccountRequest;
import com.personalweb.app.entity.MsuiteAccount;

import java.util.List;

public interface MsuiteAccountService {

    List<MsuiteAccountDto> getAll();

    List<MsuiteAccountDto> getByCountry(MsuiteAccount.Country country);

    MsuiteAccountDto getById(Long id);

    MsuiteAccountDto create(MsuiteAccountRequest request);

    MsuiteAccountDto update(Long id, MsuiteAccountRequest request);

    void delete(Long id);
}
