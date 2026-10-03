import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity
from app.models.skill import OpportunitySkill
from app.models.deadline import DeadlineTracker
from app.models.source import TrustedSource
from app.models.saved_opportunity import SavedOpportunity
from app.models.notification import Notification

logger = logging.getLogger("seeds")

DEMO_SOURCES = [
    {
        "name": "LinkedIn Public Jobs",
        "url": "https://www.linkedin.com/jobs",
        "type": "job_board",
        "category_focus": "Internship"
    },
    {
        "name": "Internshala Student Internships",
        "url": "https://internshala.com/internships",
        "type": "job_board",
        "category_focus": "Internship"
    },
    {
        "name": "Major League Hacking (MLH) Hackathons",
        "url": "https://mlh.io/seasons/2026/events",
        "type": "hackathon_platform",
        "category_focus": "Hackathon"
    },
    {
        "name": "Devpost Student Hackathon Portal",
        "url": "https://devpost.com/hackathons",
        "type": "hackathon_platform",
        "category_focus": "Hackathon"
    },
    {
        "name": "MIT CSAIL Student Research Portal",
        "url": "https://www.csail.mit.edu/academics/urop",
        "type": "university_domain",
        "category_focus": "Research Fellowship"
    },
    {
        "name": "Google Open Source Programs & GSoC",
        "url": "https://summerofcode.withgoogle.com",
        "type": "official_portal",
        "category_focus": "Student Program"
    },
    {
        "name": "Buddy4Study National Scholarship Network",
        "url": "https://www.buddy4study.com",
        "type": "scholarship_portal",
        "category_focus": "Scholarship"
    }
]

