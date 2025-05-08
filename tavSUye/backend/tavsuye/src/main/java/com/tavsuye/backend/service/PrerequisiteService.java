package com.tavsuye.backend.service;

import com.tavsuye.backend.entity.Prerequisite;
import com.tavsuye.backend.repository.PrerequisiteRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PrerequisiteService {

    private final PrerequisiteRepository prerequisiteRepository;

    public PrerequisiteService(PrerequisiteRepository prerequisiteRepository) {
        this.prerequisiteRepository = prerequisiteRepository;
    }

    // Get prerequisites by course ID
    public List<Map<String, Object>> getPrerequisitesByCourseId(Integer courseId) {
        List<Prerequisite> prerequisites = prerequisiteRepository.findByCourse_CourseId(courseId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Prerequisite prerequisite : prerequisites) {
            Map<String, Object> prerequisiteData = new HashMap<>();
            if (prerequisite.getPrerequisiteCourse() != null) {
                prerequisiteData.put("courseId", prerequisite.getPrerequisiteCourse().getCourseId());
                prerequisiteData.put("subject", prerequisite.getPrerequisiteCourse().getSubject());
                prerequisiteData.put("courseCode", prerequisite.getPrerequisiteCourse().getCourseCode());
                prerequisiteData.put("isAnd", prerequisite.getIsAnd()); // No null check needed
            } else {
                prerequisiteData.put("courseId", null);
                prerequisiteData.put("subject", null);
                prerequisiteData.put("courseCode", null);
                prerequisiteData.put("isAnd", null); // If no prerequisite, isAnd is null
            }
            result.add(prerequisiteData);
        }

        return result.isEmpty() ? null : result; // Return null if no prerequisites
    }
}
