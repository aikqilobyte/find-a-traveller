-- ============================================================
-- Fix: reading a conversation always failed
-- ============================================================
-- The original policy on conversation_participants queried
-- conversation_participants:
--
--   using (user_id = auth.uid() or exists (
--     select 1 from conversation_participants cp2
--      where cp2.conversation_id = conversation_id and cp2.user_id = auth.uid()))
--
-- Postgres applies the table's own policies to that inner query, so it
-- recurses and raises 42P17. Every read of the table errored, the
-- membership check in /dashboard/messages/[id] came back empty, and the
-- page 404'd. It went unnoticed because no conversation had ever existed
-- to read.
--
-- The same line had a second defect: `conversation_id` is unqualified, so
-- it bound to cp2's own column rather than the row being checked, making
-- the condition cp2.conversation_id = cp2.conversation_id — always true.
-- Without the recursion error that would have let any participant of any
-- conversation read every participant row in the table.
--
-- A SECURITY DEFINER function does the lookup with RLS suspended inside,
-- which breaks the cycle, and takes the conversation id as a parameter so
-- there is no ambiguity about which row it refers to.
-- ============================================================

create or replace function is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from conversation_participants
     where conversation_id = p_conversation_id
       and user_id = auth.uid()
  );
$$;

revoke all on function is_conversation_participant(uuid) from public;
grant execute on function is_conversation_participant(uuid) to authenticated;

drop policy if exists "participants read participant rows" on conversation_participants;
create policy "participants read participant rows" on conversation_participants for select
  using (user_id = auth.uid() or is_conversation_participant(conversation_id));

-- Same lookup, one less subquery, and consistent with the above.
drop policy if exists "participants read conversations" on conversations;
create policy "participants read conversations" on conversations for select
  using (is_conversation_participant(id) or is_admin());
