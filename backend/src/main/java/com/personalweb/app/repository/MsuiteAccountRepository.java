package com.personalweb.app.repository;

import com.personalweb.app.entity.MsuiteAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MsuiteAccountRepository extends JpaRepository<MsuiteAccount, Long> {

    List<MsuiteAccount> findByCountry(MsuiteAccount.Country country);

    boolean existsByAccountAndDomain(String account, String domain);
}
