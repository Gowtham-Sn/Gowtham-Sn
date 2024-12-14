package com.Aquatech.web.ContactFormController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.Aquatech.web.ContactFormService.ContactFormService;
import com.Aquatech.web.Entity.ContactForm;

@RestController
@RequestMapping("/contact")
public class ContactFormController {

    @Autowired
    private ContactFormService contactFormService;

    @PostMapping("/submit")
    public String submitContactForm(@RequestBody ContactForm contactForm) {
        contactFormService.submitContactForm(contactForm);
        return "Thank you for your enquiry! We will get back to you soon.";
    }
}