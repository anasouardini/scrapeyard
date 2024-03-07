import React from 'react';

interface Props {
  name: string;
}
function Project(props: Props) {
  const style = {
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
    projectItem: {
      cursor: 'pointer',
      marginLeft: '2rem',
      padding: '2rem 3rem',
      border: '1px solid var(--clr-accent)',
      borderRadius: '0.6rem',
    },
  };

  return (
    <div style={style.projectItem}>
      <span style={style.title}>{props.name}</span>
    </div>
  );
}

export default Project;
