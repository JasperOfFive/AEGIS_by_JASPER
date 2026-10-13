"""add_asset_lifecycle_and_brand_schedule

Revision ID: e319bf52a781
Revises: c78f79cc1160
Create Date: 2026-10-13 22:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e319bf52a781'
down_revision: Union[str, Sequence[str], None] = 'c78f79cc1160'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema with asset lifecycle and recurring schedule columns."""
    with op.batch_alter_table('brand_assets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('lifecycle_status', sa.String(length=32), nullable=False, server_default='active'))
        batch_op.add_column(sa.Column('official_publisher', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('effective_date', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('retirement_date', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('analyst_notes', sa.Text(), nullable=True))
        batch_op.create_index('ix_brand_assets_lifecycle_status', ['lifecycle_status'], unique=False)

    with op.batch_alter_table('brands', schema=None) as batch_op:
        batch_op.add_column(sa.Column('schedule_enabled', sa.Boolean(), nullable=False, server_default=sa.text('0')))
        batch_op.add_column(sa.Column('schedule_interval_hours', sa.Integer(), nullable=False, server_default='24'))
        batch_op.add_column(sa.Column('last_scheduled_run_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('next_scheduled_run_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('brands', schema=None) as batch_op:
        batch_op.drop_column('next_scheduled_run_at')
        batch_op.drop_column('last_scheduled_run_at')
        batch_op.drop_column('schedule_interval_hours')
        batch_op.drop_column('schedule_enabled')

    with op.batch_alter_table('brand_assets', schema=None) as batch_op:
        batch_op.drop_index('ix_brand_assets_lifecycle_status')
        batch_op.drop_column('analyst_notes')
        batch_op.drop_column('retirement_date')
        batch_op.drop_column('effective_date')
        batch_op.drop_column('official_publisher')
        batch_op.drop_column('lifecycle_status')
