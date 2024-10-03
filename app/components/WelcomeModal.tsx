import React from 'react';
import Image from 'next/image';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <Image src="/images/welcome-gift.png" alt="Welcome Gift" width={100} height={100} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-white">欢迎新用户!</h2>
          <p className="text-xl mb-6 text-purple-200">恭喜您获得以下奖励:</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
          <ul className="space-y-4">
            <li className="flex items-center text-white">
              <span className="text-2xl mr-4">🎁</span>
              <span className="text-lg">1000 积分</span>
            </li>
            <li className="flex items-center text-white">
              <span className="text-2xl mr-4">🎰</span>
              <span className="text-lg">5次免费旋转机会</span>
            </li>
          </ul>
        </div>
        <p className="text-lg mb-6 text-center text-purple-200">祝您玩得开心!</p>
        <button
          onClick={onClose}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;