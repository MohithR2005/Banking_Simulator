package com.banking.repository;

import com.banking.entity.FraudFlag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudFlagRepository extends JpaRepository<FraudFlag, Long> {

    List<FraudFlag> findByResolvedFalseOrderByCreatedAtDesc();
}
