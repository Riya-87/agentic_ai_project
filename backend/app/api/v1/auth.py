from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token, oauth2_scheme
from app.core.config import settings
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id_str = decode_access_token(token)
    if user_id_str is None:
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_current_user(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False))) -> User:
    if token:
        user_id_str = decode_access_token(token)
        if user_id_str:
            try:
                user_id = int(user_id_str)
                user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
                if user:
                    return user
            except Exception:
                pass
    # Fallback to demo student or first student
    demo_user = db.query(User).filter(User.email == "alex.chen@university.edu").first()
    if not demo_user:
        demo_user = db.query(User).first()
    return demo_user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "student"
    )
    db.add(user)
    db.flush()

    # Create default empty profile
    profile = StudentProfile(
        user_id=user.id,
        degree="Bachelor of Technology",
        branch="Computer Science & Engineering",
        academic_year="3rd Year",
        college="National Institute of Technology",
        graduation_year=2026,
        skills=["Python", "Data Structures", "Web Development", "Git"],
        interests=["Artificial Intelligence", "Open Source", "Software Engineering"],
        preferred_categories=["Hackathon", "Internship", "Research Fellowship", "Scholarship"],
        preferred_location="Global / Remote",
        mode_preference="Any",
        profile_strength=60
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Fast-path initial matching
    try:
        orchestrator.match_single_student(db, user.id)
    except Exception:
        pass

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Supports standard OAuth2 form username field containing email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/login/json", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
