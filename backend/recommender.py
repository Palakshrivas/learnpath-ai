"""
Deterministic recommendation core: domain keyword matching (fallback
only — llm.py's extract_profile() is the real NLU), prerequisite-aware
path ordering via topological sort, and skill-gap scoring for the
dashboard.

Swap point for a trained model: replace generate_path() with your
model's output once you train one on real interaction data. Keep the
same return shape (id/title/.../order/reason/is_milestone) so the
routes never need to change.
"""
from typing import List, Dict, Optional

DOMAINS = {
    "data-science": {
        "label": "Data Science",
        "keywords": ["data", "analyst", "analytics", "machine learning", "ml", "ai", "scientist", "statistics"],
        "skills": ["Python", "Statistics", "SQL", "ML Fundamentals", "Data Viz", "Model Deployment"],
    },
    "web-development": {
        "label": "Web Development",
        "keywords": ["web", "frontend", "backend", "developer", "javascript", "react", "full stack", "fullstack"],
        "skills": ["HTML/CSS", "JavaScript", "React", "APIs", "Databases", "Deployment"],
    },
}

COURSES: List[Dict] = [
    {"id": "ds1", "domain": "data-science", "title": "Python Foundations", "skills": ["Python"], "prereqs": [], "difficulty": 1, "hours": 12, "desc": "Core Python syntax, data structures, and control flow.", "is_milestone": False, "milestone_note": None},
    {"id": "ds2", "domain": "data-science", "title": "Statistics for Data Science", "skills": ["Statistics"], "prereqs": [], "difficulty": 1, "hours": 15, "desc": "Descriptive stats, probability, and hypothesis testing.", "is_milestone": False, "milestone_note": None},
    {"id": "ds3", "domain": "data-science", "title": "SQL for Analysts", "skills": ["SQL"], "prereqs": [], "difficulty": 1, "hours": 10, "desc": "Querying, joins, and aggregation on relational data.", "is_milestone": False, "milestone_note": None},
    {"id": "ds4", "domain": "data-science", "title": "Data Wrangling with Pandas", "skills": ["Python"], "prereqs": ["ds1"], "difficulty": 2, "hours": 14, "desc": "Cleaning and reshaping real-world datasets.", "is_milestone": False, "milestone_note": None},
    {"id": "ds5", "domain": "data-science", "title": "Data Visualization", "skills": ["Data Viz"], "prereqs": ["ds1"], "difficulty": 2, "hours": 10, "desc": "Telling stories with matplotlib, seaborn, and dashboards.", "is_milestone": False, "milestone_note": None},
    {"id": "ds6", "domain": "data-science", "title": "Applied Statistics Project", "skills": ["Statistics"], "prereqs": ["ds2"], "difficulty": 2, "hours": 8, "desc": "Milestone project: A/B test analysis on real data.", "is_milestone": True, "milestone_note": "Checkpoint project — analyze a real A/B test end to end."},
    {"id": "ds7", "domain": "data-science", "title": "Machine Learning Fundamentals", "skills": ["ML Fundamentals"], "prereqs": ["ds1", "ds2"], "difficulty": 3, "hours": 20, "desc": "Supervised learning, model evaluation, and feature engineering.", "is_milestone": False, "milestone_note": None},
    {"id": "ds8", "domain": "data-science", "title": "ML with Scikit-learn", "skills": ["ML Fundamentals"], "prereqs": ["ds7"], "difficulty": 3, "hours": 16, "desc": "Hands-on model building on structured datasets.", "is_milestone": False, "milestone_note": None},
    {"id": "ds9", "domain": "data-science", "title": "Model Deployment Basics", "skills": ["Model Deployment"], "prereqs": ["ds8"], "difficulty": 4, "hours": 12, "desc": "Packaging and serving a model behind an API.", "is_milestone": False, "milestone_note": None},
    {"id": "ds10", "domain": "data-science", "title": "Capstone: End-to-End ML Pipeline", "skills": ["Model Deployment", "ML Fundamentals"], "prereqs": ["ds9", "ds5"], "difficulty": 4, "hours": 25, "desc": "Milestone project: ship a full pipeline from raw data to deployed model.", "is_milestone": True, "milestone_note": "Capstone — data to deployed model, portfolio-ready."},

    {"id": "wd1", "domain": "web-development", "title": "HTML & CSS Foundations", "skills": ["HTML/CSS"], "prereqs": [], "difficulty": 1, "hours": 10, "desc": "Semantic markup, layout, and responsive design basics.", "is_milestone": False, "milestone_note": None},
    {"id": "wd2", "domain": "web-development", "title": "JavaScript Essentials", "skills": ["JavaScript"], "prereqs": [], "difficulty": 1, "hours": 16, "desc": "Syntax, DOM manipulation, and async fundamentals.", "is_milestone": False, "milestone_note": None},
    {"id": "wd3", "domain": "web-development", "title": "Responsive Layout Project", "skills": ["HTML/CSS"], "prereqs": ["wd1"], "difficulty": 2, "hours": 8, "desc": "Milestone project: build a responsive landing page.", "is_milestone": True, "milestone_note": "Checkpoint project — a fully responsive landing page."},
    {"id": "wd4", "domain": "web-development", "title": "React Fundamentals", "skills": ["React"], "prereqs": ["wd2"], "difficulty": 2, "hours": 18, "desc": "Components, state, props, and hooks.", "is_milestone": False, "milestone_note": None},
    {"id": "wd5", "domain": "web-development", "title": "Working with APIs", "skills": ["APIs"], "prereqs": ["wd2"], "difficulty": 2, "hours": 10, "desc": "Fetching, error handling, and async UI states.", "is_milestone": False, "milestone_note": None},
    {"id": "wd6", "domain": "web-development", "title": "React + APIs Project", "skills": ["React", "APIs"], "prereqs": ["wd4", "wd5"], "difficulty": 3, "hours": 14, "desc": "Milestone project: a data-driven React app.", "is_milestone": True, "milestone_note": "Checkpoint project — a data-driven React app."},
    {"id": "wd7", "domain": "web-development", "title": "Databases for Web Apps", "skills": ["Databases"], "prereqs": [], "difficulty": 2, "hours": 12, "desc": "Relational modeling and querying for app backends.", "is_milestone": False, "milestone_note": None},
    {"id": "wd8", "domain": "web-development", "title": "Backend APIs with Node", "skills": ["APIs", "Databases"], "prereqs": ["wd5", "wd7"], "difficulty": 3, "hours": 18, "desc": "Building and connecting a REST API to a database.", "is_milestone": False, "milestone_note": None},
    {"id": "wd9", "domain": "web-development", "title": "Deployment & CI/CD", "skills": ["Deployment"], "prereqs": ["wd8"], "difficulty": 4, "hours": 10, "desc": "Shipping and automating releases for a full-stack app.", "is_milestone": False, "milestone_note": None},
    {"id": "wd10", "domain": "web-development", "title": "Capstone: Full-Stack App", "skills": ["React", "APIs", "Deployment"], "prereqs": ["wd6", "wd9"], "difficulty": 4, "hours": 26, "desc": "Milestone project: ship a complete full-stack application.", "is_milestone": True, "milestone_note": "Capstone — a complete, deployed full-stack app."},
]

