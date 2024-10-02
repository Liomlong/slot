import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">欢迎新用户!</h2>
        <p className="mb-4">恭喜您获得:</p>
        <ul className="list-disc list-inside mb-4">
          <li>1000 积分</li>
          <li>5次免费旋转机会</li>
        </ul>
        <p className="mb-4">祝您玩得开心!</p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;