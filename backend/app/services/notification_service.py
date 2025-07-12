from sqlalchemy.orm import Session
from app.models import Notification, Users, Question, Answer
from app.schemas.notification_schema import NotificationType
from uuid import UUID
from typing import Optional

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        user_id: UUID,
        content: str,
        notification_type: NotificationType,
        related_id: Optional[UUID] = None
    ):
        """Create a new notification for a user."""
        
        new_notification = Notification(
            userid=user_id,
            content=content,
            type=notification_type.value,
            is_read=False
        )
        
        self.db.add(new_notification)
        self.db.commit()
        self.db.refresh(new_notification)
        
        return new_notification
    
    def notify_question_answered(self, question_id: UUID, answerer_username: str):
        """Notify question author when someone answers their question."""
        
        question = self.db.query(Question).filter(Question.qid == question_id).first()
        if question:
            content = f"{answerer_username} answered your question: '{question.title}'"
            self.create_notification(
                user_id=question.userid,
                content=content,
                notification_type=NotificationType.ANSWER,
                related_id=question_id
            )
    
    def notify_answer_commented(self, answer_id: UUID, commenter_username: str):
        """Notify answer author when someone comments on their answer."""
        
        answer = self.db.query(Answer).filter(Answer.aid == answer_id).first()
        if answer:
            # Get the question title for better context
            question = self.db.query(Question).filter(Question.qid == answer.qid).first()
            question_title = question.title if question else "your answer"
            
            content = f"{commenter_username} commented on your answer to: '{question_title}'"
            self.create_notification(
                user_id=answer.userid,
                content=content,
                notification_type=NotificationType.COMMENT,
                related_id=answer_id
            )
    
    def notify_user_mentioned(self, mentioned_user_id: UUID, mentioner_username: str, content_type: str, content_title: str):
        """Notify user when they are mentioned in a question, answer, or comment."""
        
        content = f"{mentioner_username} mentioned you in a {content_type}: '{content_title}'"
        self.create_notification(
            user_id=mentioned_user_id,
            content=content,
            notification_type=NotificationType.MENTION,
            related_id=None
        )