_COURSE_BY_ID = {c["id"]: c for c in COURSES}
EXPERIENCE_FLOOR = {"beginner": 1, "intermediate": 2, "advanced": 3}


def get_course(course_id: str) -> Optional[Dict]:
    return _COURSE_BY_ID.get(course_id)


def detect_domain(goal_text: str) -> str:
    """Keyword fallback only — llm.extract_profile() is the primary path."""
    text = goal_text.lower()
    best, best_score = None, 0
    for key, d in DOMAINS.items():
        score = sum(1 for k in d["keywords"] if k in text)
        if score > best_score:
            best, best_score = key, score
    return best or "data-science"


def _topo_sort(courses: List[Dict]) -> List[Dict]:
    by_id = {c["id"]: c for c in courses}
    visited, order = set(), []

    def visit(cid):
        if cid in visited:
            return
        visited.add(cid)
        for p in by_id.get(cid, {}).get("prereqs", []):
            if p in by_id:
                visit(p)
        order.append(by_id[cid])

    for c in courses:
        visit(c["id"])
    return order


def _explain(course: Dict, sorted_courses: List[Dict], level: str) -> str:
    prereq_titles = [c["title"] for c in sorted_courses if c["id"] in course["prereqs"]]
    base = (
        f"Builds on {' and '.join(prereq_titles)}, which come earlier in your path."
        if prereq_titles else
        f"No prerequisites — a solid starting point for your {level} level."
    )
    return f"{base} Teaches {', '.join(course['skills'])}, a skill your goal needs."


def generate_path(domain: str, experience_level: str) -> List[Dict]:
    floor = EXPERIENCE_FLOOR.get(experience_level, 1)
    domain_courses = [c for c in COURSES if c["domain"] == domain]
    sorted_courses = _topo_sort(domain_courses)
    filtered = [c for c in sorted_courses if c["difficulty"] >= min(floor, 2) or c["is_milestone"]]

    path = []
    for i, c in enumerate(filtered):
        item = dict(c)
        item["order"] = i
        item["reason"] = _explain(c, filtered, experience_level)
        path.append(item)
    return path


def regenerate_after_feedback(domain: str, experience_level: str, feedback_map: Dict[str, str]) -> List[Dict]:
    """feedback_map: {course_id: 'too_easy' | 'too_hard' | 'just_right'}"""
    too_hard = sum(1 for v in feedback_map.values() if v == "too_hard")
    too_easy = sum(1 for v in feedback_map.values() if v == "too_easy")
    levels = ["beginner", "intermediate", "advanced"]
    idx = levels.index(experience_level) if experience_level in levels else 0
    if too_hard > too_easy and idx > 0:
        idx -= 1
    elif too_easy > too_hard and idx < len(levels) - 1:
        idx += 1
    return generate_path(domain, levels[idx])


def skill_gap_summary(domain: str, path_items: List[Dict], completed_ids: set) -> List[Dict]:
    summary = []
    for skill in DOMAINS[domain]["skills"]:
        relevant = [c for c in path_items if skill in c["skills"]]
        done = [c for c in relevant if c["id"] in completed_ids]
        current = round((len(done) / len(relevant)) * 100) if relevant else 0
        target = 100 if relevant else 40
        summary.append({"skill": skill, "current": current, "target": target})
    return summary
