import React from 'react';

export default function EmptyRoom({ onCreateRoom }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-lg font-semibold mb-2">
          Chưa có phòng chat nào
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Tạo phòng mới để bắt đầu trò chuyện với đồng đội của bạn
        </p>

        <button
          onClick={onCreateRoom}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm"
        >
          ➕ Tạo phòng chat
        </button>
      </div>
    </div>
  );
}
