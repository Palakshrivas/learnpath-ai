package learnpath_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_progress")
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long learnerId;

    private String topic;

    private boolean completed;

    public LearningProgress() {
    }

    public LearningProgress(Long learnerId, String topic, boolean completed) {
        this.learnerId = learnerId;
        this.topic = topic;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public Long getLearnerId() {
        return learnerId;
    }

    public void setLearnerId(Long learnerId) {
        this.learnerId = learnerId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}