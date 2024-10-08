import React from 'react';

interface UserProfileProps {
  username: string;
  points: number;
  usdt: number;
  // 可以添加更多用户信息字段
}

const UserProfile: React.FC<UserProfileProps> = ({ username, points, usdt }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">个人信息</h2>
      <div className="mb-4">
        <p className="text-gray-600">用户名</p>
        <p className="text-xl font-semibold">{username}</p>
      </div>
      <div className="mb-4">
        <p className="text-gray-600">积分</p>
        <p className="text-xl font-semibold">{points}</p>
      </div>
      <div className="mb-4">
        <p className="text-gray-600">USDT 余额</p>
        <p className="text-xl font-semibold">{usdt.toFixed(2)}</p>
      </div>
      {/* 可以添加更多用户信息 */}
    </div>
  );
};

export default UserProfile;