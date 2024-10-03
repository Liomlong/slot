import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  console.log("Received request for user info");
  const { searchParams } = new URL(request.url);
  const tgId = searchParams.get('tgId');
  const username = searchParams.get('username'); // 新增：从请求中获取 username
  console.log("tgId:", tgId, "username:", username);

  if (!tgId) {
    console.log("tgId is missing");
    return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
  }

  try {
    console.log("Querying database");
    const res = await pool.query('SELECT points, spins_left, last_spin_time, username FROM users WHERE tg_id = $1', [tgId]);
    console.log("Query result:", res.rows);
    if (res.rows.length === 0) {
      // 如果用户不存在，创建新用户
      const newUser = await pool.query(
        'INSERT INTO users (tg_id, points, spins_left, username) VALUES ($1, 0, 3, $2) RETURNING points, spins_left, last_spin_time, username',
        [tgId, username]
      );
      console.log("New user created:", newUser.rows[0]);
      return NextResponse.json(newUser.rows[0]);
    } else {
      // 如果用户存在，更新 username
      const updateUser = await pool.query(
        'UPDATE users SET username = $1 WHERE tg_id = $2 RETURNING points, spins_left, last_spin_time, username',
        [username, tgId]
      );
      console.log("User updated:", updateUser.rows[0]);
      return NextResponse.json(updateUser.rows[0]);
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}