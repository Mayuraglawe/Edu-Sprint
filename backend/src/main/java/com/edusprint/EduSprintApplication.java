package com.edusprint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * EduSprint Backend Application
 * AI-Powered Academic Workload and Assessment Ecosystem
 * 
 * Main entry point for the Spring Boot application.
 * Adapts Jira's project management architecture into a specialized classroom environment.
 * 
 * @author EduSprint Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class EduSprintApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduSprintApplication.class, args);
        System.out.println("""
            
            ================================================================================
            🚀 EduSprint Backend Started Successfully!
            ================================================================================
            📚 AI-Powered Academic Workload Management Platform
            
            🌐 API Base URL: http://localhost:8081/api
            📖 Swagger UI: http://localhost:8081/swagger-ui.html
            🔧 H2 Console: http://localhost:8081/h2-console (dev profile only)
            
            ✨ Features:
               • AI-Powered Assignment Generation
               • Real-time SLA Penalty Tracking
               • Triple-Tier Auto-Grading (Loose/Medium/Hard)
               • Faculty Override Workflow
               • Workload Heatmap Analytics
            
            💡 Tip: Use 'mvn spring-boot:run -Dspring-boot.run.profiles=dev' for development
            ================================================================================
            """);
    }
}
