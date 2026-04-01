const getSkillColor = (num: number) => {
  switch (num) {
    case 0: {
      return 'white';
    }
    case 1: {
      return 'gray';
    }
    case 2: {
      return 'green';
    }
    case 3: {
      return '#367dbc';
    }
    case 4: {
      return 'purple';
    }
    case 5: {
      return '#b69a0e';
    }
    default: {
      return '#ff6000';
    }
  }
};

export { getSkillColor };
