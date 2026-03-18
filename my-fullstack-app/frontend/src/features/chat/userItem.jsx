export const UserItem = ({ user, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="px-4 py-3 cursor-pointer border-b hover:bg-gray-50"
    >
      <p className="font-medium text-sm">{user.full_name}</p>
      <p className="text-xs text-gray-400">Start private chat</p>
    </div>
  );
}
