import { FaGoogle, FaGithub } from "react-icons/fa";

const SocialButtons = ({ onClick }) => {
  const providers = [
    { name: "Google", icon: <FaGoogle /> },
    { name: "GitHub", icon: <FaGithub /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {providers.map((p) => (
        <button
          key={p.name}
          type="button"
          aria-label={`Sign up with ${p.name}`}
          onClick={() => onClick(p.name)}
          className="w-full flex items-center justify-center gap-2
                     border border-gray-300 bg-gray-50
                     hover:bg-linear-to-r hover:from-teal-400 hover:to-cyan-500 hover:text-white
                     transition rounded-lg py-3 active:scale-95 shadow-sm"
        >
          {p.icon}
          <span className="text-sm font-medium">{p.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialButtons;
