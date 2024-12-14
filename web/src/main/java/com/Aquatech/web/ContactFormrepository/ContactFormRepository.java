package com.Aquatech.web.ContactFormrepository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Aquatech.web.Entity.ContactForm;

public interface ContactFormRepository extends JpaRepository<ContactForm, Long> {
	
}

