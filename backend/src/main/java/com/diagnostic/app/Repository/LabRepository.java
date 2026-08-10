package com.diagnostic.app.Repository;

import com.diagnostic.app.Entity.Labs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabRepository extends JpaRepository<Labs, Long> {
}