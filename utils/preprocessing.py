"""
Preprocessing utilities for the AI Career Recommendation system.

Provides normalization dictionaries and functions used identically during
ML training (notebooks) and at inference time (backend services).
"""

# ---------------------------------------------------------------------------
# Normalization dictionaries
# ---------------------------------------------------------------------------

CAREER_NORMALIZATION = {
    "software developer": "Software Engineer",
    "software engineer": "Software Engineer",
    "swe": "Software Engineer",
    "front-end developer": "Frontend Developer",
    "frontend developer": "Frontend Developer",
    "front end developer": "Frontend Developer",
    "backend developer": "Backend Developer",
    "back-end developer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "fullstack developer": "Full Stack Developer",
    "data scientist": "Data Scientist",
    "data science": "Data Scientist",
    "data analyst": "Data Analyst",
    "data analysis": "Data Analyst",
    "data engineer": "Data Engineer",
    "machine learning engineer": "ML Engineer",
    "ml engineer": "ML Engineer",
    "ai researcher": "AI Researcher",
    "ai specialist": "AI Specialist",
    "deep learning engineer": "Deep Learning Engineer",
    "nlp engineer": "NLP Engineer",
    "devops engineer": "DevOps Engineer",
    "cloud engineer": "Cloud Engineer",
    "cybersecurity analyst": "Cybersecurity Analyst",
    "cybersecurity specialist": "Cybersecurity Analyst",
    "network security engineer": "Cybersecurity Analyst",
    "ux designer": "UX Designer",
    "ux researcher": "UX Researcher",
    "graphic designer": "Graphic Designer",
    "digital marketer": "Digital Marketer",
    "marketing manager": "Marketing Manager",
    "content strategist": "Content Strategist",
    "project manager": "Project Manager",
    "business analyst": "Business Analyst",
    "financial analyst": "Financial Analyst",
    "research scientist": "Research Scientist",
    "research analyst": "Research Analyst",
    "biostatistician": "Biostatistician",
    "embedded systems engineer": "Embedded Systems Engineer",
    "automation engineer": "Automation Engineer",
    "mobile developer": "Mobile Developer",
}

SKILL_ALIASES = {
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "sql": "SQL",
    "nosql": "NoSQL",
    "ui/ux": "UI/UX Design",
    "ux": "UX Design",
    "ui": "UI Design",
    "react": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",
    "data visualization": "Data Visualization",
    "data warehousing": "Data Warehousing",
    "big data": "Big Data",
    "statistics": "Statistics",
    "statistical analysis": "Statistics",
    "excel": "Excel",
    "r": "R",
    "c++": "C++",
    "c#": "C#",
    ".net": ".NET",
    "java": "Java",
    "spring": "Spring",
    "microservices": "Microservices",
    "devops": "DevOps",
    "ci/cd": "CI/CD",
    "agile": "Agile",
    "project management": "Project Management",
    "adobe illustrator": "Adobe Illustrator",
    "adobe photoshop": "Adobe Photoshop",
    "adobe creative suite": "Adobe Creative Suite",
    "adobe xd": "Adobe XD",
    "seo": "SEO",
    "content writing": "Content Writing",
    "copywriting": "Copywriting",
    "digital marketing": "Digital Marketing",
    "network security": "Network Security",
    "linux": "Linux",
    "embedded systems": "Embedded Systems",
    "iot": "IoT",
    "cloud computing": "Cloud Computing",
    "etl": "ETL",
}

EDUCATION_NORMALIZATION = {
    "bachelor's": "Bachelor",
    "bachelor": "Bachelor",
    "bachelors": "Bachelor",
    "b.tech": "Bachelor",
    "b.e.": "Bachelor",
    "be": "Bachelor",
    "bsc": "Bachelor",
    "b.sc": "Bachelor",
    "undergraduate": "Bachelor",
    "ug": "Bachelor",
    "master's": "Master",
    "master": "Master",
    "masters": "Master",
    "m.tech": "Master",
    "msc": "Master",
    "m.sc": "Master",
    "mba": "Master",
    "me": "Master",
    "postgraduate": "Master",
    "pg": "Master",
    "phd": "PhD",
    "ph.d": "PhD",
    "ph.d.": "PhD",
    "doctorate": "PhD",
    "doctoral": "PhD",
}

SPECIALIZATION_NORMALIZATION = {
    "computer science": "Computer Science",
    "cs": "Computer Science",
    "cse": "Computer Science",
    "information technology": "Information Technology",
    "it": "Information Technology",
    "data science": "Data Science",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "machine learning": "Machine Learning",
    "electronics": "Electronics",
    "ece": "Electronics",
    "electrical": "Electrical Engineering",
    "mechanical": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "business administration": "Business Administration",
    "mba": "Business Administration",
    "finance": "Finance",
    "marketing": "Marketing",
    "design": "Design",
    "graphic design": "Design",
    "statistics": "Statistics",
    "mathematics": "Mathematics",
    "maths": "Mathematics",
    "physics": "Physics",
    "biology": "Biology",
    "biotechnology": "Biotechnology",
    "biotech": "Biotechnology",
    "chemistry": "Chemistry",
    "psychology": "Psychology",
    "economics": "Economics",
    "communications": "Communications",
    "journalism": "Journalism",
    "law": "Law",
    "medicine": "Medicine",
}

# ---------------------------------------------------------------------------
# Normalization functions
# ---------------------------------------------------------------------------


def normalize_skill(skill: str) -> str:
    """
    Normalize a single skill string.

    Lowercases and strips whitespace, then looks up the result in
    SKILL_ALIASES. Returns the canonical alias value if found, or the
    lowercased-and-stripped original if not.
    """
    key = skill.lower().strip()
    return SKILL_ALIASES.get(key, skill.strip())


def normalize_skills_list(skills: list[str]) -> list[str]:
    """
    Normalize a list of skill strings.

    Applies normalize_skill to every element, removes duplicates, and
    returns the result sorted in ascending order.
    """
    normalized = {normalize_skill(s) for s in skills}
    return sorted(normalized)


def normalize_education(edu: str) -> str:
    """
    Normalize an education level string.

    Lowercases and strips whitespace, then looks up the result in
    EDUCATION_NORMALIZATION. Returns the canonical value if found, or the
    original (stripped) string if not.
    """
    key = edu.lower().strip()
    return EDUCATION_NORMALIZATION.get(key, edu.strip())


def normalize_specialization(spec: str) -> str:
    """
    Normalize a specialization string.

    Lowercases and strips whitespace, then looks up the result in
    SPECIALIZATION_NORMALIZATION. Returns the canonical value if found, or
    the original (stripped) string if not.
    """
    key = spec.lower().strip()
    return SPECIALIZATION_NORMALIZATION.get(key, spec.strip())


def normalize_career(career: str) -> str:
    """
    Normalize a career label string.

    Lowercases and strips whitespace, then looks up the result in
    CAREER_NORMALIZATION. Returns the canonical value if found, or the
    original (stripped) string if not.
    """
    key = career.lower().strip()
    return CAREER_NORMALIZATION.get(key, career.strip())


def split_semicolon_field(raw: str) -> list[str]:
    """
    Split a semicolon-delimited field into a list of tokens.

    Splits on ';', strips surrounding whitespace from each token, and
    filters out any empty strings that result from leading/trailing/
    double semicolons.
    """
    return [token.strip() for token in raw.split(";") if token.strip()]
