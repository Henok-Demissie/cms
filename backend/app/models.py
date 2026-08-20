from datetime import datetime

from cuid import cuid
from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def generate_id() -> str:
    return cuid()


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sector: Mapped[str] = mapped_column(String(50), nullable=False)
    subdomain: Mapped[str] = mapped_column(String(48), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(30), nullable=False, default="STARTER")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users: Mapped[list["User"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    complaints: Mapped[list["Complaint"]] = relationship(
        back_populates="tenant", cascade="all, delete-orphan"
    )


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_tenant_id", "tenant_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="AGENT")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    tenant: Mapped[Tenant] = relationship(back_populates="users")
    assigned_complaints: Mapped[list["Complaint"]] = relationship(
        back_populates="assigned_to", foreign_keys="Complaint.assigned_to_id"
    )


class Complaint(Base):
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_complaints_tenant_id", "tenant_id"),
        Index("ix_complaints_assigned_to_id", "assigned_to_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    assigned_to_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    customer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    source: Mapped[str] = mapped_column(String(30), nullable=False, default="OTHER")
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="NEW")
    priority: Mapped[str] = mapped_column(String(30), nullable=False, default="MEDIUM")
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    tenant: Mapped[Tenant] = relationship(back_populates="complaints")
    assigned_to: Mapped[User | None] = relationship(
        back_populates="assigned_complaints", foreign_keys=[assigned_to_id]
    )
