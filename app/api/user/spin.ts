import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId } = await request.json();
  console.log('收到旋转请求:', { tgId });

  if (!tgId) {
    console.log('无效的请求数据');
    return NextResponse.json({ message: '无效的请求数据' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    console.log('数据库连接成功');
    
    await client.query('BEGIN');
    console.log('开始事务');

    // 检查用户是否有剩余旋转次数或可以免费旋转
    const checkResult = await client.query(
      'SELECT spins_left, last_spin_time FROM users WHERE tg_id = $1',
      [tgId]
    );

    if (checkResult.rows.length === 0) {
      console.log('用户未找到');
      await client.query('ROLLBACK');
      return NextResponse.json({ message: '用户未找到' }, { status: 404 });
    }

    const { spins_left, last_spin_time } = checkResult.rows[0];
    const now = new Date().getTime();
    const canFreeSpin = !last_spin_time || (now - last_spin_time) >= 24 * 60 * 60 * 1000;

    if (spins_left > 0 || canFreeSpin) {
      // 更新用户的旋转次数和最后旋转时间
      const newSpinsLeft = canFreeSpin ? spins_left : spins_left - 1;
      const updateResult = await client.query(
        'UPDATE users SET spins_left = $1, last_spin_time = $2 WHERE tg_id = $3 RETURNING spins_left, last_spin_time',
        [newSpinsLeft, now, tgId]
      );

      await client.query('COMMIT');
      console.log('事务提交成功');

      const updatedUser = updateResult.rows[0];
      console.log('更新后的用户数据:', updatedUser);
      return NextResponse.json({ 
        spinsLeft: updatedUser.spins_left,
        lastSpinTime: updatedUser.last_spin_time
      });
    } else {
      console.log('用户没有剩余旋转次数');
      await client.query('ROLLBACK');
      return NextResponse.json({ message: '没有剩余旋转次数' }, { status: 403 });
    }
  } catch (error) {
    console.error('处理旋转请求时出错:', error);
    if (client) {
      await client.query('ROLLBACK');
    }
    return NextResponse.json({ message: '服务器内部错误', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    if (client) {
      client.release();
      console.log('数据库连接已释放');
    }
  }
}