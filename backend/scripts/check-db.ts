import postgres from 'postgres';

const sql = postgres(process.env.DIRECT_URL!, { prepare: false });

try {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'telegram_link_tokens', 'gmail_credentials')
    ORDER BY table_name
  `;
  console.log('\n✅ Tables:', tables.map(r => r.table_name).join(', '));

  const policies = await sql`
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname
  `;
  console.log('\n✅ RLS Policies:');
  for (const p of policies) console.log(`   ${p.tablename}: ${p.policyname}`);

  const triggers = await sql`
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    ORDER BY trigger_name
  `;
  console.log('\n✅ Triggers:');
  for (const t of triggers) console.log(`   ${t.event_object_table}: ${t.trigger_name}`);

  const fks = await sql`
    SELECT constraint_name, table_name
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY'
    AND table_name = 'profiles'
  `;
  console.log('\n✅ profiles FKs:', fks.map(f => f.constraint_name).join(', ') || '(none)');

} finally {
  await sql.end();
  console.log('\nDone.');
}
