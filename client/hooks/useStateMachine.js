export const useStateMachine = () => {
  const currstate = 'init';

  const goToState = () => {
    switch (currstate) {
      case undefined:
        break;
      case 'init':
        break;
      case 'collided':
        break;
      case 'route_obstruction':
        break;
      case 'hcw':
        break;
      case 'lcw':
        break;
      default:
        break;
    }
  };

  return {goToState};
};
