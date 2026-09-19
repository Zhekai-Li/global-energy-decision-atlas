begin;
select plan(12);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'one@example.com', '', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'two@example.com', '', now(), now(), now());

insert into public.profiles (user_id, theme, locale) values
  ('11111111-1111-1111-1111-111111111111','light','en'),
  ('22222222-2222-2222-2222-222222222222','dark','fr');
insert into public.saved_views (user_id,name,state) values
  ('11111111-1111-1111-1111-111111111111','One','{}'),
  ('22222222-2222-2222-2222-222222222222','Two','{}');

set local role anon;
select throws_ok('select * from public.atlas_records', '42501', null, 'anonymous role cannot read atlas data');
select throws_ok('select * from public.profiles', '42501', null, 'anonymous role cannot read profiles');
select throws_ok('select * from public.saved_views', '42501', null, 'anonymous role cannot read saved views');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',true);
select is((select count(*)::integer from public.profiles), 1, 'user sees one profile');
select is((select locale from public.profiles), 'en', 'user sees own profile');
select is((select count(*)::integer from public.saved_views), 1, 'user sees one saved view');
select is((select name from public.saved_views), 'One', 'user sees own saved view');
select is((with changed as (update public.profiles set locale='es' where user_id='22222222-2222-2222-2222-222222222222' returning 1) select count(*)::integer from changed), 0, 'user cannot update another profile');
select lives_ok($$update public.profiles set locale='es' where user_id='11111111-1111-1111-1111-111111111111'$$, 'user can update own profile');
select throws_ok($$insert into public.saved_views(user_id,name,state) values('22222222-2222-2222-2222-222222222222','Foreign','{}')$$, '42501', null, 'user cannot create another account view');
select lives_ok($$insert into public.saved_views(user_id,name,state) values('11111111-1111-1111-1111-111111111111','Own','{}')$$, 'user can create own view');
select is((with changed as (delete from public.saved_views where user_id='22222222-2222-2222-2222-222222222222' returning 1) select count(*)::integer from changed), 0, 'user cannot delete another account view');

select * from finish();
rollback;
