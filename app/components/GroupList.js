import React from 'react';

const GroupList = ({ groups, onSelect, selectedGroup }) => {
  return (
    <ul className="group-list">
      {groups.map((group, index) => (
        <li
          key={index}
          className={selectedGroup === group ? 'selected' : ''}
          onClick={() => onSelect(group)}
        >
          {group}
        </li>
      ))}
    </ul>
  );
};

export default GroupList;