DEMO_OPPORTUNITIES = [
    {
        "title": "Google Summer of Code 2026",
        "organization": "Google Open Source",
        "category": "Student Program",
        "description": "Google Summer of Code is a global, online program focused on bringing new contributors into open source software development. GSoC Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.",
        "summary": "Premier 12-week paid open-source software development program connecting students with global mentorship and stipends.",
        "eligibility": "Open to all enrolled university students and new open-source contributors aged 18+.",
        "days_until_deadline": 4,
        "location": "Global / Remote",
        "mode": "Online",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$3,000 - $6,000 Contributor Stipend",
        "required_skills": ["Python", "Git", "Open Source", "Data Structures", "FastAPI", "C++"],
        "preferred_skills": ["Docker", "Linux"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech", "Open to All"],
        "academic_year_requirements": ["All Academic Years"],
        "tags": ["Open Source", "Google", "Mentorship", "Stipend", "Global"],
        "official_url": "https://summerofcode.withgoogle.com",
        "source_name": "Google Open Source Programs",
        "source_type": "official_portal",
        "verification_status": "VERIFIED"
    },
    {
        "title": "NASA Space Apps Challenge 2026",
        "organization": "NASA & Global Space Agencies",
        "category": "Hackathon",
        "description": "The NASA International Space Apps Challenge is the largest annual global hackathon. Participants tackle real-world problems on Earth and in space using open data from NASA and international space agency partners.",
        "summary": "The world's largest space-tech hackathon. Build solutions for planetary challenges using genuine satellite and astrophysical datasets.",
        "eligibility": "Open to students, coders, scientists, designers, and innovators of all academic years.",
        "days_until_deadline": 2,
        "location": "Global & Local Chapters",
        "mode": "Hybrid",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$25,000 Global Award Pool & Kennedy Space Center Tour",
        "required_skills": ["Python", "Machine Learning", "Data Analysis", "React", "Geospatial Data"],
        "preferred_skills": ["Computer Vision", "PyTorch"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "Open to All"],
        "academic_year_requirements": ["All Academic Years"],
        "tags": ["Hackathon", "NASA", "SpaceTech", "AI", "Climate Data"],
        "official_url": "https://www.spaceappschallenge.org",
        "source_name": "NASA Open Innovation",
        "source_type": "government_portal",
        "verification_status": "VERIFIED"
    },
    {
        "title": "MIT CSAIL Undergraduate Research Fellowship (UROP)",
        "organization": "MIT Computer Science & AI Lab",
        "category": "Research Fellowship",
        "description": "A prestigious summer and semester research fellowship at MIT CSAIL. Students collaborate directly with leading faculty and PhD researchers on foundational Large Language Models, robotics, and quantum computing.",
        "summary": "Direct research opportunity at MIT CSAIL on cutting-edge LLMs and intelligent autonomous systems with full funding.",
        "eligibility": "Undergraduate students in Computer Science, Electrical Engineering, or Mathematics with strong GPA (3.5+).",
        "days_until_deadline": 11,
        "location": "Cambridge, MA, USA",
        "mode": "Hybrid",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$7,500 Summer Research Grant + Housing",
        "required_skills": ["Python", "PyTorch", "Machine Learning", "Deep Learning", "Algorithms", "Research Writing"],
        "preferred_skills": ["Linear Algebra", "CUDA"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc"],
        "academic_year_requirements": ["2nd Year", "3rd Year", "4th Year"],
        "tags": ["MIT", "AI Research", "Fellowship", "LLMs", "Undergraduate"],
        "official_url": "https://www.csail.mit.edu/academics/urop",
        "source_name": "MIT CSAIL Student Research Feed",
        "source_type": "university_domain",
        "verification_status": "VERIFIED"
    },
    {
        "title": "Microsoft Imagine Cup Global Student Competition",
        "organization": "Microsoft",
        "category": "Competition",
        "description": "Imagine Cup is Microsoft's global student tech competition. Create visionary AI-powered startup prototypes using Microsoft Azure, compete with student teams globally, and pitch to industry legends.",
        "summary": "Global student innovation startup challenge. Transform AI prototypes into viable ventures with Azure cloud credits and founder mentorship.",
        "eligibility": "Enrolled college/university students aged 16+. Teams of 1-4 members.",
        "days_until_deadline": 18,
        "location": "Global / Finals in Seattle",
        "mode": "Hybrid",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$100,000 Grand Prize + Mentorship with Satya Nadella",
        "required_skills": ["AI/ML", "Cloud Computing", "Full Stack Development", "FastAPI", "React", "Pitching"],
        "preferred_skills": ["Azure", "OpenAI API"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech"],
        "academic_year_requirements": ["All Academic Years"],
        "tags": ["Competition", "Microsoft", "Startup", "Azure", "AI Innovation"],
        "official_url": "https://imaginecup.microsoft.com",
        "source_name": "Microsoft Student Hub",
        "source_type": "official_portal",
        "verification_status": "VERIFIED"
    },
    {
        "title": "Jane Street Graduate & Undergraduate Fellowship",
        "organization": "Jane Street Capital",
        "category": "Scholarship",
        "description": "Jane Street's academic fellowship program recognizing exceptional talent in computer science, mathematics, and quantitative engineering. Fellows receive financial support and an invitation to an exclusive NYC research retreat.",
        "summary": "Prestigious financial award and intensive quant systems workshop in New York for high-achieving STEM students.",
        "eligibility": "Undergraduate & Masters students in CS, Math, or Physics graduating in 2026/2027.",
        "days_until_deadline": 6,
        "location": "New York, NY / Remote",
        "mode": "Online",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$15,000 Merit Grant + All-expenses-paid Retreat",
        "required_skills": ["Data Structures", "Algorithms", "Python", "C++", "Functional Programming", "Statistics"],
        "preferred_skills": ["OCaml", "Probability Theory"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech"],
        "academic_year_requirements": ["3rd Year", "4th Year"],
        "tags": ["Scholarship", "Quantitative Finance", "Algorithms", "Jane Street"],
        "official_url": "https://www.janestreet.com/join-jane-street/programs-and-events",
        "source_name": "Jane Street Academic Opportunities",
        "source_type": "official_portal",
        "verification_status": "VERIFIED"
    },
    {
        "title": "Kaggle AI Agents & LLM Benchmark Challenge",
        "organization": "Kaggle & Google Cloud",
        "category": "Competition",
        "description": "Build autonomous multi-agent systems and benchmark their problem-solving fidelity across complex software engineering and scientific reasoning benchmarks.",
        "summary": "High-profile machine learning agent benchmark tournament with GPU computing grants and cash awards.",
        "eligibility": "Open globally to individual students and university teams.",
        "days_until_deadline": 14,
        "location": "Global / Remote",
        "mode": "Online",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$50,000 Cash Prize Pool + TPU Research Grants",
        "required_skills": ["Python", "Machine Learning", "LLMs", "Prompt Engineering", "Data Structures", "PyTorch"],
        "preferred_skills": ["LangChain", "Vector DBs"],
        "degree_requirements": ["Open to All"],
        "academic_year_requirements": ["All Academic Years"],
        "tags": ["Kaggle", "Agentic AI", "Competition", "LLM", "Data Science"],
        "official_url": "https://www.kaggle.com/competitions",
        "source_name": "Kaggle Competitions Feed",
        "source_type": "competition_platform",
        "verification_status": "PUBLIC SOURCE"
    },
    {
        "title": "CERN Summer Student Research Programme",
        "organization": "CERN (European Organization for Nuclear Research)",
        "category": "Internship",
        "description": "Spend 8 to 13 weeks at the world's premier particle physics laboratory in Geneva, working on large-scale distributed computing systems, scientific data pipelines, and beam instrumentation.",
        "summary": "Elite international research residency at CERN Geneva working on high-performance scientific computing and physics AI.",
        "eligibility": "Bachelor or Master students in Physics, Computing, or Engineering having completed at least 3 years of full-time studies.",
        "days_until_deadline": 25,
        "location": "Geneva, Switzerland",
        "mode": "Offline",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "CHF 90/day allowance (~$3,000/mo) + Travel Coverage",
        "required_skills": ["Python", "C++", "Distributed Systems", "Data Analysis", "Linux"],
        "preferred_skills": ["Root", "Parallel Computing"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech"],
        "academic_year_requirements": ["3rd Year", "4th Year"],
        "tags": ["CERN", "High Performance Computing", "Internship", "Switzerland"],
        "official_url": "https://careers.cern/summer",
        "source_name": "CERN Careers Portal",
        "source_type": "official_portal",
        "verification_status": "VERIFIED"
    },
    {
        "title": "Anthropic AI Safety Student Fellowship",
        "organization": "Anthropic",
        "category": "Research Fellowship",
        "description": "A funded semester fellowship dedicated to technical AI safety, interpretability of transformer architectures, and scalable automated red-teaming for university researchers.",
        "summary": "Funded research fellowship focused on frontier AI alignment, interpretability, and mechanistic model probing.",
        "eligibility": "Enrolled undergraduate or graduate students with prior experience in PyTorch and transformer theory.",
        "days_until_deadline": 9,
        "location": "San Francisco, CA / Remote",
        "mode": "Hybrid",
        "cost": "Free",
        "is_free": True,
        "stipend_or_prize": "$10,000 Research Fellowship + Compute Credits",
        "required_skills": ["Python", "PyTorch", "Transformer Models", "Machine Learning", "Research"],
        "preferred_skills": ["Mechanistic Interpretability"],
        "degree_requirements": ["B.Tech", "B.E", "B.Sc", "M.Tech"],
        "academic_year_requirements": ["3rd Year", "4th Year"],
        "tags": ["AI Safety", "Anthropic", "Research", "Deep Learning"],
        "official_url": "https://www.anthropic.com/research",
        "source_name": "Anthropic Student Research Portal",
        "source_type": "official_portal",
        "verification_status": "VERIFIED"
    }
]

def seed_database(db: Session):
    """
    Populates default trusted sources, demo opportunities, and initial student account.
    """
    # 1. Seed Sources
    for src in DEMO_SOURCES:
        existing_src = db.query(TrustedSource).filter(TrustedSource.name == src["name"]).first()
        if not existing_src:
            db.add(TrustedSource(**src))
    db.flush()

    # 2. Seed Demo Student
    demo_email = "alex.chen@university.edu"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        demo_user = User(
            email=demo_email,
            hashed_password=get_password_hash("student123"),
            full_name="Alex Chen",
            role="student",
            is_active=True
        )
        db.add(demo_user)
        db.flush()

        profile = StudentProfile(
            user_id=demo_user.id,
            degree="Bachelor of Technology (B.Tech)",
            branch="Computer Science & Engineering (AI/ML)",
            academic_year="3rd Year",
            college="National Institute of Technology",
            graduation_year=2026,
            skills=["Python", "Machine Learning", "FastAPI", "React", "Data Structures", "Git", "Algorithms", "PyTorch", "SQL", "GenAI"],
            interests=["Artificial Intelligence", "Machine Learning", "Open Source", "Distributed Systems", "Agentic Systems"],
            preferred_categories=["Internship", "Hackathon", "Research Fellowship", "Scholarship", "Student Program"],
            preferred_location="India / Remote",
            mode_preference="Remote / Hybrid",
            gpa="8.9 / 10.0",
            bio="3rd Year B.Tech CSE/AIML student actively looking for high-impact AI/ML internships, global hackathons, and undergraduate research fellowships for Summer 2026.",
            resume_summary="Experienced with Python backend systems, React frontend development, and fine-tuning transformer models. Built award-winning hackathon projects.",
            profile_strength=92
        )
        db.add(profile)
        db.flush()

    # 3. Seed Fallback Demo Opportunities
    now = datetime.utcnow()
    for opp_data in DEMO_OPPORTUNITIES:
        existing_opp = db.query(Opportunity).filter(Opportunity.title == opp_data["title"]).first()
        if not existing_opp:
            days_offset = opp_data.get("days_until_deadline", 14)
            deadline_date = now + timedelta(days=days_offset)

            opp = Opportunity(
                title=opp_data["title"],
                organization=opp_data["organization"],
                category=opp_data["category"],
                description=opp_data["description"],
                summary=opp_data["summary"],
                eligibility=opp_data["eligibility"],
                deadline=deadline_date,
                location=opp_data["location"],
                mode=opp_data["mode"],
                cost=opp_data["cost"],
                is_free=opp_data["is_free"],
                stipend_or_prize=opp_data["stipend_or_prize"],
                required_skills=opp_data["required_skills"],
                preferred_skills=opp_data.get("preferred_skills", []),
                degree_requirements=opp_data.get("degree_requirements", []),
                academic_year_requirements=opp_data.get("academic_year_requirements", []),
                tags=opp_data["tags"],
                official_url=opp_data["official_url"],
                source_name=opp_data["source_name"],
                source_url=opp_data["official_url"],
                source_type=opp_data.get("source_type", "official_portal"),
                sources=[{
                    "source_name": opp_data["source_name"],
                    "source_url": opp_data["official_url"],
                    "source_type": opp_data.get("source_type", "official_portal"),
                    "last_checked": now.isoformat()
                }],
                source_count=1,
                verification_status=opp_data.get("verification_status", "VERIFIED"),
                status="active",
                is_demo=True,
                is_live=False,
                first_discovered_at=now,
                last_checked_at=now,
                last_verified_at=now
            )
            db.add(opp)
            db.flush()

            # Opportunity Skills
            for skill in opp_data["required_skills"]:
                db.add(OpportunitySkill(opportunity_id=opp.id, skill_name=skill, importance=1.0))

            # Deadline Tracker
            urgency = "critical" if days_offset <= 3 else "approaching" if days_offset <= 7 else "upcoming" if days_offset <= 14 else "normal"
            db.add(DeadlineTracker(
                opportunity_id=opp.id,
                title=opp.title,
                due_date=deadline_date,
                urgency_level=urgency
            ))

    db.commit()
    logger.info("Database seeding successfully verified.")
