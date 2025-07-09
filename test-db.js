// 临时测试脚本 - 用完后请删除
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
    console.log('🔍 Testing database connection...');
    
    try {
        // 测试1: 检查所有留言
        const { data: allMessages, error: allError } = await supabase
            .from('messages')
            .select('*');
        
        if (allError) {
            console.error('❌ Error fetching all messages:', allError);
        } else {
            console.log(`✅ Total messages in database: ${allMessages.length}`);
            allMessages.forEach(msg => {
                console.log(`   - ID: ${msg.id}, Status: ${msg.status}, Content: ${msg.content.substring(0, 50)}...`);
            });
        }
        
        // 测试2: 检查待审核留言
        const { data: pendingMessages, error: pendingError } = await supabase
            .from('messages')
            .select('*')
            .eq('status', 'pending');
        
        if (pendingError) {
            console.error('❌ Error fetching pending messages:', pendingError);
        } else {
            console.log(`📋 Pending messages: ${pendingMessages.length}`);
        }
        
        // 测试3: 检查已审核留言
        const { data: approvedMessages, error: approvedError } = await supabase
            .from('messages')
            .select('*')
            .eq('status', 'approved');
        
        if (approvedError) {
            console.error('❌ Error fetching approved messages:', approvedError);
        } else {
            console.log(`✅ Approved messages: ${approvedMessages.length}`);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

testDatabase(); 