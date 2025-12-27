package com.edusprint.service;

import com.edusprint.dto.TaskDTO;
import com.edusprint.entity.Task;
import com.edusprint.entity.TaskAssignment;
import com.edusprint.entity.TaskDefinition;
import com.edusprint.entity.User;
import com.edusprint.repository.TaskRepository;
import com.edusprint.repository.TaskAssignmentRepository;
import com.edusprint.repository.TaskDefinitionRepository;
import com.edusprint.repository.UserRepository;
import com.edusprint.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskDefinitionRepository taskDefinitionRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksBySubject(Long subjectId) {
        return taskRepository.findBySubjectId(subjectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStudent(Long studentId) {
        return taskAssignmentRepository.findByStudentId(studentId).stream()
                .map(assignment -> convertToDTO(assignment.getTask()))
                .collect(Collectors.toList());
    }

    public Optional<TaskDTO> getTaskById(Long id) {
        return taskRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO, Long facultyId) {
        // Verify faculty permissions
        if (!subjectRepository.existsByIdAndFacultyId(taskDTO.getSubjectId(), facultyId)) {
            throw new RuntimeException("Faculty can only create tasks for their subjects");
        }

        Task task = Task.builder()
                .subjectId(taskDTO.getSubjectId())
                .title(taskDTO.getTitle())
                .description(taskDTO.getDescription())
                .type(taskDTO.getType())
                .priority(taskDTO.getPriority())
                .status("CREATED")
                .dueDate(taskDTO.getDueDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Task savedTask = taskRepository.save(task);

        // Create task definition if provided
        if (taskDTO.getDefinitionOfDone() != null) {
            TaskDefinition definition = TaskDefinition.builder()
                    .taskId(savedTask.getId())
                    .definitionOfDone(taskDTO.getDefinitionOfDone())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            taskDefinitionRepository.save(definition);
        }

        log.info("Created new task: {} for subject: {} by faculty: {}", 
                 savedTask.getTitle(), savedTask.getSubjectId(), facultyId);
        
        return convertToDTO(savedTask);
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO, Long facultyId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify faculty permissions
        if (!subjectRepository.existsByIdAndFacultyId(task.getSubjectId(), facultyId)) {
            throw new RuntimeException("Faculty can only update tasks for their subjects");
        }

        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setType(taskDTO.getType());
        task.setPriority(taskDTO.getPriority());
        task.setStatus(taskDTO.getStatus());
        task.setDueDate(taskDTO.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);

        // Update task definition
        Optional<TaskDefinition> existingDefinition = taskDefinitionRepository.findByTaskId(id);
        if (taskDTO.getDefinitionOfDone() != null) {
            TaskDefinition definition;
            if (existingDefinition.isPresent()) {
                definition = existingDefinition.get();
                definition.setDefinitionOfDone(taskDTO.getDefinitionOfDone());
                definition.setUpdatedAt(LocalDateTime.now());
            } else {
                definition = TaskDefinition.builder()
                        .taskId(id)
                        .definitionOfDone(taskDTO.getDefinitionOfDone())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }
            taskDefinitionRepository.save(definition);
        } else if (existingDefinition.isPresent()) {
            taskDefinitionRepository.delete(existingDefinition.get());
        }

        log.info("Updated task: {} by faculty: {}", updatedTask.getTitle(), facultyId);
        
        return convertToDTO(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id, Long facultyId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify faculty permissions
        if (!subjectRepository.existsByIdAndFacultyId(task.getSubjectId(), facultyId)) {
            throw new RuntimeException("Faculty can only delete tasks for their subjects");
        }

        taskRepository.delete(task);
        log.info("Deleted task: {} by faculty: {}", task.getTitle(), facultyId);
    }

    @Transactional
    public void assignTaskToStudent(Long taskId, Long studentId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"STUDENT".equals(student.getRole())) {
            throw new RuntimeException("Only students can be assigned tasks");
        }

        // Check if already assigned
        if (taskAssignmentRepository.findByTaskIdAndStudentId(taskId, studentId).isPresent()) {
            throw new RuntimeException("Task already assigned to this student");
        }

        TaskAssignment assignment = TaskAssignment.builder()
                .taskId(taskId)
                .studentId(studentId)
                .status("ASSIGNED")
                .assignedAt(LocalDateTime.now())
                .build();

        taskAssignmentRepository.save(assignment);
        log.info("Assigned task: {} to student: {}", taskId, studentId);
    }

    @Transactional
    public void submitTask(Long taskId, Long studentId, String submissionText) {
        TaskAssignment assignment = taskAssignmentRepository
                .findByTaskIdAndStudentId(taskId, studentId)
                .orElseThrow(() -> new RuntimeException("Task assignment not found"));

        assignment.setStatus("SUBMITTED");
        assignment.setSubmissionText(submissionText);
        assignment.setSubmittedAt(LocalDateTime.now());

        taskAssignmentRepository.save(assignment);
        log.info("Student: {} submitted task: {}", studentId, taskId);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO.TaskDTOBuilder builder = TaskDTO.builder()
                .id(task.getId())
                .subjectId(task.getSubjectId())
                .title(task.getTitle())
                .description(task.getDescription())
                .type(task.getType())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt());

        // Add definition of done if exists
        taskDefinitionRepository.findByTaskId(task.getId())
                .ifPresent(definition -> builder.definitionOfDone(definition.getDefinitionOfDone()));

        return builder.build();
    }
}