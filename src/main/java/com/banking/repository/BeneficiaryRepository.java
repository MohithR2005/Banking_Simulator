package com.banking.repository;

import com.banking.entity.Beneficiary;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByOwnerEmailOrderByCreatedAtDesc(String email);

    Optional<Beneficiary> findByIdAndOwnerEmail(Long id, String email);

    boolean existsByOwnerEmailAndRecipientAccountId(String email, Long recipientAccountId);
}
