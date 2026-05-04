alter table prizes    add column deleted_at timestamptz default null;
alter table customers add column deleted_at timestamptz default null;
