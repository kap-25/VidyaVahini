
import React from 'react';
import { Play, Download, Bot, Briefcase } from 'lucide-react';
import T from '@/components/T';
import { Link } from 'react-router-dom';

const ActionButtons: React.FC = () => {
  const buttons = [
    { icon: <Play size={20} />, label: 'Continue', color: 'bg-edu-purple', path: '/my-courses' },
    { icon: <Download size={20} />, label: 'Offline', color: 'bg-edu-card-bg', path: '/my-courses' },
    { icon: <Bot size={20} />, label: 'AI Tutor', color: 'bg-edu-card-bg', path: '/edu-chat' },
    { icon: <Briefcase size={20} />, label: 'Jobs', color: 'bg-edu-card-bg', path: '/explore' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mt-6 mb-8">
      {buttons.map((button, index) => (
        <Link key={index} to={button.path}>
          <button
            className={`flex flex-col items-center rounded-lg py-3 w-full ${button.color} text-white`}
          >
            <div className="mb-1">{button.icon}</div>
            <span className="text-xs"><T>{button.label}</T></span>
          </button>
        </Link>
      ))}
    </div>
  );
};

export default ActionButtons;
