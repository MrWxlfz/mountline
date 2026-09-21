import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Use an isolated runtime installed outside the repository. This script only
// constructs an in-memory database; it never reads connection strings or env keys.
const runtimeDirectory = process.argv[2]
if (!runtimeDirectory || process.argv.length !== 3) {
  console.error('Usage: node scripts/verify-pilot-database.mjs /path/to/temporary-pglite-runtime')
  process.exit(1)
}
const runtimeRequire = createRequire(resolve(runtimeDirectory, 'package.json'))
const { PGlite } = runtimeRequire('@electric-sql/pglite')
const { pgcrypto } = runtimeRequire('@electric-sql/pglite/contrib/pgcrypto')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const db = new PGlite({ extensions: { pgcrypto } })
const results = []
const check = (name) => { results.push(name); console.log(`PASS ${name}`) }
try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    create schema storage;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  `)
  await db.exec(await readFile(`${root}/supabase/northline_schema.sql`, 'utf8'))
  const migrations = (await readdir(`${root}/supabase/migrations`)).filter((file) => file.endsWith('.sql')).sort()
  for (const file of migrations) {
    try {
      const sql = await readFile(`${root}/supabase/migrations/${file}`, 'utf8')
      await db.transaction(async tx => tx.exec(sql))
      check(`migration ${file}`)
    } catch (error) {
      console.error(`FAILED migration ${file}: ${error.message}`)
      throw error
    }
  }
  const counts = await db.query(`select count(*)::int as count from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and not c.relrowsecurity`)
  assert.equal(counts.rows[0].count, 0)
  check('RLS enabled on every public table')
  const tableGrants = await db.query(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and (has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))`)
  assert.equal(tableGrants.rows.length, 0)
  check('anon and authenticated denied all public table reads/writes')
  const functionGrants = await db.query(`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'))`)
  assert.equal(functionGrants.rows.length, 0)
  check('anon and authenticated denied public functions')

  const clientId = '11111111-1111-4111-8111-111111111111'
  const signalId = '22222222-2222-4222-8222-222222222222'
  await db.query(`insert into public.clients(id,business_name,contact_name,email) values ($1,'Controlled test','Test client','test@example.invalid')`, [clientId])
  await db.query(`insert into public.signal_prospects(id,business_name,industry) values ($1,'Controlled test','hvac')`, [signalId])
  await db.exec('set role service_role')
  const projectCall = `select * from public.create_project_for_pilot($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`
  const projectArgs = ['test-project-key','Controlled project',clientId,null,'discovery','controlled-portal',null,null,null,null,null,'Review configuration',null,signalId,'user_test']
  const first = (await db.query(projectCall, projectArgs)).rows[0]
  assert.ok(first.id)
  const access = (await db.query('select * from public.client_portal_access where project_id=$1', [first.id])).rows
  assert.equal(access.length, 1)
  assert.equal(access[0].client_email, 'test@example.invalid')
  const signal = (await db.query('select converted_project_id,pipeline_stage,outreach_status from public.signal_prospects where id=$1',[signalId])).rows[0]
  assert.equal(signal.converted_project_id, first.id)
  assert.notEqual(signal.pipeline_stage, 'won')
  assert.notEqual(signal.outreach_status, 'won')
  check('service role project RPC atomically creates access and links Signal without claiming sale')
  const repeated = (await db.query(projectCall, [...projectArgs.slice(0,5),'different-portal',...projectArgs.slice(6)])).rows[0]
  assert.equal(repeated.id, first.id)
  assert.equal((await db.query('select count(*)::int as n from public.projects')).rows[0].n, 1)
  check('project RPC retry returns same project without duplication')
  const brokenArgs = [...projectArgs]
  brokenArgs[0] = 'invalid-signal-key'
  brokenArgs[5] = 'invalid-signal-portal'
  brokenArgs[13] = '33333333-3333-4333-8333-333333333333'
  await assert.rejects(db.query(projectCall,brokenArgs), /Signal prospect was not found/)
  assert.equal((await db.query('select count(*)::int as n from public.projects')).rows[0].n, 1)
  assert.equal((await db.query('select count(*)::int as n from public.client_portal_access')).rows[0].n, 1)
  check('late project linkage failure rolls back project and portal access')
  await assert.rejects(db.query(`update public.projects set sale_confirmed_at=now() where id=$1`,[first.id]), /check constraint/)
  assert.equal((await db.query('select sale_confirmed_at from public.projects where id=$1',[first.id])).rows[0].sale_confirmed_at, null)
  check('partial sale confirmation evidence is rejected without changing project')
  await db.query(`insert into public.support_threads(project_id,status) values ($1,'open')`,[first.id])
  await assert.rejects(db.query(`insert into public.support_threads(project_id,status) values ($1,'open')`,[first.id]), /duplicate key/)
  check('one open support thread per project enforced by database')

  const inquiryCall = 'select * from public.record_project_inquiry($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)'
  const inquiryArgs = [first.id,'inquiry-test-key','phone','controlled-call-1','2026-09-21T12:00:00Z','Test caller','5550100','caller@example.invalid','AC request','Controlled test',true,'user_test']
  const inquiry = (await db.query(inquiryCall,inquiryArgs)).rows[0]
  const inquiryAgain = (await db.query(inquiryCall,inquiryArgs)).rows[0]
  assert.equal(inquiry.id, inquiryAgain.id)
  assert.equal((await db.query('select count(*)::int as n from public.inquiry_events where inquiry_id=$1',[inquiry.id])).rows[0].n, 1)
  assert.equal(inquiry.is_test, true)
  check('inquiry RPC retry keeps one inquiry and one capture event with test flag')
  const inquiryTwoArgs = [...inquiryArgs]
  inquiryTwoArgs[1] = 'inquiry-test-two'
  inquiryTwoArgs[3] = 'controlled-call-2'
  const inquiryTwo = (await db.query(inquiryCall,inquiryTwoArgs)).rows[0]
  const firstEvent = (await db.query('select id from public.inquiry_events where inquiry_id=$1',[inquiry.id])).rows[0]
  await assert.rejects(db.query(`insert into public.inquiry_events(inquiry_id,event_type,occurred_at,actor_source,recorded_by,source_event_key,attempt_id,evidence) values ($1,'handoff_successful',now(),'manual_team','user_test','bad-handoff','attempt-1','{}')`,[inquiry.id]), /check constraint/)
  check('handoff success without evidence rejected by SQL')
  await assert.rejects(db.query(`insert into public.inquiry_events(inquiry_id,event_type,occurred_at,actor_source,recorded_by,source_event_key,attempt_id,evidence,supersedes_event_id) values ($1,'handoff_pending',now(),'manual_team','user_test','bad-scope','attempt-2','{}',$2)`,[inquiryTwo.id,firstEvent.id]), /same inquiry/)
  check('cross-inquiry evidence supersession rejected by trigger')
  await db.query(`insert into public.project_receipts(project_id,amount_minor,currency,received_at,payment_method,reference,recorded_by) values ($1,12500,'USD',now(),'bank_transfer','Receipt-1','user_test')`,[first.id])
  await assert.rejects(db.query(`insert into public.project_receipts(project_id,amount_minor,currency,received_at,payment_method,reference,recorded_by) values ($1,12500,'USD',now(),'bank_transfer','receipt-1','user_test')`,[first.id]), /duplicate key/)
  check('duplicate receipt evidence rejected case-insensitively')
  await assert.rejects(db.query(`insert into public.project_receipts(project_id,amount_minor,currency,received_at,payment_method,reference,recorded_by) values ($1,0,'USD',now(),'bank_transfer','zero-value','user_test')`,[first.id]), /check constraint/)
  check('zero-value receipt cannot establish payment evidence')

  await db.exec('reset role; set role anon')
  await assert.rejects(db.query('select * from public.leads'), /permission denied/)
  await assert.rejects(db.query(projectCall,projectArgs), /permission denied/)
  await db.exec('reset role; set role authenticated')
  await assert.rejects(db.query('select * from public.inquiries'), /permission denied/)
  await assert.rejects(db.query(inquiryCall,inquiryArgs), /permission denied/)
  check('actual anon/authenticated table and RPC calls denied')
  await db.exec('reset role')
  console.log((await db.query('select version() as version')).rows[0].version)
  console.log(`PASS ${results.length} checks; ${migrations.length} repository migrations; no production database accessed`)
} catch (error) {
  console.error(JSON.stringify({ message: error.message, code: error.code, detail: error.detail, where: error.where }, null, 2))
  process.exitCode = 1
} finally {
  await db.close()
}
